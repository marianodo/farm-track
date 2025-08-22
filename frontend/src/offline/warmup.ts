import NetInfo from '@react-native-community/netinfo';
import { setCache } from './cache';
import { axiosInstance } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';

export const warmUpData = async () => {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return; // solo warm-up online

  const { default: useTypeOfObjectStore } = await import('@/store/typeOfObjectStore');
  const { default: useVariableStore } = await import('@/store/variableStore');
  const { default: usePenStore } = await import('@/store/penStore');
  const { default: useReportStore } = await import('@/store/reportStore');
  const { default: usePenVarTypeStore } = await import('@/store/pen_variable_typeOfObject_store');

  const userId = useAuthStore.getState().userId;
  if (!userId) return;

  try {
    await useFieldStore.getState().getFieldsByUser(userId, true);

    const fields = useFieldStore.getState().fieldsByUserId || [];

    await Promise.all([
      useTypeOfObjectStore.getState().getAllTypeOfObjects(true),
      useVariableStore.getState().getAllVariables(true),
    ]);

    for (const f of fields) {
      // Traer pens con objetos para tener mapeo de typeOfObjectId
      await usePenStore.getState().getAllPens(f.id, undefined, true, true);
      await useReportStore.getState().getAllReportsByField(f.id, true);

      const pensByField = usePenStore.getState().pens?.[f.id] || [];
      const too = (useTypeOfObjectStore.getState() as any).typeOfObjects || [];

      // Precachear combinaciones type-of-object x pen
      for (const pen of pensByField) {
        for (const t of too) {
          try {
            await usePenVarTypeStore.getState().getPenVariableTypeOfObjectsByObjectIdAndPen(t.id, Number(pen.id), true);
          } catch {}
        }
      }
    }
  } catch (e) {
    // Warm-up best effort
  }
};

const TTL_1H = 60 * 60 * 1000;

export const warmUpMeasurementData = async () => {
  const userId = useAuthStore.getState().userId;
  if (!userId) return;

  // User-level datasets
  const [fieldsRes, toRes, varRes] = await Promise.all([
    axiosInstance.get(`/fields/byUserId/${userId}`),
    axiosInstance.get(`/type-of-objects/byUser/${userId}`),
    axiosInstance.get(`/variables/byUser/${userId}`),
  ]);

  await setCache(`fields_byUser_${userId}`, fieldsRes.data, TTL_1H);
  await setCache(`type_of_objects_byUser_${userId}`, toRes.data, TTL_1H);
  await setCache(`variables_byUser_${userId}`, varRes.data, TTL_1H);

  // Pens per field (with objects)
  const fields = fieldsRes.data as Array<{ id: string }>;
  await Promise.all(fields.map(async (f) => {
    const pens = await axiosInstance.get(`/pens/byField/${f.id}`, { params: { withObjects: true } });
    await setCache(`pens_byField_${f.id}_withObjects`, pens.data, TTL_1H);
    
    // Precache pen-variable-type-of-object relationships for each pen and type of object
    const pensData = pens.data;
    const typeOfObjects = toRes.data;
    
    for (const pen of pensData) {
      for (const typeOfObject of typeOfObjects) {
        try {
          const penVarTypeRes = await axiosInstance.get(
            `/pens-variables-type-of-objects/type-of-object/${typeOfObject.id}/${pen.id}`
          );
          await setCache(
            `pen_variables_type_of_object_${typeOfObject.id}_${pen.id}`,
            penVarTypeRes.data,
            TTL_1H
          );
        } catch (error) {
          // Skip if this combination doesn't exist
          console.log(`No pen-variable-type-of-object for pen ${pen.id} and type ${typeOfObject.id}`);
        }
      }
    }
  }));
}; 