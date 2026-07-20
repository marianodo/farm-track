import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../../prisma/prisma.service';
import { FieldRepository } from '../../field/repository/field.repository';
import { ChatMessageDto, ChatResponseDto } from '../dto/chatbot.dto';
import { getAnthropicConfig } from '../../config/env.config';

/** One measurement row as returned by the field dataset queries. */
type MeasurementRow = {
  variable: string;
  measured_value: string | number;
  pen_name: string;
  type_of_object: string;
  report_id: number | string;
  measure_date: string;
  correct: number | string;
  optimal_values?: string[] | null;
  optimo_min?: number | null;
  optimo_max?: number | null;
  min_value?: number | null;
  max_value?: number | null;
};

const isCorrect = (m: MeasurementRow) =>
  String(m.correct) === '1' || String(m.correct) === 'true';

const pct = (rows: MeasurementRow[]) =>
  rows.length
    ? Math.round((rows.filter(isCorrect).length / rows.length) * 100)
    : 0;

const SYSTEM_PROMPT = `Eres un asesor experto en ganadería que analiza mediciones de bienestar animal de un campo real.

CÓMO FUNCIONAN LOS DATOS:
- Un CAMPO tiene CORRALES. En cada corral se miden VARIABLES sobre ANIMALES ("Animal") o INSTALACIONES ("Installation").
- Cada variable tiene un RANGO ÓPTIMO. Numéricas: optimo_min–optimo_max. Categóricas: una lista de valores óptimos.
- Una medición es CORRECTA si cae dentro del rango óptimo, INCORRECTA si queda fuera.
- Las mediciones se agrupan en REPORTES (fotos en el tiempo), lo que permite ver evolución.
- El score de bienestar = (mediciones correctas / total) × 100. Referencia: >=80% óptimo, 60-79% atención, <60% crítico.
- OJO con muestras chicas: un corral o variable con pocas mediciones (ej. 1-3) puede dar 0% o 100%
  sin que eso sea representativo. Cuando el "n" sea bajo, aclaralo explícitamente
  (ej. "con una sola medición, no da para sacar conclusiones firmes") y evitá alarmar o
  recomendar acciones fuertes basado solo en eso. Priorizá y confiá más en los grupos con
  más mediciones.

ALCANCE (importante):
- Solo podés hablar del campo cuyos datos te paso. No compares con otros campos ni inventes datos de otros.
- Si te preguntan por otro campo, aclarale al usuario que tiene que seleccionarlo en el dashboard.

CÓMO RESPONDER:
- Basate ÚNICAMENTE en los datos que te paso. No inventes valores ni mediciones que no estén.
- Sé concreto: nombrá el corral, la variable y el número. Nada de generalidades.
- Tenés el histórico completo reporte por reporte: usalo para hablar de EVOLUCIÓN y TENDENCIAS
  (qué mejoró, qué empeoró, desde cuándo), no solo de la foto actual.
- Cuando el usuario pregunte por "ahora" o "el estado actual", usá el reporte más reciente.
- Priorizá lo que está peor y explicá por qué importa.
- Cerrá con recomendaciones accionables para el productor.
- Si los datos no alcanzan para responder, decilo claramente en vez de suponer.
- Tenés la conversación previa: si el usuario repregunta ("¿y el corral 2?"), interpretalo en ese contexto.
- Escribí en español rioplatense, claro y directo. Usá markdown cuando ayude a la lectura.
- Para desvíos graves usá el prefijo "🚨 ALERTA:" y para moderados "⚠️ ADVERTENCIA:" al inicio del renglón.`;

@Injectable()
export class ChatbotService {
  private readonly client: Anthropic | null;
  private readonly config = getAnthropicConfig();

  constructor(
    private prisma: PrismaService,
    private fieldRepository: FieldRepository,
  ) {
    this.client = this.config.apiKey ? new Anthropic() : null;
    console.log(
      `Chatbot using Claude model: ${this.config.model} (key ${this.config.apiKey ? 'set' : 'MISSING'})`,
    );
  }

