import React from "react";
import RadialGauge from "./RadialGauge";

interface Measurement {
  variable: string;
  value: string | number;
  measureDate: string;
  pen: string;
  correct: number;
  type_of_object: string;
  report_id: string | number;
  optimal_values?: string[];
  optimo_min?: number;
  optimo_max?: number;
}

interface PensTabProps {
  measurementsToShow: Measurement[];
  measurements: Measurement[];
  selectedPen: string;
  setSelectedPen: (pen: string) => void;
  selectedReportId: string;
  setSelectedReportId: (id: string) => void;
}

const PensTab: React.FC<PensTabProps> = ({
  measurementsToShow,
  measurements,
  selectedPen,
  setSelectedPen,
  selectedReportId,
  setSelectedReportId,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-4 md:mb-0">Análisis por Corral</h2>
        <div className="flex flex-col md:flex-row md:space-x-4 w-full md:w-auto">
          {/* Report Dropdown */}
          <div className="mb-2 md:mb-0">
            <label htmlFor="report-pen-tab-select" className="block text-xs font-medium mb-1">Reporte</label>
            <select
              id="report-pen-tab-select"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 min-w-[150px]"
              value={selectedReportId}
              onChange={e => {
                setSelectedReportId(e.target.value);
                setSelectedPen(""); // Reset pen selection when report changes
              }}
            >
              <option value="">Todos los reportes</option>
              {Array.from(new Set(measurements.map((m: Measurement) => m.report_id)))
                .sort((a, b) => Number(b) - Number(a))
                .map((id) => {
                  const date = measurements.find((m: Measurement) => m.report_id === id)?.measureDate;
                  return (
                    <option key={id} value={id}>
                      {date ? new Date(date).toLocaleDateString() : id}
                    </option>
                  );
                })}
            </select>
          </div>
          {/* Pen Dropdown */}
          <div>
            <label htmlFor="pen-select" className="block text-xs font-medium mb-1">Corral</label>
            <select
              id="pen-select"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 min-w-[150px]"
              value={selectedPen}
              onChange={e => setSelectedPen(e.target.value)}
              disabled={measurementsToShow.length === 0}
            >
              <option value="">Seleccionar corral</option>
              {Array.from(new Set(measurementsToShow.map((m: Measurement) => m.pen)))
                .filter(pen => pen && pen !== "")
                .map(pen => (
                  <option key={pen} value={pen}>{pen}</option>
                ))}
            </select>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(new Set(measurementsToShow.map(m => m.pen))).map(pen => {
          const penMeasurements = measurementsToShow.filter(m => m.pen === pen);
          const totalCount = penMeasurements.length;
          const correctCount = penMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
          const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
          // Icon logic
          let icon = null;
          if (percent >= 85) {
            icon = (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            );
          } else if (percent >= 70) {
            icon = (
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
              </svg>
            );
          } else {
            icon = (
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
              </svg>
            );
          }
          return (
            <div
              key={pen}
              className={
                `bg-white p-6 rounded-lg shadow flex flex-col justify-between min-h-[170px] border transition-all ` +
                (selectedPen === pen ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent')
              }
            >
              <div>
                <h3 className="text-lg font-semibold mb-1">{pen}</h3>
                <span className="text-sm text-gray-500">Score de salud</span>
                <div className="text-3xl font-bold mt-2">{percent}%</div>
                <div className="text-sm text-gray-500">{correctCount}/{totalCount} mediciones</div>
              </div>
              <div className="mt-2 flex justify-end">{icon}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PensTab;
