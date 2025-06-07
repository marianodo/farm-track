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
  singleVariableMode?: boolean;
  variableToShow?: string;
  showOnlyDistribution?: boolean;
  showOnlyTrend?: boolean;
  comparePensMode?: boolean;
  showTrendByPen?: boolean;
}

// Helper function to render a single variable distribution chart
const renderSingleVariableDistribution = (measurements: Measurement[], variableName: string) => {
  if (!measurements || measurements.length === 0) {
    return <div className="text-center text-gray-500">No hay datos disponibles para esta variable.</div>;
  }
  
  // Determine if variable is categorical based on values
  const isCategorical = measurements.some(m => {
    return typeof m.value === 'string' && isNaN(Number(m.value));
  });
  
  // Get info for chart title and stats
  const totalCount = measurements.length;
  const correctCount = measurements.filter((m: Measurement) => String(m.correct) === '1' || m.correct === 1).length;
  const correctPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  
  if (isCategorical) {
    // Categorical variable - create histogram of categories
    const valueCounts: { [key: string]: number } = {};
    measurements.forEach((m: Measurement) => {
      const value = String(m.value).trim();
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });
    const labels = Object.keys(valueCounts).sort();
    const counts = labels.map(label => valueCounts[label]);
    
    // Get optimal values if available
    const optimalValues = measurements.find(m => Array.isArray(m.optimal_values) && m.optimal_values.length > 0)?.optimal_values || [];
    
    // Color bars by optimal_values
    const barColors = labels.map(label =>
      optimalValues.length > 0
        ? optimalValues.includes(label)
          ? 'rgba(75, 192, 75, 0.8)'
          : 'rgba(255, 99, 132, 0.8)'
        : 'rgba(54, 162, 235, 0.8)'
    );
    const barBorderColors = labels.map(label =>
      optimalValues.length > 0
        ? optimalValues.includes(label)
          ? 'rgba(75, 192, 75, 1)'
          : 'rgba(255, 99, 132, 1)'
        : 'rgba(54, 162, 235, 1)'
    );
    
    // Chart data
    const distributionData = {
      labels,
      datasets: [{
        label: 'Cantidad de mediciones',
        data: counts,
        backgroundColor: barColors,
        borderColor: barBorderColors,
        borderWidth: 1,
        maxBarThickness: 50
      }]
    };
    
    // Chart options
    const distributionOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Distribución de ${variableName}`,
          font: {
            size: 16,
            weight: 'bold' as const
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label;
              const count = context.parsed.y;
              let tooltipText = `Categoría: ${label}`;
              tooltipText += `\nCantidad: ${count}`;
              if (optimalValues.length > 0) {
                tooltipText += `\nEstado: ${optimalValues.includes(label) ? '✅ Óptimo' : '❌ No óptimo'}`;
              }
              return tooltipText;
            }
          }
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Categoría' },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Cantidad de mediciones' },
          min: 0,
          ticks: { stepSize: 1, precision: 0 }
        },
      },
    } as const;
    
    return (
      <div className="w-full h-full">
        <Bar options={distributionOptions} data={distributionData} />
      </div>
    );
  } else {
    // Numerical variable - create histogram of values
    const valueCounts: {[key: string]: number} = {};
    measurements.forEach((m: Measurement) => {
      const value = Number(m.value).toFixed(2); // Round to 2 decimal places for grouping
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    });
    
    // Get optimal range and absolute min/max from measurements
    const measurementWithRanges = measurements.find((m: Measurement) => 
      m.optimo_min !== undefined || m.optimo_max !== undefined || m.min !== undefined || m.max !== undefined
    );
    const optimalMin = measurementWithRanges?.optimo_min;
    const optimalMax = measurementWithRanges?.optimo_max;
    const absoluteMin = measurementWithRanges?.min;
    const absoluteMax = measurementWithRanges?.max;
    
    // Use absolute min/max if available, otherwise use data range
    const min = absoluteMin !== undefined ? Math.floor(absoluteMin) :
              (measurements.length > 0 ? Math.min(...measurements.map(m => Number(m.value))) : 0);
    const max = absoluteMax !== undefined ? Math.ceil(absoluteMax) :
              (measurements.length > 0 ? Math.max(...measurements.map(m => Number(m.value))) : 10);
    const step = Math.max(1, Math.ceil((max - min) / 20));
    
    // Create buckets for the histogram
    const labels: string[] = [];
    const counts: number[] = [];
    for (let i = min; i <= max; i += step) {
      const value = i.toFixed(2);
      labels.push(value);
      counts.push(0);
    }
    
    // Fill the buckets
    Object.entries(valueCounts).forEach(([value, count]) => {
      const index = Math.round((parseFloat(value) - min) / step);
      if (index >= 0 && index < counts.length) {
        counts[index] += count;
      }
    });
    
    // Color bars based on optimal range
    const barColors = labels.map((value: string) => {
      const numValue = Number(value);
      if (optimalMin !== undefined && optimalMax !== undefined) {
        return (numValue >= optimalMin && numValue <= optimalMax)
          ? 'rgba(75, 192, 75, 0.8)'
          : 'rgba(255, 99, 132, 0.8)';
      }
      return 'rgba(54, 162, 235, 0.8)';
    });
    const barBorderColors = labels.map((value: string) => {
      const numValue = Number(value);
      if (optimalMin !== undefined && optimalMax !== undefined) {
        return (numValue >= optimalMin && numValue <= optimalMax)
          ? 'rgba(75, 192, 75, 1)'
          : 'rgba(255, 99, 132, 1)';
      }
      return 'rgba(54, 162, 235, 1)';
    });
    
    // Chart data
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
    
    // Chart options
    const distributionOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `Distribución de ${variableName}`,
          font: {
            size: 16,
            weight: 'bold' as const
          }
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
              
              return tooltipText;
            }
          }
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Valor de la medición' },
          type: 'linear' as const,
          min: min,
          max: max,
          ticks: {
            stepSize: Math.ceil((max - min) / 10) || 1
          },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Cantidad de mediciones' },
          min: 0,
          ticks: { stepSize: 1, precision: 0 }
        },
      },
    } as const;
    
    return (
      <div className="w-full h-full">
        <Bar options={distributionOptions} data={distributionData} />
      </div>
    );
  }
};

// Helper function to render a single variable trend chart
const renderSingleVariableTrend = (measurements: Measurement[], variableName: string) => {
  if (!measurements || measurements.length === 0) {
    return <div className="text-center text-gray-500">No hay datos históricos disponibles para esta variable.</div>;
  }
  
  // Sort measurements by report date/ID
  const sortedMeasurements = [...measurements].sort((a, b) => {
    // Sort by date if available, otherwise by report ID
    if (a.measureDate && b.measureDate) {
      return new Date(a.measureDate).getTime() - new Date(b.measureDate).getTime();
    }
    return Number(a.report_id) - Number(b.report_id);
  });
  
  // Get unique report IDs and corresponding dates
  const reportsMap = new Map();
  sortedMeasurements.forEach(measurement => {
    const reportId = String(measurement.report_id);
    const value = Number(measurement.value);
    
    if (isNaN(value)) return; // Skip non-numeric values
    
    if (!reportsMap.has(reportId)) {
      reportsMap.set(reportId, {
        reportId,
        date: measurement.measureDate ? new Date(measurement.measureDate) : new Date(),
        values: [],
        count: 0,
        sum: 0
      });
    }
    
    const report = reportsMap.get(reportId);
    if (report) {
      report.values.push(value);
      report.count++;
      report.sum += value;
    }
  });
  
  // Convert map to array and calculate averages
  const allReports = Array.from(reportsMap.values())
    .map(report => ({
      reportId: report.reportId,
      date: report.date,
      average: report.count > 0 ? report.sum / report.count : 0,
      count: report.count,
      min: report.values.length > 0 ? Math.min(...report.values) : 0,
      max: report.values.length > 0 ? Math.max(...report.values) : 0
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date
    
  // Get optimal range from measurements
  const measurementWithRanges = sortedMeasurements.find(m => 
    m.optimo_min !== undefined || m.optimo_max !== undefined
  );
  const optimalMin = measurementWithRanges?.optimo_min;
  const optimalMax = measurementWithRanges?.optimo_max;
  
  // Chart data
  const evolutionData = {
    labels: allReports.map(report => report.date.toLocaleDateString()),
    datasets: [{
      label: 'Promedio por reporte',
      data: allReports.map(report => report.average),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
      pointRadius: 4,
      fill: true,
      pointBackgroundColor: 'rgb(75, 192, 192)',
      pointBorderColor: '#fff',
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgb(75, 192, 192)',
      pointHoverBorderColor: '#fff',
      pointHitRadius: 10,
      pointBorderWidth: 2,
    }],
  };
  
  // Chart options
  const evolutionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Evolución de ${variableName}`,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const report = allReports[context.dataIndex];
            if (!report) return '';
            
            const avg = report.average.toFixed(2);
            const min = report.min.toFixed(2);
            const max = report.max.toFixed(2);
            const date = report.date.toLocaleDateString();
            
            return [
              `Reporte: #${report.reportId}`,
              `Fecha: ${date}`,
              `Muestras: ${report.count}`,
              `Promedio: ${avg}`,
              `Mínimo: ${min}`,
              `Máximo: ${max}`
            ];
          },
          title: () => `Variable: ${variableName}`,
          afterLabel: (context: any) => {
            const report = allReports[context.dataIndex];
            if (!report || optimalMin === undefined || optimalMax === undefined) return '';
            
            const isInRange = report.average >= optimalMin && report.average <= optimalMax;
            return `Estado: ${isInRange ? '✅ En rango óptimo' : '⚠️ Fuera de rango'}`;
          }
        },
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 12 },
        displayColors: false
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Fecha del reporte' },
        grid: { display: false }
      },
      y: {
        title: { display: true, text: 'Valor promedio' },
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    elements: { line: { borderWidth: 2 } }
  };
  
  return (
    <div className="w-full h-full">
      <Line options={evolutionOptions} data={evolutionData} />
    </div>
  );
};

