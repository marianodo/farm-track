import { dbExec } from './db';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export type MutationItem = {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: any;
  headers?: string; // Stored as JSON string in database
  entity?: string;
  temp_id?: string; // temp id for created entity
  createdAt: number;
};

export const enqueueMutation = async (item: Omit<MutationItem, 'id' | 'createdAt'>) => {
  const id = uuidv4();
  const createdAt = Date.now();
  await dbExec(
    `INSERT INTO queue (id, method, url, body, headers, entity, temp_id, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [id, item.method, item.url, JSON.stringify(item.body ?? null), JSON.stringify(item.headers ?? {}), item.entity ?? null, item.temp_id ?? null, createdAt]
  );
  return id;
};

export const clearQueue = async (): Promise<void> => {
  await dbExec(`DELETE FROM queue;`);
  console.log('Queue cleared for testing');
};

export const getQueueLength = async (): Promise<number> => {
  const res = await dbExec(`SELECT COUNT(*) AS cnt FROM queue;`);
  return res.rows.item(0)?.cnt ?? 0;
};

const getServerIdForTemp = async (entity: string | null, tempId: string | null): Promise<string | null> => {
  if (!entity || !tempId) return null;
  const res = await dbExec(`SELECT server_id FROM id_map WHERE entity = ? AND temp_id = ?;`, [entity, tempId]);
  if (res.rows.length === 0) return null;
  return String(res.rows.item(0).server_id);
};

// Replace temp- ids in body fields like report_id
const remapBodyRefs = async (bodyObj: any): Promise<{ postponed: boolean; newBody: any }> => {
  if (!bodyObj || typeof bodyObj !== 'object') return { postponed: false, newBody: bodyObj };
  let postponed = false;
  const clone = Array.isArray(bodyObj) ? [...bodyObj] : { ...bodyObj };

  const visit = async (obj: any) => {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val && typeof val === 'object') { await visit(val); continue; }
      if (typeof val === 'string' && val.startsWith('temp-')) {
        let refEntity: string | null = null;
        if (key === 'report_id' || key === 'reportId') refEntity = 'report';
        if (key === 'field_id' || key === 'fieldId') refEntity = 'field';
        if (refEntity) {
          const serverId = await getServerIdForTemp(refEntity, val);
          if (!serverId) { postponed = true; continue; }
          obj[key] = refEntity === 'report' ? Number(serverId) : serverId;
        }
      }
    }
  };

  await visit(clone);
  return { postponed, newBody: clone };
};

export const processQueue = async (baseURL: string, authHeader?: string) => {
  try {
    console.log('Starting processQueue with baseURL:', baseURL);
    
    // Validar parámetros de entrada
    if (!baseURL) {
      console.error('processQueue called with empty baseURL');
      return;
    }
    
    const res = await dbExec(`SELECT * FROM queue ORDER BY createdAt ASC;`);
    const items: MutationItem[] = [];
    for (let i = 0; i < res.rows.length; i++) items.push(res.rows.item(i));

    console.log(`Processing queue with ${items.length} items`);
    
    if (items.length === 0) {
      console.log('Queue is empty, nothing to process');
      return;
    }
  
  // Log all items to see what's in the queue
  items.forEach((item, index) => {
    console.log(`Queue item ${index + 1}: ${item.method} ${item.url} (${item.entity}) - ${item.temp_id}`);
    if (item.body) {
      try {
        const bodyData = JSON.parse(item.body);
        console.log(`  Body data:`, bodyData);
      } catch (e) {
        console.log(`  Body parse error:`, e);
      }
    }
  });

  // Sort items: reports first, then measurements
  const sortedItems = items.sort((a, b) => {
    if (a.entity === 'report' && b.entity !== 'report') return -1;
    if (a.entity !== 'report' && b.entity === 'report') return 1;
    return a.createdAt - b.createdAt;
  });

  console.log(`Processing order: ${sortedItems.map(item => `${item.entity} (${item.temp_id})`).join(' -> ')}`);

  // Función auxiliar para reintentar con backoff exponencial
  const retryWithBackoff = async (fn: () => Promise<any>, maxRetries: number = 3): Promise<any> => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        console.log(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        
        // Si es el último intento, no esperar
        if (attempt === maxRetries) break;
        
        // Calcular delay con backoff exponencial (500ms, 1000ms, 2000ms)
        const delay = 500 * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };

  for (const item of sortedItems) {
    try {
      console.log(`Processing item: ${item.method} ${item.url}`, { entity: item.entity, temp_id: item.temp_id });
      
      const headers = {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(item.headers && item.headers !== 'null' ? JSON.parse(item.headers) : {}),
      } as Record<string, string>;
      const body = item.body ? JSON.parse(item.body) : undefined;

      // Remap temp ids in body before sending
      if (body) {
        const { postponed, newBody } = await remapBodyRefs(body);
        if (postponed) {
          console.log(`Postponing item ${item.id} - waiting for temp ID mapping`);
          continue; // Wait until mapping exists
        }
        item.body = JSON.stringify(newBody);
      }

      const url = baseURL.endsWith('/')
        ? `${baseURL}${item.url.replace(/^\//, '')}`
        : `${baseURL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`;

      console.log(`Making request to: ${url}`);
      console.log(`Request body:`, item.body ? JSON.parse(item.body) : 'No body');
      
      // Usar retryWithBackoff para los requests con un timeout más corto
      let response;
      await retryWithBackoff(async () => {
        // Crear un controlador de timeout para abortar la petición si tarda demasiado
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 5000); // 5 segundos de timeout
        
        try {
          const config = { 
            headers, 
            timeout: 5000, // 5 segundos de timeout
            signal: controller.signal
          };
          
          const parsedBody = item.body ? JSON.parse(item.body) : undefined;
          
          if (item.method === 'POST') {
            response = await axios.post(url, parsedBody, config);
          } else if (item.method === 'PUT') {
            response = await axios.put(url, parsedBody, config);
          } else if (item.method === 'PATCH') {
            response = await axios.patch(url, parsedBody, config);
          } else if (item.method === 'DELETE') {
            response = await axios.delete(url, config);
          } else {
            throw new Error(`Unsupported method: ${item.method}`);
          }
          
          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      }, 2); // 2 intentos máximo

      // map temp id for creates
      if (item.method === 'POST' && item.entity && item.temp_id && response?.data?.id) {
        console.log(`Mapping temp ID ${item.temp_id} to server ID ${response.data.id} for entity ${item.entity}`);
        await dbExec(`INSERT OR REPLACE INTO id_map (entity, temp_id, server_id) VALUES (?, ?, ?);`, [item.entity, item.temp_id, String(response.data.id)]);
      }

      // Success! Remove from queue
      await dbExec(`DELETE FROM queue WHERE id = ?;`, [item.id]);
      console.log(`Successfully processed item ${item.id}`);
      
      // If this was a report creation, check for offline measurements to sync
      if (item.entity === 'report' && item.method === 'POST' && item.temp_id) {
        console.log(`Report ${item.temp_id} synchronized, checking for offline measurements...`);
        
        // Import the report store to access offline measurements
        try {
          const reportStore = await import('../store/reportStore');
          const offlineMeasurements = reportStore.default.getState().getOfflineMeasurementsByReport(item.temp_id);
          
          if (offlineMeasurements.length > 0) {
            console.log(`Found ${offlineMeasurements.length} offline measurements for report ${item.temp_id}`);
            
            // Get the real report ID from the response
            const reportId = response.data?.id || response.data?.report?.id;
            if (reportId) {
              // Enqueue all offline measurements for this report
              for (const measurement of offlineMeasurements) {
                const measurementData = {
                  ...measurement.data,
                  report_id: reportId, // Use the real report ID
                };
                
                // Verificar que tengamos todos los campos requeridos por el backend
                if (!measurementData.subject_id) {
                  console.warn('Missing subject_id in measurement, adding default value 1');
                  measurementData.subject_id = 1; // Valor por defecto si no existe
                }
                
                await enqueueMutation({
                  method: 'POST',
                  url: '/measurements',
                  body: {
                    ...measurementData,
                    report_id: Number(reportId), // Ensure report_id is number for backend
                    value: String(measurementData.value), // Ensure value is string as backend expects
                    subject_id: Number(measurementData.subject_id), // Ensure subject_id is number
                  },
                  entity: 'measurement',
                  temp_id: measurement.id,
                });
                
                console.log(`Enqueued measurement ${measurement.id} for report ${reportId}`);
              }
              
              // Remove the offline measurements from local storage
              offlineMeasurements.forEach((m: any) => reportStore.default.getState().removeOfflineMeasurement(m.id));
              
              // Update pending count
              const syncStore = await import('../store/syncStore');
              syncStore.default.getState().setPending(offlineMeasurements.length);
            }
          }
        } catch (error) {
          console.error('Error processing offline measurements:', error);
        }
      }
      
    } catch (err: any) {
      console.log(`Processing queue item ${item.id} failed:`, err?.message || err);
      console.log(`Item details:`, { method: item.method, url: item.url, entity: item.entity, temp_id: item.temp_id });
      
      const status = err?.response?.status;
      const msg = String(err?.response?.data?.message || '');
      const idempotent = (item.method === 'POST' && (status === 400 || status === 409) && msg.toLowerCase().includes('already')) ||
                         ((item.method === 'DELETE' || item.method === 'PATCH' || item.method === 'PUT') && status === 404);
      
      if (idempotent) {
        console.log(`Removing idempotent item ${item.id} due to ${status} error`);
        await dbExec(`DELETE FROM queue WHERE id = ?;`, [item.id]);
        continue;
      }
      
      // Para errores de red, marcar para reintento pero continuar con otros items
      if (!status || err.message.includes('Network Error') || err.message.includes('timeout')) {
        console.log(`Network error for item ${item.id}, will retry later`);
        continue;
      }
      
      // Para otros errores, intentar eliminar el item si parece ser un problema permanente
      if (status >= 400 && status < 500) {
        console.log(`Client error (${status}) for item ${item.id}, removing from queue`);
        await dbExec(`DELETE FROM queue WHERE id = ?;`, [item.id]);
        continue;
      }
      
      // Don't throw - just log and continue with next item
      console.log(`Item ${item.id} failed but will retry later`);
    }
  }
  
  // Get final queue length
  const finalLength = await getQueueLength();
  console.log(`Queue processing complete. Remaining items: ${finalLength}`);
  
  // Actualizar el contador de pendientes en la UI
  try {
    const syncStore = await import('../store/syncStore');
    syncStore.default.getState().setPending(finalLength);
  } catch (error) {
    console.error('Error updating sync indicator:', error);
  }
  
  } catch (error) {
    // Capturar cualquier error no manejado para evitar que la app se reinicie
    console.error('CRITICAL ERROR in processQueue:', error);
    
    // Intentar actualizar el indicador de sincronización para mostrar que ha terminado
    try {
      const syncStore = await import('../store/syncStore');
      syncStore.default.getState().setSyncing(false);
    } catch (e) {
      console.error('Failed to update sync indicator after error:', e);
    }
  }
}; 