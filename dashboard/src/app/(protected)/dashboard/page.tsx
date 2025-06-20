"use client";

import useFieldStore from "@/store/fieldStore";
import { useEffect, useState } from "react";
import RadialGauge from "./RadialGauge";
import { Tab } from "@headlessui/react";

type TabType = "general" | "pens" | "numerical";

interface Field {
    id: string;
    value: string;
    label: string;
}

interface AllFieldsOption {
    value: "all";
    label: string;
}

interface Measurement {
    variable: string;
    value: string | number;
    measureDate: string;
    pen: string;
    correct: number;
    type_of_object: string;
    report_id: string | number;
    optimal_values?: string[]; // categorical
    optimo_min?: number; // numeric
    optimo_max?: number; // numeric
}

interface HealthStatus {
    field: number;
    animal: number;
    installation: number;
}

interface DashboardStats {
    measurementsCount: number;
    pensCount: number;
    variablesCount: number;
    reportsCount: number;
    totalMeasurements: number;
    totalAnimals: number;
    totalInstallations: number;
    healthStatus: HealthStatus;
    correctionHistory: Array<{
        date: string;
        percentage: number;
    }>;
}

const tabs = [
    { key: "general" as TabType, label: "General" },
    { key: "pens" as TabType, label: "Corrales" },
    { key: "numerical" as TabType, label: "Variables Numéricas" },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function DashboardPage() {
    const [selectedField, setSelectedField] = useState<Field | AllFieldsOption>({
        value: "all",
        label: "Todos los campos",
    });
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState<TabType>("general");

    const { getFieldsByUser, fieldsByUserId, getCategoricalMeasurementsByFieldId, getNumericalMeasurementsByFieldId } = useFieldStore();

    useEffect(() => {
        const fetch = async () => {
            return await getFieldsByUser()
        }
        fetch()
    }, [getFieldsByUser])

    const allFieldsOption: AllFieldsOption = { value: "all", label: "Todos los campos" };
    
    const fields: (Field | AllFieldsOption)[] = [
        allFieldsOption,
        ...(fieldsByUserId ?? []).map((field): Field => ({
            id: field.id,
            value: field.name,
            label: field.name
        }))
    ];

    const handleFieldChange = async (value: string) => {
        const selected = fields.find(field => field.value === value);
        if (!selected) return;

        setSelectedField(selected);
        
        if (selected.value !== "all" && 'id' in selected) {
            setLoading(true);
            try {
                const [categoricalData, numericalData] = await Promise.all([
                    getCategoricalMeasurementsByFieldId(selected.id),
                    getNumericalMeasurementsByFieldId(selected.id)
                ]);
                const normalizeData = (data: any[]) => data.map(m => ({
    variable: m.variable,
    value: m.measured_value,
    measureDate: m.measure_date,
    pen: m.pen_name,
    correct: m.correct,
    type_of_object: m.type_of_object,
    report_id: m.report_id,
    optimal_values: m.optimal_values || m.optimal_values === '' ? (Array.isArray(m.optimal_values) ? m.optimal_values : (typeof m.optimal_values === 'string' ? m.optimal_values.split(',').map((s: string) => s.trim()).filter(Boolean) : [])) : undefined,
    optimo_min: m.optimo_min !== undefined ? Number(m.optimo_min) : undefined,
    optimo_max: m.optimo_max !== undefined ? Number(m.optimo_max) : undefined,
}));

                const combinedData = [
                    ...normalizeData(categoricalData),
                    ...normalizeData(numericalData)
                ];

                // Sort by date, most recent first
                combinedData.sort((a, b) => new Date(b.measureDate).getTime() - new Date(a.measureDate).getTime());
                
                setMeasurements(combinedData);
            } catch (error) {
                console.error('Error fetching measurements:', error);
                setMeasurements([]);
            } finally {
                setLoading(false);
            }
        } else {
            setMeasurements([]);
        }
    };

    return (
        <div className="flex flex-col w-full py-4 items-start justify-start">
            <h1 className="text-3xl font-bold mb-6 text-green-dark">Dashboard</h1>
            <div className="bg-white rounded-lg w-full shadow-md mb-6 p-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold">Analítica de Campos</h2>
                    <p className="text-gray-600">
                        Visualización de datos de campos agrícolas
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Seleccionar Campo:</label>
                    <select
                        value={selectedField.value}
                        onChange={(e) => handleFieldChange(e.target.value)}
                        className="w-full sm:w-72 p-2 border border-measure-green rounded-md focus:outline-none focus:ring-2 focus:ring-measure-green"
                    >
                        {fields.map((field: any, index) => (
                            <option key={field.id + index} value={field.value}>
                                {field.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 w-full border border-gray-200 rounded-md overflow-hidden bg-white p-4">
                    {selectedField.value === "all" ? (
                        <div className="h-[36rem] w-full flex justify-center items-center">
                            <h1>Seleccione un campo para ver las mediciones</h1>
                        </div>
                    ) : loading ? (
                        <div className="h-[36rem] w-full flex justify-center items-center">
                            <p>Cargando mediciones...</p>
                        </div>
                    ) : measurements.length === 0 ? (
                        <div className="h-[36rem] w-full flex justify-center items-center">
                            <p>No hay mediciones disponibles para este campo</p>
                        </div>
                    ) : (
                        <div className="w-full space-y-6">
                            <Tab.Group onChange={(index) => setSelectedTab(tabs[index].key)}>
                                <Tab.List className="flex space-x-1 rounded-xl bg-green-900/10 p-1 mb-4">
                                    {tabs.map((tab) => (
                                        <Tab
                                            key={tab.key}
                                            className={({ selected }) =>
                                                classNames(
                                                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-green-400 focus:outline-none focus:ring-2',
                                                    selected
                                                        ? 'bg-white shadow text-green-700'
                                                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                                                )
                                            }
                                        >
                                            {tab.label}
                                        </Tab>
                                    ))}
                                </Tab.List>
                                <Tab.Panels>
                                    <Tab.Panel>
    {/* General Tab - current report summary and historical data */}
    <div className="w-full space-y-6">
        {/* Latest Report Summary */}
        <div className="bg-white rounded-lg shadow p-6">
            {(() => {
    if (!measurements.length) return <h2 className="text-xl font-semibold mb-4">Último Reporte: -</h2>;
    const reportIds = measurements.map(m => m.report_id);
    const latestReportId = Math.max(...reportIds.map(Number));
    const latestMeasurements = measurements.filter(m => Number(m.report_id) === latestReportId);
    if (!latestMeasurements.length) return <h2 className="text-xl font-semibold mb-4">Último Reporte: -</h2>;
    // Use the date of the first measurement in the latest report
    const latestDate = new Date(latestMeasurements[0].measureDate).toLocaleDateString();
    return <h2 className="text-xl font-semibold mb-4">Último Reporte: {latestDate}</h2>;
})()}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Summary Stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Cantidad Mediciones</span>
                            <div className="flex items-center">
                                {(() => {
    if (!measurements.length) return <span className="text-2xl font-bold">0</span>;
    const reportIds = measurements.map(m => m.report_id);
    const latestReportId = Math.max(...reportIds.map(Number));
    const latestMeasurements = measurements.filter(m => Number(m.report_id) === latestReportId);
    return <span className="text-2xl font-bold">{latestMeasurements.length}</span>;
})()}
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Corrales</span>
                            <div className="flex items-center">
                                {(() => {
    if (!measurements.length) return <span className="text-2xl font-bold">0</span>;
    const reportIds = measurements.map(m => m.report_id);
    const latestReportId = Math.max(...reportIds.map(Number));
    const latestMeasurements = measurements.filter(m => Number(m.report_id) === latestReportId);
    const uniquePens = new Set(latestMeasurements.map(m => m.pen)).size;
    return <span className="text-2xl font-bold">{uniquePens}</span>;
})()}
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Variables Medidas</span>
                            <div className="flex items-center">
                                {(() => {
    if (!measurements.length) return <span className="text-2xl font-bold">0</span>;
    const reportIds = measurements.map(m => m.report_id);
    const latestReportId = Math.max(...reportIds.map(Number));
    const latestMeasurements = measurements.filter(m => Number(m.report_id) === latestReportId);
    const uniqueVariables = new Set(latestMeasurements.map(m => m.variable)).size;
    return <span className="text-2xl font-bold">{uniqueVariables}</span>;
})()}
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Health Status Gauges */}
                <div className="col-span-3 grid grid-cols-3 gap-4">

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Salud Actual del Campo</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-center w-full" style={{minHeight: '140px'}}>
  {(() => {
    if (!measurements.length) return <RadialGauge value={NaN} size={120} />;
    const correctCount = measurements.filter(m => String(m.correct) === '1' || m.correct === true).length;
    const percent = measurements.length > 0 ? Math.round((correctCount / measurements.length) * 100) : 0;
    return <RadialGauge value={percent} size={120} />;
  })()}
</div>
                            
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Salud Actual de Animales</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-center w-full" style={{minHeight: '140px'}}>
  {(() => {
    if (!measurements.length) return <RadialGauge value={NaN} label="Animales" color="#38bdf8" size={120} />;
    const animalMeasurements = measurements.filter(m => m.type_of_object === 'Animal');
    if (!animalMeasurements.length) return <RadialGauge value={NaN} size={120} />;
    const correctCount = animalMeasurements.filter(m => String(m.correct) === '1' || m.correct === true).length;
    const percent = animalMeasurements.length > 0 ? Math.round((correctCount / animalMeasurements.length) * 100) : 0;
    return <RadialGauge value={percent} size={120} />;
  })()}
</div>
                            
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Salud Actual de Instalaciones</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-center w-full" style={{minHeight: '140px'}}>
  {(() => {
    if (!measurements.length) return <RadialGauge value={NaN} label="Instalaciones" color="#f59e42" size={120} />;
    const installationMeasurements = measurements.filter(m => m.type_of_object === 'Installation');
    if (!installationMeasurements.length) return <RadialGauge value={NaN} size={120} />;
    const correctCount = installationMeasurements.filter(m => String(m.correct) === '1' || m.correct === true).length;
    const percent = installationMeasurements.length > 0 ? Math.round((correctCount / installationMeasurements.length) * 100) : 0;
    return <RadialGauge value={percent} size={120} />;
  })()}
</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Historical Data */}
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Histórico</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Historical Stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Reportes</span>
                            <div className="flex items-center">
                                {(() => {
    if (!measurements.length) return <span className="text-2xl font-bold">0</span>;
    const uniqueReportIds = new Set(measurements.map(m => m.report_id)).size;
    return <span className="text-2xl font-bold">{uniqueReportIds}</span>;
})()}
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Mediciones</span>
                            <div className="flex items-center">
                                {(() => {
    if (!measurements.length) return <span className="text-2xl font-bold">0</span>;
    return <span className="text-2xl font-bold">{measurements.length}</span>;
})()}
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Animales</span>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold">557</span>
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Instalación</span>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold">85</span>
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1v2h-1v-2zm1-2V7h-1v2h1zM5 7v2h1V7H5zm1 4H5v2h1v-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Correction Rate Chart */}
                <div className="col-span-3 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg h-full">
                        <h3 className="text-sm font-medium text-gray-500 mb-4">% Corrector por Reporte</h3>
                        <div className="h-64">
                            <div className="relative h-full">
                                <div className="absolute bottom-0 left-0 right-0 h-full flex items-end space-x-4">
                                    {(() => {
  if (!measurements.length) return null;
  // Group by report_id
  const grouped = measurements.reduce((acc, m) => {
    const id = m.report_id;
    if (!acc[id]) acc[id] = [];
    acc[id].push(m);
    return acc;
  }, {} as Record<string | number, Measurement[]>);
  // Sort by report_id (descending, assuming numeric)
  const sortedReportIds = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  // Show up to 5 most recent reports
  return sortedReportIds.slice(0, 5).reverse().map((reportId, index) => {
    const rows = grouped[reportId];
    const correctCount = rows.filter(m => String(m.correct) === '1' || m.correct === true).length;
    const percent = rows.length > 0 ? Math.round((correctCount / rows.length) * 100) : 0;
    const rawDate = rows[0]?.measureDate || '';
const date = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : '';
    return (
      <div key={reportId} className="flex-1 flex flex-col items-center">
  <div className="w-full flex items-end" style={{ height: 120 }}>
    <div className="w-full bg-green-400 rounded-t" style={{ height: `${percent}%` }} />
  </div>
  <div className="text-xs text-gray-500 mt-1">{percent}%</div>
  <div className="text-xs text-gray-500">{date}</div>
</div>
    );
  });
})()}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {/* Latest Report Measurements Table */}
    <div className="mt-8">
      {(() => {
        if (!measurements.length) return null;
        const reportIds = measurements.map(m => m.report_id);
        const latestReportId = Math.max(...reportIds.map(Number));
        const latestMeasurements = measurements.filter(m => Number(m.report_id) === latestReportId);
        if (!latestMeasurements.length) return null;
        return (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2">Mediciones del Último Reporte</h3>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Variable</th>
                  <th className="py-2 px-4 border-b">Valor</th>
                  <th className="py-2 px-4 border-b">Corral</th>
                  <th className="py-2 px-4 border-b">Fecha</th>
                  <th className="py-2 px-4 border-b">¿Correcto?</th>
<th className="py-2 px-4 border-b">Optimal Value</th>
                </tr>
              </thead>
              <tbody>
                {latestMeasurements.map((m, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="py-2 px-4 border-b">{m.variable}</td>
                    <td className="py-2 px-4 border-b">{m.value}</td>
                    <td className="py-2 px-4 border-b">{m.pen}</td>
                    <td className="py-2 px-4 border-b">{new Date(m.measureDate).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">
  {String(m.correct) === '1' || m.correct === true ? (
    <span className="flex justify-center">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  ) : (
    <span className="flex justify-center">
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  )}
</td>
<td className="py-2 px-4 border-b">
  {Array.isArray(m.optimal_values) && m.optimal_values.length > 0
    ? m.optimal_values.join(', ')
    : (m.optimo_min !== undefined && m.optimo_max !== undefined
        ? `${m.optimo_min} - ${m.optimo_max}`
        : '-')}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
</Tab.Panel>
                                    <Tab.Panel>
                                        {/* Pens Tab */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Array.from(new Set(measurements.map(m => m.pen))).map(pen => (
                                                <div key={pen} className="bg-white p-4 rounded-lg shadow">
                                                    <h3 className="text-lg font-semibold mb-2">{pen}</h3>
                                                    <div className="space-y-2">
                                                        {measurements
                                                            .filter(m => m.pen === pen)
                                                            .slice(0, 5)
                                                            .map((m, idx) => (
                                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-600">{m.variable}</span>
                                                                    <span className="font-medium">{m.value}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Tab.Panel>
                                    <Tab.Panel>
                                        {/* Numerical Variables Tab */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Array.from(new Set(measurements
                                                .filter(m => !isNaN(Number(m.value)))
                                                .map(m => m.variable)))
                                                .map(variable => {
                                                    const variableMeasurements = measurements.filter(m => m.variable === variable);
                                                    return (
                                                        <div key={variable} className="bg-white p-4 rounded-lg shadow">
                                                            <h3 className="text-lg font-semibold mb-2">{variable}</h3>
                                                            <div className="space-y-2">
                                                                {variableMeasurements.slice(0, 5).map((m, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                                        <span className="text-gray-600">{m.pen}</span>
                                                                        <span className="font-medium">{m.value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}