// Helper function to render distribution chart for a specific pen and variable
const renderPenVariableDistribution = (measurements: Measurement[], pen: string, variableName: string) => {
  // Filter measurements for the specific pen and variable
  const filteredMeasurements = measurements.filter(m => m.pen === pen && m.variable === variableName);
  
  if (!filteredMeasurements || filteredMeasurements.length === 0) {
    return <div className="text-center text-gray-500">No hay datos disponibles para este corral.</div>;
  }
  
  // Get optimal range information
  const measurementWithRanges = filteredMeasurements.find((m: Measurement) => 
    m.optimo_min !== undefined || m.optimo_max !== undefined || 
    m.min !== undefined || m.max !== undefined
  );
  
  // Extract optimization ranges
  const optimalMin = measurementWithRanges?.optimo_min;
  const optimalMax = measurementWithRanges?.optimo_max;
  const absoluteMin = measurementWithRanges?.min;
  const absoluteMax = measurementWithRanges?.max;
  
  // Count correct measurements (within optimal range)
  const totalMeasurements = filteredMeasurements.length;
  let correctMeasurements = 0;
  
  if (optimalMin !== undefined && optimalMax !== undefined) {
    correctMeasurements = filteredMeasurements.filter(m => {
      // Handle both 'valor' and 'value' properties since we're seeing inconsistent naming
      const value = (m as any).valor !== undefined ? (m as any).valor : m.value;
      return value >= optimalMin && value <= optimalMax;
    }).length;
  }
  
  // Calculate correctness percentage
  const correctnessPercentage = totalMeasurements > 0 ? 
    Math.round((correctMeasurements / totalMeasurements) * 100) : 0;
  
  // Add optimal range info banner if available
  const hasOptimalRange = optimalMin !== undefined && optimalMax !== undefined;
  const hasAbsoluteRange = absoluteMin !== undefined || absoluteMax !== undefined;
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Optimal range information */}
      <div className="mb-2 text-xs text-center flex justify-center flex-wrap gap-2">
        {hasOptimalRange && (
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
            Rango óptimo: <strong>{optimalMin} - {optimalMax}</strong>
          </span>
        )}
        {hasAbsoluteRange && (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
            Rango válido: <strong>
              {absoluteMin !== undefined ? absoluteMin : 'Min'} - 
              {absoluteMax !== undefined ? absoluteMax : 'Max'}
            </strong>
          </span>
        )}
        <span className={`px-2 py-1 rounded ${correctnessPercentage >= 75 ? 'bg-green-50 text-green-700' : 
          correctnessPercentage >= 50 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
          Correctas: <strong>{correctMeasurements}/{totalMeasurements}</strong> ({correctnessPercentage}%)
        </span>
      </div>
      
      {/* Chart */}
      <div className="flex-1">
        {renderSingleVariableDistribution(filteredMeasurements, variableName)}
      </div>
    </div>
  );
};

// Helper function to render trend chart with all pens for a variable
const renderVariableTrendByPen = (measurements: Measurement[], variableName: string) => {
  if (!measurements || measurements.length === 0) {
    return <div className="text-center text-gray-500">No hay datos históricos disponibles para esta variable.</div>;
  }
  
  // Filter measurements for the specific variable
  const variableMeasurements = measurements.filter(m => m.variable === variableName);
  
  // Get unique pens
  const uniquePens = Array.from(new Set(variableMeasurements.map(m => m.pen)))
    .filter(pen => pen); // Filter out empty pen values
  
  if (uniquePens.length === 0) {
    return <div className="text-center text-gray-500">No hay datos de corrales disponibles para esta variable.</div>;
  }
  
  // Sort measurements by report date/ID
  const sortedMeasurements = [...variableMeasurements].sort((a, b) => {
    // Sort by date if available, otherwise by report ID
    if (a.measureDate && b.measureDate) {
      return new Date(a.measureDate).getTime() - new Date(b.measureDate).getTime();
    }
    return Number(a.report_id) - Number(b.report_id);
  });
  
  // Create a map of pen -> reportId -> average value
  const penReportData = new Map();
  
  // Process measurements to get average values per pen and report
  uniquePens.forEach(pen => {
    const penMeasurements = sortedMeasurements.filter(m => m.pen === pen);
    
    // Define types for report data
    interface ReportData {
      reportId: string;
      date: Date | null;
      avgValue: number;
    }
    
    // Group by report_id
    const reportGroups: ReportData[] = [];
    penMeasurements.forEach(measurement => {
      const reportId = String(measurement.report_id);
      const value = Number(measurement.value);
      
      if (isNaN(value)) return; // Skip non-numeric values
      
      if (!reportGroups.find(r => r.reportId === reportId)) {
        reportGroups.push({
          reportId,
          date: measurement.measureDate ? new Date(measurement.measureDate) : null,
          avgValue: value
        });
      } else {
        const existingReport = reportGroups.find(r => r.reportId === reportId);
        if (existingReport) {
          existingReport.avgValue = (existingReport.avgValue + value) / 2;
        }
      }
    });
    
    // Calculate averages
    penReportData.set(pen, Array.from(reportGroups.values())
      .map(report => ({
        reportId: report.reportId,
        date: report.date,
        average: report.count > 0 ? report.sum / report.count : 0
      }))
      .sort((a, b) => {
        if (a.date && b.date) return a.date.getTime() - b.date.getTime();
        return a.reportId.localeCompare(b.reportId);
      })
    );
  });
  
  // Get all unique report dates across all pens
  const allReportDates = new Set<string>();
  penReportData.forEach((reports) => {
    reports.forEach((report) => {
      if (report.date) {
        allReportDates.add(report.date.toISOString().split('T')[0]);
      } else {
        allReportDates.add(report.reportId);
      }
    });
  });
  
  // Convert to sorted array
  const sortedDates = Array.from(allReportDates).sort();
  
  // Create datasets for each pen
  const datasets = Array.from(penReportData.entries()).map(([pen, reports], index) => {
    // Generate a color based on the index
    const hue = (index * 137.5) % 360; // Use golden angle approximation for good distribution
    
    return {
      label: `Corral ${pen}`,
      data: reports.map(report => ({
        x: report.date ? report.date.toISOString().split('T')[0] : report.reportId,
        y: report.average
      })),
      borderColor: `hsla(${hue}, 70%, 50%, 1)`,
      backgroundColor: `hsla(${hue}, 70%, 50%, 0.2)`,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: `hsla(${hue}, 70%, 50%, 1)`,
      pointBorderColor: '#fff',
      pointHoverRadius: 5
    };
  });
  
  // Get optimal range from measurements (assuming it's the same for all pens)
  const measurementWithRanges = sortedMeasurements.find(m => 
    m.optimo_min !== undefined || m.optimo_max !== undefined
  );
  const optimalMin = measurementWithRanges?.optimo_min;
  const optimalMax = measurementWithRanges?.optimo_max;
  
  // Chart data
  const trendData = {
    datasets
  };
  
  // Chart options
  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Tendencia de ${variableName} por Corral`,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          title: function(items) {
            if (!items.length) return '';
            const item = items[0];
            const xValue = item.parsed.x;
            // Try to parse as date if it looks like a date
            try {
              if (typeof xValue === 'string' && xValue.includes('-')) {
                return `Fecha: ${new Date(xValue).toLocaleDateString()}`;
              }
            } catch (e) {}
            return `Reporte: #${xValue}`;
          },
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y?.toFixed(2) || '0';
            return `${label}: ${value}`;
          },
          afterLabel: function(context) {
            const value = context.parsed.y;
            if (optimalMin !== undefined && optimalMax !== undefined) {
              const isInRange = value >= optimalMin && optimalMax >= value;
              return `Estado: ${isInRange ? '✅ En rango óptimo' : '⚠️ Fuera de rango'}`;
            }
            return '';
          }
        },
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        bodyFont: { size: 12 },
        multiKeyBackground: '#fff',
        usePointStyle: true
      },
      // Omit annotation plugin to fix TypeScript errors
      // We can implement this later with proper type definitions if needed
    },
    scales: {
      x: {
        type: 'category' as const,
        title: { display: true, text: 'Fecha/Reporte' },
        grid: { display: false }
      },
      y: {
        title: { display: true, text: 'Valor promedio' },
        beginAtZero: false,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      }
    },
    elements: { line: { borderWidth: 2 } }
  } as any; // Type assertion to bypass TypeScript errors
  
  return (
    <div className="w-full h-full">
      <Line options={trendOptions} data={trendData} />
    </div>
  );
};

