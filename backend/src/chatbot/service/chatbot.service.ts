import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatMessageDto, ChatResponseDto } from '../dto/chatbot.dto';
import OpenAI from 'openai';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    // Initialize OpenAI - you'll need to set OPENAI_API_KEY in your environment
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processMessage(chatMessageDto: ChatMessageDto, userId: string): Promise<ChatResponseDto> {
    try {
      // Get user's data for specific field
      const userData = await this.getUserData(userId, chatMessageDto.fieldId);
      
      // Create context for AI
      const context = this.createContext(userData);
      
      // Generate AI response
      const aiResponse = await this.generateAIResponse(chatMessageDto.message, context);
      
      return {
        response: aiResponse,
        alerts: this.extractAlerts(userData),
        recommendations: this.extractRecommendations(userData),
        data: userData
      };
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      return {
        response: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
        alerts: [],
        recommendations: []
      };
    }
  }

  private async getUserData(userId: string, fieldId: string) {
    // Get field info
    const field = await this.prisma.field.findFirst({
      where: { 
        userId,
        id: fieldId
      }
    });

    if (!field) {
      throw new Error('Field not found or access denied');
    }

    // Get measurements using the same logic as the dashboard
    const categoricalQuery = `
      SELECT
        m.subject_id,
        too.name AS type_of_object,
        v.name AS variable,
        m.value AS measured_value,
        p.name AS pen_name,
        f.name AS field_name,
        m.report_id AS report_id,
        r.name AS report_name,
        r.created_at AS report_date,
        m.created_at::timestamp AS measure_date,
        string_to_array(TRIM(BOTH '[]' FROM (pvtoo.custom_parameters -> 'value' ->> 'categories')), ',') AS categories,
        string_to_array(TRIM(BOTH '[]' FROM REPLACE((pvtoo.custom_parameters -> 'value' ->> 'optimal_values'), '"', '')), ',') AS optimal_values,
        CASE
          WHEN LOWER(TRIM(m.value)) IN (SELECT TRIM(LOWER(unnest(string_to_array(TRIM(BOTH '[]' FROM REPLACE((pvtoo.custom_parameters -> 'value' ->> 'optimal_values'), '"', '')), ','))))) THEN 1
          ELSE 0
        END AS correct
      FROM "Measurement" m
      JOIN "PenVariableTypeOfObject" pvtoo ON pvtoo.id = m.pen_variable_type_of_object_id
      JOIN "Variable" v ON pvtoo."variableId" = v.id
      JOIN "Report" r ON m.report_id = r.id
      JOIN "Pen" p ON pvtoo."penId" = p.id
      JOIN "TypeOfObject" too ON pvtoo."typeOfObjectId" = too.id
      JOIN "Field" f ON f.id = r.field_id
      WHERE v.type = 'CATEGORICAL'
      AND r.field_id = $1
    `;

    const numericalQuery = `
      SELECT
        m.subject_id,
        too.name AS type_of_object,
        v.name AS variable,
        m.value::numeric AS measured_value,
        p.name AS pen_name,
        f.name AS field_name,
        m.report_id AS report_id,
        r.name AS report_name,
        r.created_at AS report_date,
        m.created_at::timestamp AS measure_date,
        (pvtoo.custom_parameters -> 'value' ->> 'max')::numeric AS max_value,
        (pvtoo.custom_parameters -> 'value' ->> 'min')::numeric AS min_value,
        (pvtoo.custom_parameters -> 'value' ->> 'optimal_max')::numeric AS optimo_max,
        (pvtoo.custom_parameters -> 'value' ->> 'optimal_min')::numeric AS optimo_min,
        CASE
          WHEN m.value::numeric >= (pvtoo.custom_parameters -> 'value' ->> 'optimal_min')::numeric
            AND m.value::numeric <= (pvtoo.custom_parameters -> 'value' ->> 'optimal_max')::numeric
          THEN 1
          ELSE 0
        END AS correct
      FROM "Measurement" m
      JOIN "PenVariableTypeOfObject" pvtoo ON pvtoo.id = m.pen_variable_type_of_object_id
      JOIN "Variable" v ON pvtoo."variableId" = v.id
      JOIN "Report" r ON m.report_id = r.id
      JOIN "Pen" p ON pvtoo."penId" = p.id
      JOIN "TypeOfObject" too ON pvtoo."typeOfObjectId" = too.id
      JOIN "Field" f ON f.id = r.field_id
      WHERE v.type = 'NUMBER'
      AND r.field_id = $1
    `;

    const [categoricalData, numericalData] = await Promise.all([
      this.prisma.$queryRawUnsafe(categoricalQuery, fieldId),
      this.prisma.$queryRawUnsafe(numericalQuery, fieldId)
    ]);

    console.log('Categorical data count:', (categoricalData as any[]).length);
    console.log('Numerical data count:', (numericalData as any[]).length);

    // Normalize data to match dashboard format
    const normalizeData = (data: any[]) => {
      return data.map(m => ({
        variable: m.variable,
        value: m.measured_value,
        measureDate: m.measure_date,
        pen: m.pen_name,
        correct: m.correct,
        type_of_object: m.type_of_object,
        report_id: m.report_id,
        report_name: m.report_name,
        report_date: m.report_date,
        optimal_values: m.optimal_values || m.optimal_values === '' ? 
          (Array.isArray(m.optimal_values) ? m.optimal_values : 
          (typeof m.optimal_values === 'string' ? m.optimal_values.split(',').map((s: string) => s.trim()).filter(Boolean) : [])) : 
          undefined,
        optimo_min: m.optimo_min !== undefined ? Number(m.optimo_min) : undefined,
        optimo_max: m.optimo_max !== undefined ? Number(m.optimo_max) : undefined,
        min: m.min !== undefined && m.min !== null ? Number(m.min) : undefined,
        max: m.max !== undefined && m.max !== null ? Number(m.max) : undefined,
      }));
    };

    const combinedData = [
      ...normalizeData(categoricalData as any[]),
      ...normalizeData(numericalData as any[])
    ];

    console.log('Combined measurements count:', combinedData.length);
    console.log('Sample measurements:', combinedData.slice(0, 3));

    return { 
      fields: [{ 
        ...field, 
        measurements: combinedData 
      }], 
      reports: [] 
    };
  }

  private createContext(userData: any): string {
    const { fields } = userData;
    
    console.log('Creating context with fields:', fields.map((f: any) => ({
      name: f.name,
      reportsCount: f.reports?.length || 0,
      measurementsCount: f.reports?.reduce((acc: number, r: any) => acc + (r.measurements?.length || 0), 0) || 0
    })));
    
    let context = `Eres un asistente experto en salud ganadera y gestión de campos. Analiza los siguientes datos del usuario:\n\n`;
    
    // Add fields and pens info
    context += `CAMPOS Y CORRALES:\n`;
    fields.forEach((field: any) => {
      context += `- Campo: ${field.name} (${field.production_type || 'N/A'})\n`;
      
      // Get all measurements for this field
      const allMeasurements = field.measurements || [];
      
      console.log(`Field ${field.name} - Total measurements:`, allMeasurements.length);
      console.log('Sample measurements:', allMeasurements.slice(0, 3).map((m: any) => ({
        value: m.value,
        correct: m.correct,
        pen: m.pen,
        variable: m.variable
      })));
      
      // Group measurements by pen
      const measurementsByPen = this.groupMeasurementsByPen(allMeasurements);
      
      Object.entries(measurementsByPen).forEach(([penName, measurements]: [string, any[]]) => {
        const totalMeasurements = measurements.length;
        const correctMeasurements = measurements.filter((m: any) => 
          String(m.correct) === '1' || String(m.correct) === 'true'
        ).length;
        const percentage = totalMeasurements > 0 ? Math.round((correctMeasurements / totalMeasurements) * 100) : 0;
        
        context += `  - Corral ${penName}: ${correctMeasurements}/${totalMeasurements} correctas (${percentage}%)\n`;
      });
    });

    // Add report information with detailed pen breakdown
    context += `\nINFORMACIÓN DETALLADA DE REPORTES:\n`;
    fields.forEach((field: any) => {
      const allMeasurements = field.measurements || [];
      
      // Group measurements by report
      const measurementsByReport: { [reportId: string]: any[] } = {};
      allMeasurements.forEach(measurement => {
        const reportId = measurement.report_id;
        if (!measurementsByReport[reportId]) {
          measurementsByReport[reportId] = [];
        }
        measurementsByReport[reportId].push(measurement);
      });
      
      // Sort reports by date to identify the latest one
      const sortedReports = Object.entries(measurementsByReport).sort((a, b) => {
        const dateA = new Date(a[1][0]?.report_date || 0);
        const dateB = new Date(b[1][0]?.report_date || 0);
        return dateB.getTime() - dateA.getTime(); // Latest first
      });
      
      sortedReports.forEach(([reportId, measurements], index) => {
        const firstMeasurement = measurements[0];
        const reportName = firstMeasurement.report_name || `Reporte ${reportId}`;
        const reportDate = firstMeasurement.report_date ? new Date(firstMeasurement.report_date).toLocaleDateString() : 'Fecha desconocida';
        
        const totalMeasurements = measurements.length;
        const correctMeasurements = measurements.filter((m: any) => 
          String(m.correct) === '1' || String(m.correct) === 'true'
        ).length;
        const incorrectMeasurements = totalMeasurements - correctMeasurements;
        const percentage = totalMeasurements > 0 ? Math.round((correctMeasurements / totalMeasurements) * 100) : 0;
        
        const isLatest = index === 0;
        context += `- ${reportName} (${reportDate})${isLatest ? ' [ÚLTIMO REPORTE]' : ''}: ${correctMeasurements}/${totalMeasurements} correctas (${percentage}%)\n`;
        
        // Add pen breakdown for this report
        const measurementsByPen = this.groupMeasurementsByPen(measurements);
        Object.entries(measurementsByPen).forEach(([penName, penMeasurements]) => {
          const penTotal = penMeasurements.length;
          const penCorrect = penMeasurements.filter((m: any) => 
            String(m.correct) === '1' || String(m.correct) === 'true'
          ).length;
          const penIncorrect = penTotal - penCorrect;
          const penPercentage = penTotal > 0 ? Math.round((penCorrect / penTotal) * 100) : 0;
          
          context += `  - Corral ${penName}: ${penCorrect}/${penTotal} correctas (${penPercentage}%) - ${penIncorrect} fuera de rango\n`;
        });
      });
    });

    // Add recent measurements analysis
    context += `\nMEDICIONES RECIENTES:\n`;
    fields.forEach((field: any) => {
      const allMeasurements = field.measurements || [];
      const measurementsByPen = this.groupMeasurementsByPen(allMeasurements);
      
      Object.entries(measurementsByPen).forEach(([penName, measurements]: [string, any[]]) => {
        const recentMeasurements = measurements.slice(0, 10); // Last 10 measurements
        if (recentMeasurements.length > 0) {
          context += `- Corral ${penName}:\n`;
          recentMeasurements.forEach((measurement: any) => {
            const variableName = measurement.variable || 'Variable';
            const reportName = measurement.report_name || `Reporte ${measurement.report_id}`;
            const isCorrect = String(measurement.correct) === '1' || String(measurement.correct) === 'true';
            context += `  - ${variableName}: ${measurement.value} (${isCorrect ? 'Correcto' : 'Incorrecto'}) - ${reportName}\n`;
          });
        }
      });
    });

    // Add alerts and recommendations
    context += `\nALERTAS Y RECOMENDACIONES:\n`;
    const alerts = this.extractAlerts(userData);
    const recommendations = this.extractRecommendations(userData);
    
    alerts.forEach(alert => {
      context += `- ALERTA: ${alert}\n`;
    });
    
    recommendations.forEach(rec => {
      context += `- RECOMENDACIÓN: ${rec}\n`;
    });

    context += `\nINSTRUCCIONES IMPORTANTES PARA RESPONDER:\n`;
    context += `- SIEMPRE especifica si te refieres a un reporte específico o a un análisis general.\n`;
    context += `- Si mencionas problemas, indica si son en un reporte específico o en general.\n`;
    context += `- Usa frases como "En el reporte X..." o "A nivel general..." para ser claro.\n`;
    context += `- Si hay patrones que se repiten en varios reportes, menciónalo.\n`;
    context += `- IMPORTANTE: Los porcentajes se calculan como (correctas/total)*100. Si hay X mediciones fuera de rango, el porcentaje correcto es ((total-X)/total)*100.\n`;
    context += `- NO confundas el número de mediciones incorrectas con el porcentaje de precisión.\n`;
    context += `- Responde de manera clara, concisa y útil. Si hay problemas, sugiere acciones específicas.\n`;
    context += `- Usa un tono profesional pero amigable.`;

    return context;
  }

  private groupMeasurementsByPen(measurements: any[]): { [penName: string]: any[] } {
    const grouped: { [penName: string]: any[] } = {};
    
    measurements.forEach(measurement => {
      const penName = measurement.pen || 'Desconocido';
      if (!grouped[penName]) {
        grouped[penName] = [];
      }
      grouped[penName].push(measurement);
    });
    
    return grouped;
  }

  private async generateAIResponse(userMessage: string, context: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: context
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'No pude generar una respuesta.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback response
      return this.generateFallbackResponse(userMessage);
    }
  }

  private generateFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('corral') && (lowerMessage.includes('peor') || lowerMessage.includes('mal'))) {
      return 'Para identificar qué corral está peor, necesito analizar los datos de mediciones. Te sugiero revisar los porcentajes de mediciones correctas por corral en el dashboard.';
    }
    
    if (lowerMessage.includes('variable') && lowerMessage.includes('atención')) {
      return 'Las variables que necesitan atención son aquellas con menor porcentaje de mediciones correctas. Revisa el tab "Variables" para ver el detalle por variable.';
    }
    
    if (lowerMessage.includes('alerta')) {
      return 'Las alertas se generan cuando hay mediciones fuera del rango óptimo. Revisa los gráficos para identificar patrones problemáticos.';
    }
    
    if (lowerMessage.includes('salud') && lowerMessage.includes('general')) {
      return 'La salud general del campo se evalúa por el porcentaje promedio de mediciones correctas. Revisa el dashboard principal para ver el resumen.';
    }
    
    return 'Entiendo tu consulta. Para darte una respuesta más específica, revisa los datos en el dashboard o pregunta sobre algo más específico.';
  }

  private extractAlerts(userData: any): string[] {
    const alerts: string[] = [];
    const { fields } = userData;

    fields.forEach((field: any) => {
      const allMeasurements = field.measurements || [];
      
      // Group measurements by report for more specific alerts
      const measurementsByReport: { [reportId: string]: any[] } = {};
      allMeasurements.forEach(measurement => {
        const reportId = measurement.report_id;
        if (!measurementsByReport[reportId]) {
          measurementsByReport[reportId] = [];
        }
        measurementsByReport[reportId].push(measurement);
      });
      
      // Check each report
      Object.entries(measurementsByReport).forEach(([reportId, measurements]) => {
        const firstMeasurement = measurements[0];
        const reportName = firstMeasurement.report_name || `Reporte ${reportId}`;
        const reportDate = firstMeasurement.report_date ? new Date(firstMeasurement.report_date).toLocaleDateString() : 'Fecha desconocida';
        
        const totalMeasurements = measurements.length;
        const correctMeasurements = measurements.filter((m: any) => 
          String(m.correct) === '1' || String(m.correct) === 'true'
        ).length;
        const percentage = totalMeasurements > 0 ? Math.round((correctMeasurements / totalMeasurements) * 100) : 0;

        if (percentage < 70) {
          alerts.push(`En ${reportName} (${reportDate}): solo ${percentage}% de mediciones correctas`);
        }

        // Check for specific variable issues by report
        const variableIssues = this.analyzeVariableIssues(measurements);
        variableIssues.forEach(issue => {
          alerts.push(`En ${reportName}: ${issue}`);
        });
      });
      
      // Also check general field-level alerts
      const measurementsByPen = this.groupMeasurementsByPen(allMeasurements);
      Object.entries(measurementsByPen).forEach(([penName, measurements]: [string, any[]]) => {
        const totalMeasurements = measurements.length;
        const correctMeasurements = measurements.filter((m: any) => 
          String(m.correct) === '1' || String(m.correct) === 'true'
        ).length;
        const percentage = totalMeasurements > 0 ? Math.round((correctMeasurements / totalMeasurements) * 100) : 0;

        if (percentage < 70) {
          alerts.push(`A nivel general: Corral ${penName} tiene solo ${percentage}% de mediciones correctas`);
        }
      });
    });

    return alerts;
  }

  private extractRecommendations(userData: any): string[] {
    const recommendations: string[] = [];
    const { fields } = userData;

    fields.forEach((field: any) => {
      const allMeasurements = field.measurements || [];
      const measurementsByPen = this.groupMeasurementsByPen(allMeasurements);
      
      Object.entries(measurementsByPen).forEach(([penName, measurements]: [string, any[]]) => {
        const totalMeasurements = measurements.length;
        const correctMeasurements = measurements.filter((m: any) => 
          String(m.correct) === '1' || String(m.correct) === 'true'
        ).length;
        const percentage = totalMeasurements > 0 ? Math.round((correctMeasurements / totalMeasurements) * 100) : 0;

        if (percentage < 70) {
          recommendations.push(`Revisar protocolos en Corral ${penName} - solo ${percentage}% correcto`);
        }

        // Add specific recommendations based on variable issues
        const variableRecommendations = this.generateVariableRecommendations(measurements);
        variableRecommendations.forEach(rec => {
          recommendations.push(`Corral ${penName}: ${rec}`);
        });
      });
    });

    return recommendations;
  }

  private analyzeVariableIssues(measurements: any[]): string[] {
    const issues: string[] = [];
    const variableStats: { [key: string]: { total: number; correct: number } } = {};

    measurements.forEach(measurement => {
      const variableName = measurement.variable || 'Desconocida';
      if (!variableStats[variableName]) {
        variableStats[variableName] = { total: 0, correct: 0 };
      }
      variableStats[variableName].total++;
      if (String(measurement.correct) === '1' || String(measurement.correct) === 'true') {
        variableStats[variableName].correct++;
      }
    });

    Object.entries(variableStats).forEach(([variable, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      if (percentage < 60) {
        issues.push(`${variable}: ${percentage}% correcto`);
      }
    });

    return issues;
  }

  private generateVariableRecommendations(measurements: any[]): string[] {
    const recommendations: string[] = [];
    const variableStats: { [key: string]: { total: number; correct: number } } = {};

    measurements.forEach(measurement => {
      const variableName = measurement.variable || 'Desconocida';
      if (!variableStats[variableName]) {
        variableStats[variableName] = { total: 0, correct: 0 };
      }
      variableStats[variableName].total++;
      if (String(measurement.correct) === '1' || String(measurement.correct) === 'true') {
        variableStats[variableName].correct++;
      }
    });

    Object.entries(variableStats).forEach(([variable, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      if (percentage < 60) {
        recommendations.push(`Mejorar protocolos de ${variable}`);
      }
    });

    return recommendations;
  }
} 