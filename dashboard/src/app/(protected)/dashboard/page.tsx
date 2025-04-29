"use client";

import { useState } from "react";

export default function DashboardPage() {
    const [selectedField, setSelectedField] = useState("all");

    const fields = [
        { value: "all", label: "Todos los campos" },
        { value: "field1", label: "Campo Maravilla" },
        { value: "field2", label: "Campo Norte" },
        { value: "field3", label: "Campo Este" }
    ];

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
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        className="w-full sm:w-72 p-2 border border-measure-green rounded-md focus:outline-none focus:ring-2 focus:ring-measure-green"
                    >
                        {fields.map((field) => (
                            <option key={field.value} value={field.value}>
                                {field.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 aspect-video w-full border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                    <iframe
                        title="Power BI Dashboard"
                        className="w-full"
                        width="100%"
                        height="100%"
                        src="https://app.powerbi.com/view?r=eyJrIjoiNGJiZDA5MDktNmVmMi00YWM0LTg1M2MtOGEwNmFmZDZlNDA4IiwidCI6IjExNDU2ZmQyLTQzMmQtNGFjMS04NDdlLTI1MzUxYTllZWQ4MiIsImMiOjR9&pageName=4ba772870117d0206409"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};