const VariableCharts: React.FC<VariableChartsProps> = ({ 
  measurements, 
  selectedPen, 
  selectedReportId,
  singleVariableMode,
  variableToShow,
  showOnlyDistribution,
  showOnlyTrend,
  comparePensMode,
  showTrendByPen
}: VariableChartsProps) => {
  // Handle single variable mode
  if (singleVariableMode && variableToShow) {
    // Filter measurements for the specific variable
    const variableMeasurements = measurements.filter(m => m.variable === variableToShow);
    
    // If comparePensMode is true, render distribution for specific pen and variable
    if (comparePensMode && selectedPen) {
      return renderPenVariableDistribution(measurements, selectedPen, variableToShow);
    }
    
    // If showTrendByPen is true, show trend lines for all pens
    if (showTrendByPen) {
      return renderVariableTrendByPen(measurements, variableToShow);
    }
    
    // Handle original single variable modes
    if (showOnlyDistribution) {
      return renderSingleVariableDistribution(variableMeasurements, variableToShow);
    } else if (showOnlyTrend) {
      return renderSingleVariableTrend(variableMeasurements, variableToShow);
    }
  }
  
  // Regular mode - Get all measurements for the selected pen
  const penMeasurements = measurements.filter(m => m.pen === selectedPen);
  
  // Filter for the selected report if specified
  const filteredMeasurements = selectedReportId
    ? penMeasurements.filter(m => String(m.report_id) === String(selectedReportId))
    : penMeasurements;
  
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
          
          // Calculate percentage of correct values
          const totalCount = latestReportMeasurements.length;
          const correctCount = latestReportMeasurements.filter(m => 
            String(m.correct) === '1' || String(m.correct) === 'true'
          ).length;
          const correctPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
          
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
          
          // Determine if categorical: any value is a non-numeric string
          const isCategorical = latestReportMeasurements.some(m => {
            return typeof m.value === 'string' && isNaN(Number(m.value));
          });

          // ----- CATEGORICAL -----
          if (isCategorical) {
            // Histogram: count occurrences of each category
            const valueCounts: { [key: string]: number } = {};
            latestReportMeasurements.forEach((m: Measurement) => {
              const value = String(m.value).trim();
              valueCounts[value] = (valueCounts[value] || 0) + 1;
            });
            const labels = Object.keys(valueCounts).sort();
            const counts = labels.map(label => valueCounts[label]);

            // Color bars by optimal_values
            const optimalValues = latestReportMeasurements.find(m => Array.isArray(m.optimal_values) && m.optimal_values.length > 0)?.optimal_values || [];
            const barColors = labels.map(label =>
              optimalValues.length > 0
                ? optimalValues.includes(label)
                  ? 'rgba(75, 192, 75, 0.8)'
                  : 'rgba(255, 99, 132, 0.8)'
                : 'rgba(54, 162, 235, 0.8)'
            );
            const barBorderColors = labels.map(label =>
              optimalValues.length > 0
                ? optimalValues.includes(label)
                  ? 'rgba(75, 192, 75, 1)'
                  : 'rgba(255, 99, 132, 1)'
                : 'rgba(54, 162, 235, 1)'
            );

            // Histogram chart data
            const distributionData = {
              labels,
              datasets: [{
                label: 'Cantidad de mediciones',
                data: counts,
                backgroundColor: barColors,
                borderColor: barBorderColors,
                borderWidth: 1,
                maxBarThickness: 50
              }]
            };

            // Evolution: map categories to numbers for chart, and back for tooltips/axis
            // Find all categories across all reports for this variable
            const allCategories = Array.from(new Set(variableMeasurements.map(m => String(m.value).trim()).filter(Boolean))).sort();
            const categoryToNumber = new Map<string, number>();
            const numberToCategory = new Map<number, string>();
            allCategories.forEach((cat, idx) => {
              categoryToNumber.set(cat, idx + 1);
              numberToCategory.set(idx + 1, cat);
            });

            // For each report, get the most frequent category
            const mostFrequentCategoryByReport = reports.map(reportId => {
              const measurementsForReport = variableMeasurements.filter((m: Measurement) => String(m.report_id) === String(reportId));
              if (measurementsForReport.length === 0) return null;
              const freq: { [cat: string]: number } = {};
              measurementsForReport.forEach(m => {
                const val = String(m.value).trim();
                freq[val] = (freq[val] || 0) + 1;
              });
              let max = 0, chosen = '';
              Object.entries(freq).forEach(([cat, count]) => {
                if (count > max) {
                  max = count;
                  chosen = cat;
                }
              });
              return chosen && categoryToNumber.has(chosen) ? categoryToNumber.get(chosen) : null;
            });

            // Evolution chart data
            const evolutionData = {
              labels: reportDates,
              datasets: [{
                label: 'Categoría más frecuente',
                data: mostFrequentCategoryByReport,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.3,
                pointRadius: 4,
                fill: true,
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: '#fff',
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgb(75, 192, 192)',
                pointHoverBorderColor: '#fff',
                pointHitRadius: 10,
                pointBorderWidth: 2,
              }],
            };

            // Histogram options
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
                      const label = context.label;
                      const count = context.parsed.y;
                      let tooltipText = `Categoría: ${label}`;
                      tooltipText += `\nCantidad: ${count}`;
                      if (optimalValues.length > 0) {
                        tooltipText += `\nEstado: ${optimalValues.includes(label) ? '✅ Óptimo' : '❌ No óptimo'}`;
                      }
                      return tooltipText;
                    }
                  }
                },
              },
              scales: {
                x: {
                  title: { display: true, text: 'Categoría' },
                  type: 'category' as const,
                  grid: { display: false }
                },
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Cantidad de mediciones' },
                  min: 0,
                  ticks: { stepSize: 1, precision: 0 }
                },
              },
              barPercentage: 0.8,
              categoryPercentage: 0.9,
            } as const;

            // Evolution options
            const evolutionOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: 'Evolución en el tiempo',
                  font: { size: 14 }
                },
                tooltip: {
                  callbacks: {
                    title: (context: any) => `Variable: ${variable}`,
                    label: (context: any) => {
                      const idx = context.dataIndex;
                      const catNum = mostFrequentCategoryByReport[idx];
                      const cat = catNum != null ? numberToCategory.get(catNum) : 'N/A';
                      return `Categoría más frecuente: ${cat}`;
                    },
                  },
                  padding: 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleFont: { size: 14, weight: 'bold' as const },
                  bodyFont: { size: 12 },
                  displayColors: false,
                }
              },
              scales: {
                x: {
                  title: { display: true, text: 'Fecha del reporte' },
                  grid: { display: false }
                },
                y: {
                  title: { display: true, text: 'Categoría' },
                  beginAtZero: true,
                  min: 0,
                  max: allCategories.length + 1,
                  ticks: {
                    stepSize: 1,
                    callback: function(tickValue: string | number) {
                      // Chart.js may pass tickValue as string or number
                      const num = typeof tickValue === 'number' ? tickValue : parseInt(tickValue, 10);
                      return numberToCategory.get(num) || '';
                    }
                  },
                  grid: { color: 'rgba(0, 0, 0, 0.05)' }
                }
              },
              elements: { line: { borderWidth: 2 } }
            } as const;

            return (
              <div key={variable} className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  <div>
                    <span>{variable}</span>
                    <span className="text-xs text-gray-500 block">{latestReportMeasurements[0]?.type_of_object || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    {correctPercentage >= 80 ? (
                      <svg className="w-5 h-5 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : correctPercentage >= 50 ? (
                      <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    )}
                    <span className="text-sm font-medium ml-2 px-2 py-1 bg-gray-100 rounded-full">
                      {correctPercentage}% correcto ({correctCount}/{totalCount})
                    </span>
                  </div>
                </h3>
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
                      {mostFrequentCategoryByReport.some(v => v !== null) ? (
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
                      {optimalValues.length > 0 ? (
                        <span>Óptimos: {optimalValues.join(', ')}</span>
                      ) : (
                        <span>Última categoría: {String(latestReportMeasurements[0].value)}</span>
                      )}
                      <span>
                        Total: {latestReportMeasurements.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // ----- NUMERICAL (default) -----
          // Prepare data for histogram - count occurrences of each value
          const valueCounts: {[key: string]: number} = {};
          latestReportMeasurements.forEach((m: Measurement) => {
            const value = Number(m.value).toFixed(2); // Round to 2 decimal places for grouping
            valueCounts[value] = (valueCounts[value] || 0) + 1;
          });
          // Use absolute min/max if available, otherwise use data range
          const min = absoluteMin !== undefined ? Math.floor(absoluteMin) :
                     (latestReportMeasurements.length > 0 ? Math.min(...latestReportMeasurements.map(m => Number(m.value))) : 0);
          const max = absoluteMax !== undefined ? Math.ceil(absoluteMax) :
                     (latestReportMeasurements.length > 0 ? Math.max(...latestReportMeasurements.map(m => Number(m.value))) : 10);
          const step = Math.max(1, Math.ceil((max - min) / 20));
          const labels: string[] = [];
          const counts: number[] = [];
          for (let i = min; i <= max; i += step) {
            const value = i.toFixed(2);
            labels.push(value);
            counts.push(0);
          }
          Object.entries(valueCounts).forEach(([value, count]) => {
            const index = Math.round((parseFloat(value) - min) / step);
            if (index >= 0 && index < counts.length) {
              counts[index] += count;
            }
          });
          const values = labels.map(Number);
          const minValue = min;
          const maxValue = max;
          const barColors = labels.map((value: string) => {
            const numValue = Number(value);
            if (optimalMin !== undefined && optimalMax !== undefined) {
              return (numValue >= optimalMin && numValue <= optimalMax)
                ? 'rgba(75, 192, 75, 0.8)'
                : 'rgba(255, 99, 132, 0.8)';
            }
            return 'rgba(54, 162, 235, 0.8)';
          });
          const barBorderColors = labels.map((value: string) => {
            const numValue = Number(value);
            if (optimalMin !== undefined && optimalMax !== undefined) {
              return (numValue >= optimalMin && numValue <= optimalMax)
                ? 'rgba(75, 192, 75, 1)'
                : 'rgba(255, 99, 132, 1)';
            }
            return 'rgba(54, 162, 235, 1)';
          });
          // Get values across reports for evolution chart
          const valuesByReport = reports.map(reportId => {
            const measurementsForReport = variableMeasurements.filter((m: Measurement) => String(m.report_id) === String(reportId));
            if (measurementsForReport.length === 0) return null;
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
          
          // Get all reports with their measurements and calculate averages
          const reportsMap = new Map();
          
          // Always use ALL measurements for this variable and pen for the trend chart
          // This ensures we show the full history across all reports
          const variableMeasurementsForAllReports = measurements
            .filter(m => m.pen === selectedPen)
            .filter(m => m.variable === variable);
          
          // Process ALL reports to show in the trend chart
          variableMeasurementsForAllReports.forEach(measurement => {
            const reportId = String(measurement.report_id);
            const value = Number(measurement.value);
            
            if (isNaN(value)) return;
            
            if (!reportsMap.has(reportId)) {
              reportsMap.set(reportId, {
                reportId,
                date: measurement.measureDate ? new Date(measurement.measureDate) : new Date(),
                values: [],
                count: 0,
                sum: 0
              });
            }
            
            const report = reportsMap.get(reportId);
            if (report) {
              report.values.push(value);
              report.count++;
              report.sum += value;
            }
          });
          
          // For the distribution chart, we still use filtered measurements based on selected report
          // But for the trend chart above, we use ALL reports
          
          // Convert map to array and calculate averages
          const allReports = Array.from(reportsMap.values())
            .map(report => ({
              reportId: report.reportId,
              date: report.date,
              average: report.count > 0 ? report.sum / report.count : 0,
              count: report.count,
              min: report.values.length > 0 ? Math.min(...report.values) : 0,
              max: report.values.length > 0 ? Math.max(...report.values) : 0
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date
          
          // Chart data for evolution (line chart)
          const evolutionData = {
            labels: allReports.map(report => 
              report.date.toLocaleDateString()
            ),
            datasets: [{
              label: 'Promedio por reporte',
              data: allReports.map(report => report.average),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.3,
              pointRadius: 4,
              fill: true,
              pointBackgroundColor: 'rgb(75, 192, 192)',
              pointBorderColor: '#fff',
              pointHoverRadius: 5,
              pointHoverBackgroundColor: 'rgb(75, 192, 192)',
              pointHoverBorderColor: '#fff',
              pointHitRadius: 10,
              pointBorderWidth: 2,
            }],
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
                display: false
              },
              title: {
                display: true,
                text: 'Evolución en el tiempo',
                font: {
                  size: 14
                }
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    const report = allReports[context.dataIndex];
                    if (!report) return '';
                    
                    const avg = report.average.toFixed(2);
                    const min = report.min.toFixed(2);
                    const max = report.max.toFixed(2);
                    const date = report.date.toLocaleDateString();
                    
                    return [
                      `Reporte: #${report.reportId}`,
                      `Fecha: ${date}`,
                      `Muestras: ${report.count}`,
                      `Promedio: ${avg}`,
                      `Mínimo: ${min}`,
                      `Máximo: ${max}`
                    ];
                  },
                  title: () => `Variable: ${variable}`,
                  afterLabel: (context: any) => {
                    const report = allReports[context.dataIndex];
                    if (!report || optimalMin === undefined || optimalMax === undefined) return '';
                    
                    const isInRange = report.average >= optimalMin && report.average <= optimalMax;
                    return `Estado: ${isInRange ? '✅ En rango óptimo' : '⚠️ Fuera de rango'}`;
                  }
                },
                padding: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                  size: 14,
                  weight: 'bold' as const
                },
                bodyFont: {
                  size: 12
                },
                displayColors: false
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Fecha del reporte'
                },
                grid: {
                  display: false
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Valor promedio'
                },
                beginAtZero: false,
                min: absoluteMin !== undefined ? Math.max(0, absoluteMin * 0.9) : undefined,
                max: absoluteMax !== undefined ? absoluteMax * 1.1 : undefined,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              }
            },
            elements: {
              line: {
                borderWidth: 2
              }
            }
          };
          
          return (
            <div key={variable} className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <div>
                  <span>{variable}</span>
                  <span className="text-xs text-gray-500 block">{latestReportMeasurements[0]?.type_of_object || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  {correctPercentage >= 80 ? (
                    <svg className="w-5 h-5 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : correctPercentage >= 50 ? (
                    <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  )}
                  <span className="text-sm font-medium ml-2 px-2 py-1 bg-gray-100 rounded-full">
                    {correctPercentage}% correcto ({correctCount}/{totalCount})
                  </span>
                </div>
              </h3>
              
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
                    {optimalMin !== undefined && optimalMax !== undefined ? (
                      <span>Rango óptimo: {optimalMin} - {optimalMax}</span>
                    ) : (
                      <span>Último valor: {latestReportMeasurements[0].value}</span>
                    )}
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