  async processMessage(
    chatMessageDto: ChatMessageDto,
    userId: string,
  ): Promise<ChatResponseDto> {
    try {
      if (!this.client) {
        return {
          response:
            'El asistente no está configurado: falta ANTHROPIC_API_KEY en el servidor.',
          sources: [],
          alerts: [],
        };
      }

      // Verify the field exists AND belongs to the requesting user.
      const field = await this.prisma.field.findFirst({
        where: { id: chatMessageDto.fieldId, userId },
        include: { user: true },
      });

      if (!field) {
        return {
          response: 'No se encontró el campo indicado o no tenés acceso a él.',
          sources: [],
          alerts: [],
        };
      }

      // Reuse the same dataset queries that power the dashboard.
      const [categorical, numerical] = await Promise.all([
        this.fieldRepository.getCategoricalMeasurementsByFieldId(
          chatMessageDto.fieldId,
        ),
        this.fieldRepository.getNumericalMeasurementsByFieldId(
          chatMessageDto.fieldId,
        ),
      ]);

      const measurements: MeasurementRow[] = [
        ...(categorical || []),
        ...(numerical || []),
      ];

      if (!measurements.length) {
        return {
          response: `El campo **${field.name}** todavía no tiene mediciones cargadas, así que no hay nada para analizar.`,
          sources: [],
          alerts: [],
        };
      }

      const dataContext = this.buildDataContext(field, measurements);

      // The field data goes in the system prompt so it stays constant across
      // the conversation and gets cached; only the turns vary.
      const system = [
        { type: 'text', text: SYSTEM_PROMPT },
        {
          type: 'text',
          text:
            `Estos son los datos del campo sobre el que te van a preguntar. ` +
            `Respondé SIEMPRE sobre este campo y ningún otro.\n\n${dataContext}`,
          cache_control: { type: 'ephemeral' },
        },
      ];

      // Replay previous turns so follow-up questions keep their context.
      const priorTurns = (chatMessageDto.history ?? [])
        .filter((h) => h.content?.trim())
        .slice(-20)
        .map((h) => ({ role: h.role, content: h.content }));

      const message = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        system,
        thinking: { type: 'adaptive' },
        output_config: { effort: this.config.effort },
        messages: [
          ...priorTurns,
          { role: 'user', content: chatMessageDto.message },
        ],
      } as any);

      if ((message as any).stop_reason === 'refusal') {
        return {
          response:
            'No puedo responder esa consulta. Probá reformularla enfocándote en el análisis de tus mediciones.',
          sources: [],
          alerts: [],
        };
      }

      const text = (message.content as any[])
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');

