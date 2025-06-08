"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useFieldStore from "@/store/fieldStore";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Types
interface Measurement {
  variable: string;
  value: string | number;
  measureDate: string;
  pen: string;
  correct: number;
  type_of_object: string;
  report_id: string | number;
}

export default function GeneralPage() {
  const [selectedField, setSelectedField] = useState<string>('all');
  const { getFieldsByUser, fieldsByUserId, getCategoricalMeasurementsByFieldId, getNumericalMeasurementsByFieldId } = useFieldStore();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    const fetch = async () => {
      await getFieldsByUser();
    }
    fetch();
  }, [getFieldsByUser]);

  // Load measurements when field selection changes
  useEffect(() => {
    const fetchMeasurements = async () => {
      let allMeasurements: Measurement[] = [];
      
      if (selectedField === 'all' && fieldsByUserId) {
        // Get measurements for all fields
        for (const field of fieldsByUserId) {
          const categoricalMeasurements = await getCategoricalMeasurementsByFieldId(field.id);
          const numericalMeasurements = await getNumericalMeasurementsByFieldId(field.id);
          allMeasurements = [...allMeasurements, ...categoricalMeasurements, ...numericalMeasurements];
        }
      } else if (fieldsByUserId && selectedField) {
        // Get measurements for specific field
        const categoricalMeasurements = await getCategoricalMeasurementsByFieldId(selectedField);
        const numericalMeasurements = await getNumericalMeasurementsByFieldId(selectedField);
        allMeasurements = [...categoricalMeasurements, ...numericalMeasurements];
      }
      
      setMeasurements(allMeasurements);
    };

    fetchMeasurements();
  }, [selectedField, fieldsByUserId, getCategoricalMeasurementsByFieldId, getNumericalMeasurementsByFieldId]);

  // Generate field selection options
  const fields = useMemo(() => {
    return [
      { value: 'all', label: 'Todos los campos' },
      ...(fieldsByUserId ?? []).map((field) => ({
        value: field.id,
        label: field.name,
      })),
    ];
  }, [fieldsByUserId]);

  // Handle field selection change
  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedField(e.target.value);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel General</h1>
        <div className="w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Campo</label>
          <select
            value={selectedField}
            onChange={handleFieldChange}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fields.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Health History Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Historial de Salud General</h2>
        <div className="h-80">
          {(() => {
            if (!measurements.length) {
              return (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-lg">No hay datos disponibles para mostrar</p>
                </div>
              );
            }

            // Group by report_id
            const reportGroups = measurements.reduce((acc, m) => {
              const id = String(m.report_id);
              if (!acc[id]) acc[id] = [];
              acc[id].push(m);
              return acc;
            }, {} as Record<string, Measurement[]>);

            // Sort by report_id (ascending)
            const sortedReportIds = Object.keys(reportGroups).sort((a, b) => Number(a) - Number(b));
            
            const chartLabels: string[] = [];
            const healthPercentages: number[] = [];
            
            sortedReportIds.forEach(reportId => {
              const reportMeasurements = reportGroups[reportId];
              
              // Create date label from first measurement's date
              const firstMeasurement = reportMeasurements[0];
              const dateLabel = firstMeasurement && firstMeasurement.measureDate
                ? new Date(firstMeasurement.measureDate).toLocaleDateString()
                : `Reporte ${reportId}`;
              
              chartLabels.push(dateLabel);
              
              // Calculate overall health percentage
              const totalMeasurements = reportMeasurements.length;
              const correctMeasurements = reportMeasurements.filter(
                m => String(m.correct) === '1' || m.correct === 1
              ).length;
              
              const healthPercentage = totalMeasurements > 0
                ? Math.round((correctMeasurements / totalMeasurements) * 100)
                : 0;
              
              healthPercentages.push(healthPercentage);
            });
            
            const chartData = {
              labels: chartLabels,
              datasets: [{
                label: 'Salud General',
                data: healthPercentages,
                backgroundColor: 'rgba(66, 135, 245, 0.8)',
                borderColor: 'rgba(66, 135, 245, 1)',
                borderWidth: 1,
                maxBarThickness: 50,
              }]
            };
            
            const options = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: function(context: any[]) {
                      return context[0].label || '';
                    },
                    label: function(context: any) {
                      return `Salud General: ${context.parsed.y}% correcto`;
                    },
                    afterLabel: function(context: any) {
                      const reportId = sortedReportIds[context.dataIndex];
                      const reportData = reportGroups[reportId];
                      const totalMeasurements = reportData.length;
                      const correctMeasurements = reportData.filter(
                        m => String(m.correct) === '1' || m.correct === 1
                      ).length;
                      
                      // Calculate animal percentage
                      const animalData = reportData.filter(m => m.type_of_object === 'Animal');
                      const animalTotal = animalData.length;
                      const animalCorrect = animalData.filter(
                        m => String(m.correct) === '1' || m.correct === 1
                      ).length;
                      const animalPercentage = animalTotal > 0 
                        ? Math.round((animalCorrect / animalTotal) * 100) 
                        : 'N/A';
                      
                      // Calculate installation percentage
                      const installationData = reportData.filter(m => m.type_of_object === 'Installation');
                      const installationTotal = installationData.length;
                      const installationCorrect = installationData.filter(
                        m => String(m.correct) === '1' || m.correct === 1
                      ).length;
                      const installationPercentage = installationTotal > 0 
                        ? Math.round((installationCorrect / installationTotal) * 100) 
                        : 'N/A';
                      
                      return [
                        `${correctMeasurements} de ${totalMeasurements} mediciones correctas`,
                        `🐄 Animales: ${animalPercentage === 'N/A' ? animalPercentage : animalPercentage + '%'} correcto`,
                        `🏠 Instalaciones: ${installationPercentage === 'N/A' ? installationPercentage : installationPercentage + '%'} correcto`
                      ];
                    }
                  }
                }
              },
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    stepSize: 10,
                    callback: function(value: string | number) {
                      return value + '%';
                    },
                  },
                  title: {
                    display: true,
                    text: '% Correcto',
                    font: {
                      weight: 'bold' as const
                    }
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: 'Fecha de Reporte',
                    font: {
                      weight: 'bold' as const
                    }
                  },
                },
              },
            };
            
            return <Bar data={chartData} options={options} />;
          })()}
        </div>
      </div>
      
      {/* Additional stats and information can be added here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Resumen General</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Mediciones</span>
              <span className="font-bold">{measurements.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Variables</span>
              <span className="font-bold">{new Set(measurements.map(m => m.variable)).size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Corrales</span>
              <span className="font-bold">{new Set(measurements.map(m => m.pen)).size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Reportes</span>
              <span className="font-bold">{new Set(measurements.map(m => m.report_id)).size}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Estado Actual</h3>
          <div className="flex items-center justify-between">
            {(() => {
              if (!measurements.length) {
                return (
                  <div className="w-full text-center py-6">
                    <p className="text-gray-500">No hay datos para mostrar</p>
                  </div>
                );
              }
              
              // Get the latest report ID
              const reportIds = [...new Set(measurements.map(m => Number(m.report_id)))];
              const latestReportId = Math.max(...reportIds);
              
              // Get measurements for the latest report
              const latestMeasurements = measurements.filter(m => Number(m.report_id) === latestReportId);
              
              // Calculate overall health
              const total = latestMeasurements.length;
              const correct = latestMeasurements.filter(m => String(m.correct) === '1' || m.correct === 1).length;
              const percentage = Math.round((correct / total) * 100);
              
              // Determine color based on health percentage
              let color = 'text-green-500';
              if (percentage < 70) color = 'text-red-500';
              else if (percentage < 90) color = 'text-yellow-500';
              
              return (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg">Salud en último reporte:</span>
                    <span className={`text-2xl font-bold ${color}`}>{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${color.replace('text', 'bg')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 text-right">
                    {correct} de {total} mediciones correctas
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}