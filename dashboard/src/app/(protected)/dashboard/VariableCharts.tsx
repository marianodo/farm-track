import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface Measurement {
  variable: string;
  value: string | number;
  measureDate: string;
  pen: string;
  correct: string | number | boolean;
  type_of_object: string;
  report_id: string | number;
  optimo_min?: number;
  optimo_max?: number;
  optimal_values?: string[];
  min?: number;
  max?: number;
}

interface VariableChartsProps {
  measurements: Measurement[];
  selectedPen: string;
  selectedReportId: string;
}

const VariableCharts: React.FC<VariableChartsProps> = ({ measurements, selectedPen, selectedReportId }) => {
  // Filter measurements for the selected pen
  const penMeasurements = measurements.filter((m: Measurement) => m.pen === selectedPen);
  
  // Get unique variables for the selected pen
  const variables = Array.from(new Set(penMeasurements.map(m => m.variable)));
  
  if (!selectedPen) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Variables en el Corral: {selectedPen}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variables.map(variable => {
          // Get all measurements for this variable in this pen
          const variableMeasurements = penMeasurements.filter(m => m.variable === variable);
          
          // Sort measurements by report_id (assuming higher is more recent)
          const sortedByReport = [...variableMeasurements].sort((a, b) => Number(b.report_id) - Number(a.report_id));
          
          // Get the latest report measurements
          const latestReportMeasurements = selectedReportId 
            ? variableMeasurements.filter((m: Measurement) => String(m.report_id) === String(selectedReportId))
                .sort((a: Measurement, b: Measurement) => new Date(a.measureDate).getTime() - new Date(b.measureDate).getTime())
            : [];
            
          if (latestReportMeasurements.length === 0) {
            return null;
          }
          
          // Get all unique report IDs for the evolution chart
          const reports = Array.from(new Set(variableMeasurements.map((m: Measurement) => m.report_id)))
            .sort((a, b) => Number(a) - Number(b)) // Sort report IDs numerically
            .map(reportId => String(reportId)); // Convert to string for consistency
          
          // Format dates for reports
          const reportDates = reports.map(reportId => {
            const measurementWithDate = variableMeasurements.find((m: Measurement) => String(m.report_id) === String(reportId));
            return measurementWithDate?.measureDate 
              ? new Date(measurementWithDate.measureDate).toLocaleDateString() 
              : String(reportId);
          });
          
          // Get optimal range and absolute min/max from measurements
          const measurementWithRanges = latestReportMeasurements.find((m: Measurement) => 
            m.optimo_min !== undefined || m.optimo_max !== undefined || m.min !== undefined || m.max !== undefined
          );
          const optimalMin = measurementWithRanges?.optimo_min;
          const optimalMax = measurementWithRanges?.optimo_max;
          const absoluteMin = measurementWithRanges?.min;
          const absoluteMax = measurementWithRanges?.max;
          
          // Prepare data for histogram - count occurrences of each value
          const valueCounts: {[key: string]: number} = {};
          
          // Count occurrences of each value
          latestReportMeasurements.forEach((m: Measurement) => {
            const value = Number(m.value).toFixed(2); // Round to 2 decimal places for grouping
            valueCounts[value] = (valueCounts[value] || 0) + 1;
          });
          
          // Use absolute min/max if available, otherwise use data range
          const min = absoluteMin !== undefined ? Math.floor(absoluteMin) : 
                     (latestReportMeasurements.length > 0 ? Math.min(...latestReportMeasurements.map(m => Number(m.value))) : 0);
          const max = absoluteMax !== undefined ? Math.ceil(absoluteMax) : 
                     (latestReportMeasurements.length > 0 ? Math.max(...latestReportMeasurements.map(m => Number(m.value))) : 10);
          
          // Create labels for the full range
          const step = Math.max(1, Math.ceil((max - min) / 20)); // Adjust step based on range
          const labels: string[] = [];
          const counts: number[] = [];
          
          // Initialize counts for each value in the range
          for (let i = min; i <= max; i += step) {
            const value = i.toFixed(2);
            labels.push(value);
            counts.push(0);
          }
          
          // Fill in the actual counts
          Object.entries(valueCounts).forEach(([value, count]) => {
            const index = Math.round((parseFloat(value) - min) / step);
            if (index >= 0 && index < counts.length) {
              counts[index] += count;
            }
          });
          
          const values = labels.map(Number);
          const minValue = min;
          const maxValue = max;
          
          // Color code based on optimal range
          const barColors = labels.map((value: string) => {
            const numValue = Number(value);
            if (optimalMin !== undefined && optimalMax !== undefined) {
              return (numValue >= optimalMin && numValue <= optimalMax) 
                ? 'rgba(75, 192, 75, 0.8)' // Green for values within range
                : 'rgba(255, 99, 132, 0.8)'; // Red for values outside range
            }
            return 'rgba(54, 162, 235, 0.8)'; // Default blue if no optimal range
          });
          
          const barBorderColors = labels.map((value: string) => {
            const numValue = Number(value);
            if (optimalMin !== undefined && optimalMax !== undefined) {
              return (numValue >= optimalMin && numValue <= optimalMax) 
                ? 'rgba(75, 192, 75, 1)' // Green for values within range
                : 'rgba(255, 99, 132, 1)'; // Red for values outside range
            }
            return 'rgba(54, 162, 235, 1)'; // Default blue if no optimal range
          });
          
          // Get values across reports for evolution chart
          const valuesByReport = reports.map(reportId => {
            const measurementsForReport = variableMeasurements.filter((m: Measurement) => String(m.report_id) === String(reportId));
            if (measurementsForReport.length === 0) return null;
            
            // If multiple measurements in same report, use average
            if (measurementsForReport.length > 1) {
              const sum = measurementsForReport.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
              return sum / measurementsForReport.length;
            }
            
            return Number(measurementsForReport[0].value || 0);
          });
          
          // Chart data for distribution (histogram)
          const distributionData = {
            labels: labels,
            datasets: [{
              label: 'Cantidad de mediciones',
              data: counts,
              backgroundColor: barColors,
              borderColor: barBorderColors,
              borderWidth: 1,
              maxBarThickness: 50
            }]
          };
          
          // Chart data for evolution (line chart)
          const evolutionData = {
            labels: reportDates,
            datasets: [
              {
                label: variable,
                data: reports.map(reportId => {
                  const measurementsForReport = variableMeasurements.filter((m: Measurement) => String(m.report_id) === String(reportId));
                  if (measurementsForReport.length === 0) return null;
                  
                  // If multiple measurements in same report, use average
                  if (measurementsForReport.length > 1) {
                    const sum = measurementsForReport.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
                    return sum / measurementsForReport.length;
                  }
                  
                  return Number(measurementsForReport[0].value || 0);
                }).filter(v => v !== null), // Filter out null values
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.2,
                pointRadius: 4,
              },
            ],
          };
          
          // Chart options
          // Add annotations for optimal range if available
          const annotations: Record<string, any> = {};
          if (optimalMin !== undefined && optimalMax !== undefined) {
            annotations['optimalRange'] = {
              type: 'box' as const,
              xMin: optimalMin,
              xMax: optimalMax,
              backgroundColor: 'rgba(75, 192, 75, 0.1)',
              borderColor: 'rgba(75, 192, 75, 0.5)',
              borderWidth: 1,
              drawTime: 'beforeDatasetsDraw' as const,
            };
          }
          
          const distributionOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: `Distribución de ${variable}`,
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const value = parseFloat(context.label);
                    const count = context.parsed.y;
                    let tooltipText = `Valor: ${context.label}`;
                    tooltipText += `\nCantidad: ${count}`;
                    
                    if (optimalMin !== undefined && optimalMax !== undefined) {
                      const isInRange = value >= optimalMin && value <= optimalMax;
                      tooltipText += `\n\nRango óptimo: ${optimalMin} - ${optimalMax}`;
                      tooltipText += `\nEstado: ${isInRange ? '✅ En rango' : '❌ Fuera de rango'}`;
                    }
                    
                    if (absoluteMin !== undefined && absoluteMax !== undefined) {
                      tooltipText += `\nRango absoluto: ${absoluteMin} - ${absoluteMax}`;
                    }
                    
                    return tooltipText;
                  }
                }
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Valor de la medición',
                },
                type: 'linear' as const,
                min: minValue,
                max: maxValue,
                ticks: {
                  stepSize: Math.ceil((maxValue - minValue) / 10) || 1
                },
                grid: {
                  display: false
                }
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Cantidad de mediciones',
                },
                min: 0,
                ticks: {
                  stepSize: 1,
                  precision: 0
                }
              },
            },
            barPercentage: 0.8,
            categoryPercentage: 0.9,
          } as const;
          
          const evolutionOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Evolución en el tiempo',
              },
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          };
          
          return (
            <div key={variable} className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4">{variable}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Distribución de Variables</h4>
                  <div style={{ height: '250px' }}>
                    {latestReportMeasurements.length > 0 ? (
                      <Bar options={distributionOptions} data={distributionData} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        No hay datos disponibles
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Tendencia de Variables</h4>
                  <div style={{ height: '250px' }}>
                    {variableMeasurements.length > 0 && valuesByReport.some(v => v !== null) ? (
                      <Line options={evolutionOptions} data={evolutionData} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        No hay datos disponibles
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Optional: Add statistics or additional info */}
              <div className="mt-3 text-sm text-gray-600">
                {latestReportMeasurements.length > 0 && (
                  <div className="flex justify-between">
                    <span>Último valor: {latestReportMeasurements[0].value}</span>
                    {variableMeasurements.length > 1 && (
                      <span>
                        Promedio: {(variableMeasurements.reduce((acc, curr) => acc + Number(curr.value), 0) / variableMeasurements.length).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariableCharts;