      return {
        response: text,
        sources: [],
        alerts: this.extractAlerts(text),
      };
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      return {
        response: this.friendlyError(error),
        sources: [],
        alerts: [],
      };
    }
  }

  /** Build a compact, aggregated summary of the field's measurements. */
  private buildDataContext(field: any, all: MeasurementRow[]): string {
    const parts: string[] = [];

    parts.push(
      `## Campo: ${field.name}\n` +
        `- Tipo de producción: ${field.production_type ?? 'N/D'}\n` +
        `- Raza: ${field.breed ?? 'N/D'}\n` +
        `- Animales declarados: ${field.number_of_animals ?? 'N/D'}\n` +
        `- Mediciones totales: ${all.length}`,
    );

    // Reports, chronological by id.
    const reportIds = [...new Set(all.map((m) => String(m.report_id)))].sort(
      (a, b) => Number(a) - Number(b),
    );
    const latestId = reportIds[reportIds.length - 1];
    const latest = all.filter((m) => String(m.report_id) === latestId);

    parts.push(
      `## Evolución por reporte (score de bienestar)\n` +
        reportIds
          .map((id) => {
            const rows = all.filter((m) => String(m.report_id) === id);
            const date = rows[0]?.measure_date
              ? new Date(rows[0].measure_date).toLocaleDateString('es-AR')
              : `Reporte ${id}`;
            return `- ${date} (reporte ${id}): ${pct(rows)}% correcto (${rows.filter(isCorrect).length}/${rows.length})`;
          })
          .join('\n'),
    );

    // Reference table of every variable with its optimal range (stated once).
    const allVariables = [...new Set(all.map((m) => m.variable))].filter(
      Boolean,
    );
    parts.push(
      `## Variables medidas y sus rangos óptimos\n` +
        allVariables
          .map((v) => {
            const s = all.find((m) => m.variable === v)!;
            const range = s.optimal_values?.length
              ? `óptimo: ${s.optimal_values.join(', ')}`
              : s.optimo_min != null || s.optimo_max != null
                ? `óptimo ${s.optimo_min}-${s.optimo_max}` +
                  (s.min_value != null
                    ? ` (escala ${s.min_value}-${s.max_value})`
                    : '')
                : 'sin rango definido';
            return `- **${v}** (${s.type_of_object}): ${range}`;
          })
          .join('\n'),
    );

    // Full history: per-report breakdown by pen and by variable, so questions
    // like "cómo evolucionó la cojera en el corral 3" are answerable.
    parts.push(
      `## Detalle por reporte (histórico completo, del más viejo al más reciente)`,
    );

    for (const id of reportIds) {
      const rows = all.filter((m) => String(m.report_id) === id);
      const date = rows[0]?.measure_date
        ? new Date(rows[0].measure_date).toLocaleDateString('es-AR')
        : `Reporte ${id}`;
      const isLatest = id === latestId;

      const penLines = [...new Set(rows.map((m) => m.pen_name))]
        .filter(Boolean)
        .map((pen) => {
          const r = rows.filter((m) => m.pen_name === pen);
          return { pen, p: pct(r), n: r.length };
        })
        .sort((a, b) => a.p - b.p)
        .map((r) => `    - ${r.pen}: ${r.p}% (${r.n} med.)`)
        .join('\n');

      const varLines = [...new Set(rows.map((m) => m.variable))]
        .filter(Boolean)
        .map((v) => {
          const r = rows.filter((m) => m.variable === v);
          return { v, p: pct(r), n: r.length };
        })
        .sort((a, b) => a.p - b.p)
        .map((r) => `    - ${r.v}: ${r.p}% (${r.n} med.)`)
        .join('\n');

      parts.push(
        `### ${date} — reporte ${id}${isLatest ? ' (EL MÁS RECIENTE)' : ''} — score ${pct(rows)}%\n` +
          `  Por corral (peor -> mejor):\n${penLines}\n` +
          `  Por variable (peor -> mejor):\n${varLines}`,
      );
    }

    // Concrete out-of-range measurements, grouped so the list stays short.
    const bad = latest.filter((m) => !isCorrect(m));
    if (bad.length) {
      const grouped = new Map<string, { n: number; sample: MeasurementRow }>();
      for (const m of bad) {
        const key = `${m.variable}|${m.pen_name}`;
        const g = grouped.get(key);
        if (g) g.n++;
        else grouped.set(key, { n: 1, sample: m });
      }
      parts.push(
        `### Mediciones fuera de rango en el último reporte (${bad.length})\n` +
          [...grouped.values()]
            .sort((a, b) => b.n - a.n)
            .slice(0, 30)
            .map(({ n, sample: s }) => {
              const range = s.optimal_values?.length
                ? `óptimo: ${s.optimal_values.join(', ')}`
                : `óptimo ${s.optimo_min}-${s.optimo_max}`;
              return `- ${s.variable} en ${s.pen_name}: valor "${s.measured_value}" (${range}) — ${n} caso(s)`;
            })
            .join('\n'),
      );
    }

    return parts.join('\n\n');
  }

  private extractAlerts(text: string) {
    const alerts: { type: string; message: string }[] = [];
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (/ALERTA:/i.test(line)) {
        alerts.push({
          type: 'CRITICAL',
          message: line.replace(/.*ALERTA:/i, '').trim(),
        });
      } else if (/ADVERTENCIA:/i.test(line)) {
        alerts.push({
          type: 'WARNING',
          message: line.replace(/.*ADVERTENCIA:/i, '').trim(),
        });
      }
    }
    return alerts;
  }

  private friendlyError(error: unknown): string {
    const anyErr = error as any;
    if (anyErr?.status === 401)
      return 'La API key de Anthropic es inválida. Revisá ANTHROPIC_API_KEY.';
    if (anyErr?.status === 404)
      return `El modelo "${this.config.model}" no existe o no está disponible para tu cuenta. Revisá ANTHROPIC_MODEL.`;
    if (anyErr?.status === 429)
      return 'Se alcanzó el límite de uso de la API. Esperá unos segundos y volvé a intentar.';
    return 'Hubo un error al procesar tu consulta. Por favor, intentá de nuevo.';
  }
}
