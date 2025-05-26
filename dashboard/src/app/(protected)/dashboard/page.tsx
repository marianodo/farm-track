"use client";

import useFieldStore from "@/store/fieldStore";
import { useEffect, useState } from "react";
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
                    correct: m.correct
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
                            {/* Latest Report Summary */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-semibold mb-4">Último Reporte: {new Date().toLocaleDateString()}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Summary Stats */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Cantidad Mediciones</span>
                                                <div className="flex items-center">
                                                    <span className="text-2xl font-bold">96</span>
                                                    <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Total Corrales</span>
                                                <div className="flex items-center">
                                                    <span className="text-2xl font-bold">2</span>
                                                    <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Variables Medidas</span>
                                                <div className="flex items-center">
                                                    <span className="text-2xl font-bold">7</span>
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
                                                <div className="flex mb-2 items-center justify-between">
                                                    <div>
                                                        <span className="text-3xl font-semibold inline-block py-1">
                                                            84%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex h-2 mb-4 overflow-hidden bg-gray-200 rounded">
                                                    <div style={{ width: '84%' }} className="bg-green-400"></div>
                                                </div>
                                                <div className="flex text-xs justify-between">
                                                    <span>0%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-500 mb-3">Salud Actual de Animales</h3>
                                            <div className="relative pt-1">
                                                <div className="flex mb-2 items-center justify-between">
                                                    <div>
                                                        <span className="text-3xl font-semibold inline-block py-1">
                                                            88%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex h-2 mb-4 overflow-hidden bg-gray-200 rounded">
                                                    <div style={{ width: '88%' }} className="bg-green-400"></div>
                                                </div>
                                                <div className="flex text-xs justify-between">
                                                    <span>0%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-500 mb-3">Salud Actual de Instalaciones</h3>
                                            <div className="relative pt-1">
                                                <div className="flex mb-2 items-center justify-between">
                                                    <div>
                                                        <span className="text-3xl font-semibold inline-block py-1">
                                                            62%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex h-2 mb-4 overflow-hidden bg-gray-200 rounded">
                                                    <div style={{ width: '62%' }} className="bg-yellow-400"></div>
                                                </div>
                                                <div className="flex text-xs justify-between">
                                                    <span>0%</span>
                                                    <span>100%</span>
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
                                                    <span className="text-2xl font-bold">5</span>
                                                    <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Total Mediciones</span>
                                                <div className="flex items-center">
                                                    <span className="text-2xl font-bold">642</span>
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
                                    <div className="col-span-3">
                                        <div className="bg-gray-50 p-4 rounded-lg h-full">
                                            <h3 className="text-sm font-medium text-gray-500 mb-4">% Corrector por Reporte</h3>
                                            <div className="h-64">
                                                <div className="relative h-full">
                                                    <div className="absolute bottom-0 left-0 right-0 h-full flex items-end space-x-4">
                                                        {[83, 81, 83, 86, 84].map((percentage, index) => (
                                                            <div key={index} className="flex-1 flex flex-col items-center">
                                                                <div className="w-full bg-green-400" style={{ height: `${percentage}%` }}></div>
                                                                <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                                                                <div className="text-xs text-gray-500">{['28/02/2025', '15/04/2025', '22/04/2025', '25/04/2025', '29/04/2025'][index]}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                        {/* General Tab */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            {(() => {
                                                // Get measurements from the latest report date
                                                // Get all unique dates and sort them in descending order
                                                const dates = [...new Set(measurements.map(m => 
                                                    new Date(m.measureDate).toDateString()
                                                ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                                                
                                                // Get latest and previous date measurements
                                                const latestDate = new Date(dates[0]);
                                                const latestMeasurements = measurements.filter(
                                                    m => new Date(m.measureDate).toDateString() === dates[0]
                                                );

                                                const previousMeasurements = dates.length > 1 ? measurements.filter(
                                                    m => new Date(m.measureDate).toDateString() === dates[1]
                                                ) : [];

                                                return (
                                                    <>
                                                        <div className="bg-white rounded-lg shadow p-4">
                                                            <h3 className="text-lg font-semibold mb-2">Variables Medidas</h3>
                                                            <p className="text-3xl font-bold text-blue-600">
                                                                {new Set(latestMeasurements.map(m => m.variable)).size}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {latestDate.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white rounded-lg shadow p-4">
                                                            <h3 className="text-lg font-semibold mb-2">Corrales Medidos</h3>
                                                            <p className="text-3xl font-bold text-green-600">
                                                                {new Set(latestMeasurements.map(m => m.pen)).size}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {latestDate.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white rounded-lg shadow p-4">
                                                            <h3 className="text-lg font-semibold mb-2">Ratio de Corrección</h3>
                                                            <div className="flex items-end gap-2">
                                                                <p className="text-3xl font-bold text-yellow-600">
                                                                    {((latestMeasurements.filter(m => m.correct === 1).length / latestMeasurements.length) * 100).toFixed(1)}%
                                                                </p>
                                                                {previousMeasurements.length > 0 && (() => {
                                                                    const currentRatio = (latestMeasurements.filter(m => m.correct === 1).length / latestMeasurements.length) * 100;
                                                                    const previousRatio = (previousMeasurements.filter(m => m.correct === 1).length / previousMeasurements.length) * 100;
                                                                    const difference = currentRatio - previousRatio;
                                                                    const isPositive = difference >= 0;
                                                                    
                                                                    return (
                                                                        <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {isPositive ? (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                            <span className="text-sm font-medium ml-1">
                                                                                {Math.abs(difference).toFixed(1)}%
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {latestDate.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        <div className="bg-white rounded-lg shadow overflow-hidden">
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold mb-2">Últimas Mediciones</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Corral</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {measurements.slice(0, 5).map((measurement, index) => (
                                                            <tr key={index}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{measurement.variable}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{measurement.value}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{measurement.pen}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {new Date(measurement.measureDate).toLocaleString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${measurement.correct === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {measurement.correct === 1 ? 'Correcto' : 'Incorrecto'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
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