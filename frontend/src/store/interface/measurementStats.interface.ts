export default interface MeasurementStats {
    total_measurement?: number; // Puede ser un número o estar ausente
    measurement_by_object?: {
        [key: string]: number; // Clave: nombre del objeto, Valor: cantidad
    };
    measurement_by_pen?: {
        [key: string]: number; // Clave: nombre del pen, Valor: cantidad
    };
    measurement_by_variable?: {
        [key: string]: number; // Clave: nombre de la variable, Valor: cantidad
    };
    measurement_by_variable_by_pen?: {
        [penName: string]: {
            [variableName: string]: number; // Clave: nombre de la variable, Valor: cantidad
        };
    };
}