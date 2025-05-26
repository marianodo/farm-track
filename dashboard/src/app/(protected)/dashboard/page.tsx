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
                        <div className="w-full">
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