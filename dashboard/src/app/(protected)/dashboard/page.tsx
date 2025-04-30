"use client";

import useFieldStore from "@/store/fieldStore";
import { useEffect, useState } from "react";
interface Field {
    id?: string;
    value: string;
    label: string;
    dashboard_url?: string;
}
export default function DashboardPage() {
    const [selectedField, setSelectedField] = useState<Field>({
        value: "all",
        label: "Todos los campos",
        dashboard_url: undefined
    });

    const FallbackComponent = () => (
        <div className="h-[36rem] w-full flex justify-center items-center">
            {
                selectedField.dashboard_url ? <p>Oops! algo salio mal, no hemos podido cargar el dashboard.</p> : <p>Este campo no tiene un dashboard asignado</p>
            }
        </div>
    );

    const { getFieldsByUser, fieldsByUserId } = useFieldStore();

    useEffect(() => {
        const fetch = async () => {
            return await getFieldsByUser()
        }
        fetch()
    }, [getFieldsByUser])

    const fields = [
        { value: "all", label: "Todos los campos" },
        ...(fieldsByUserId ?? []).map((field) => ({
            id: field.id,
            value: field.name,
            label: field.name,
            dashboard_url: field.dashboard_url ?? undefined
        }))
    ];

    const handleFieldChange = async (value: string) => {
        const selected = fields.find(field => field.label === value);
        setSelectedField(selected || { value: "all", label: "Todos los campos", dashboard_url: undefined });

    };

    const isValidURL = (url?: string): boolean => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
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

                <div className={`mt-6 w-full border border-gray-200 rounded-md overflow-hidden bg-gray-50 ${selectedField.value !== "all" && isValidURL(selectedField.dashboard_url) ? "aspect-video" : "h-[36rem]"}`}>
                    {selectedField.value === "all" ? (
                        <div className="h-full w-full flex justify-center items-center">
                            <h1>Seleccione un campo para ver el dashboard</h1>
                        </div>
                    ) : !isValidURL(selectedField.dashboard_url) ? (
                        <FallbackComponent />
                    ) : (
                        <iframe
                            title="Power BI Dashboard"
                            className="w-full h-full "
                            src={selectedField.dashboard_url}
                            frameBorder="0"
                            allowFullScreen
                            loading="lazy"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};