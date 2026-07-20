"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, LayoutGrid, Layers, BarChart3, Download, FileText, TrendingUp, Activity, Warehouse, Leaf, AlertTriangle } from 'lucide-react';
import useFieldStore from "@/store/fieldStore";

// Register Chart.js elements for all charts in this file
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { Bar } from 'react-chartjs-2';

import RadialGauge from "../RadialGauge";
import { Tab } from "@headlessui/react";
import VariableCharts from "../VariableCharts";
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import useReportStore from '@/store/reportStore';
import { useChatbotStore } from '@/store/chatbotStore';
import { Chatbot } from '@/components/Chatbot/Chatbot';

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
    min?: number; // absolute minimum value
    max?: number; // absolute maximum value
    field_id?: string; // Added field_id
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
    { key: "numerical" as TabType, label: "Variables" },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

// Utilidad para convertir SVG a imagen base64
async function svgToPngDataUrl(svgElement: SVGSVGElement, width = 140, height = 140): Promise<string> {
  return new Promise((resolve) => {
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const pngDataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(pngDataUrl);
      } else {
        resolve('');
      }
    };
    img.src = url;
  });
}

const DashboardPage: React.FC = () => {
    const [selectedField, setSelectedField] = useState<Field | AllFieldsOption>({
        value: "all",
        label: "Todos los campos",
    });
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFields, setLoadingFields] = useState(false);
    const [selectedTab, setSelectedTab] = useState<TabType>("general");
    const [selectedPen, setSelectedPen] = useState<string>("");
    const [selectedReportId, setSelectedReportId] = useState<string>("");
    const [selectedReportIdForSummary, setSelectedReportIdForSummary] = useState<string>("");
    const [selectedVariable, setSelectedVariable] = useState<string>("");
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
    const { getReportsByField, reportsByField, reportLoading } = useReportStore();

    const handleReportChangeForSummary = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedReportIdForSummary(event.target.value);
    };
    
    // Filtered measurements for the selected report date
    const measurementsToShow = selectedReportId
        ? measurements.filter((m: Measurement) => String(m.report_id) === String(selectedReportId))
        : measurements;

    // Assuming reportOptions is defined elsewhere, e.g.:
    // const reportOptions = useMemo(() => { ... }, [measurements]);
    // For this change, we'll mock it if not found, or use the real one if present.
    // THIS IS A CRITICAL DEPENDENCY FOR THE BELOW LOGIC.

    const reportOptions = useMemo(() => {
        if (!measurements.length) return [];
        const uniqueReports = measurements.reduce((acc, m) => {
            if (!acc.find(report => String(report.id) === String(m.report_id))) {
                acc.push({ id: String(m.report_id), date: m.measureDate });
            }
            return acc;
        }, [] as { id: string; date: string }[]);

        return uniqueReports
            .map(report => ({
                value: report.id,
                label: `${new Date(report.date).toLocaleDateString()} (ID: ${report.id})`
            }))
            .sort((a, b) => Number(a.value) - Number(b.value)); // Sort by report_id ascending
    }, [measurements]);

    const summaryReportMeasurements = useMemo(() => {
        if (!selectedReportIdForSummary && reportOptions.length > 0) {
            const actualReportOptions = reportOptions.filter(opt => opt.value !== 'all');
            if (actualReportOptions.length > 0) {
                const latestId = String(actualReportOptions[actualReportOptions.length - 1].value);
                return measurements.filter((m: Measurement) => String(m.report_id) === latestId);
            }
            return []; 
        }
        if (selectedReportIdForSummary) {
            return measurements.filter((m: Measurement) => String(m.report_id) === String(selectedReportIdForSummary));
        }
        return [];
    }, [measurements, selectedReportIdForSummary, reportOptions]);

    useEffect(() => {
        if (reportOptions.length > 0 && !selectedReportIdForSummary) {
            const actualReportOptions = reportOptions.filter(opt => opt.value !== 'all');
            if (actualReportOptions.length > 0) {
                setSelectedReportIdForSummary(String(actualReportOptions[actualReportOptions.length - 1].value));
            }
        }
    }, [reportOptions, selectedReportIdForSummary, setSelectedReportIdForSummary]);

    // Reset summary report selection if the selected report is invalid after field/report changes
    useEffect(() => {
        if (!reportOptions.length) {
            if (selectedReportIdForSummary) setSelectedReportIdForSummary("");
            return;
        }
        const actualReportOptions = reportOptions.filter(opt => opt.value !== 'all');
        const validReportIds = actualReportOptions.map(opt => String(opt.value));
        // If the current selectedReportIdForSummary is not in the valid list, reset it
        if (!validReportIds.includes(String(selectedReportIdForSummary))) {
            // Pick the latest (last, assuming sorted ascending by report_id)
            if (validReportIds.length > 0) {
                setSelectedReportIdForSummary(validReportIds[validReportIds.length - 1]);
            } else {
                setSelectedReportIdForSummary("");
            }
        }
    }, [reportOptions, measurements, selectedReportIdForSummary, setSelectedReportIdForSummary]);

    const { getFieldsByUser, fieldsByUserId, getCategoricalMeasurementsByFieldId, getNumericalMeasurementsByFieldId } = useFieldStore();
    
    // Track when dropdown is opened
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            if (!fieldsByUserId?.length && isDropdownOpen) {
                setLoadingFields(true);
                try {
                    await getFieldsByUser();
                } finally {
                    setLoadingFields(false);
                }
            }
        };
        fetch();
    }, [getFieldsByUser, fieldsByUserId, isDropdownOpen])

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
        
        // Set chatbot field selection
        if (selected.value === "all") {
            useChatbotStore.getState().setSelectedFieldId(null);
        } else if ('id' in selected) {
            useChatbotStore.getState().setSelectedFieldId(selected.id);
        }
        
        if (selected.value !== "all" && 'id' in selected) {
            setLoading(true);
            try {
                const [categoricalData, numericalData] = await Promise.all([
                    getCategoricalMeasurementsByFieldId(selected.id),
                    getNumericalMeasurementsByFieldId(selected.id)
                ]);
                const normalizeData = (data: any[]) => {
                  return data.map(m => {
                    // For numerical data, ensure min/max values are properly handled
                    const normalized = {
                      variable: m.variable,
                      value: m.measured_value,
                      measureDate: m.measure_date,
                      pen: m.pen_name,
                      correct: m.correct,
                      type_of_object: m.type_of_object,
                      report_id: m.report_id,
                      optimal_values: m.optimal_values || m.optimal_values === '' ? 
                        (Array.isArray(m.optimal_values) ? m.optimal_values : 
                        (typeof m.optimal_values === 'string' ? m.optimal_values.split(',').map((s: string) => s.trim()).filter(Boolean) : [])) : 
                        undefined,
                      optimo_min: m.optimo_min !== undefined ? Number(m.optimo_min) : undefined,
                      optimo_max: m.optimo_max !== undefined ? Number(m.optimo_max) : undefined,
                      min: m.min !== undefined && m.min !== null ? Number(m.min) : undefined,
                      max: m.max !== undefined && m.max !== null ? Number(m.max) : undefined,
                    };
                    
                    // Debug log for numerical variables
                    if (m.type_of_object === 'numerical') {
                      console.log('Normalized numerical measurement:', {
                        variable: normalized.variable,
                        value: normalized.value,
                        min: normalized.min,
                        max: normalized.max,
                        optimo_min: normalized.optimo_min,
                        optimo_max: normalized.optimo_max,
                        rawData: m
                      });
                    }
                    
                    return normalized;
                  });
                };

                const combinedData = [
                    ...normalizeData(categoricalData),
                    ...normalizeData(numericalData)
                ];

                // Sort by date, most recent first
                combinedData.sort((a, b) => new Date(b.measureDate).getTime() - new Date(a.measureDate).getTime());
                
                setMeasurements(combinedData);
                
                // Set the latest report as selected by default
                if (combinedData.length > 0) {
                    // Get all unique report_ids
                    const reportIds = Array.from(new Set(combinedData.map(m => m.report_id)));
                    
                    // Sort by report_id numerically (assuming report_id reflects chronology)
                    const sortedReportIds = reportIds.sort((a, b) => Number(b) - Number(a));
                    
                    // Select the first one (latest)
                    if (sortedReportIds.length > 0) {
                        setSelectedReportId(String(sortedReportIds[0]));
                    }
                }
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

    // Obtener reportes únicos de las mediciones actuales (sin filtrar por field_id)
    const fieldReports = React.useMemo(() => {
      // Extrae reportes únicos por id de las mediciones visibles
      const uniqueReports: { id: string, name?: string, created_at?: string }[] = [];
      const seen = new Set();
      for (const m of measurements) {
        if (!seen.has(String(m.report_id))) {
          uniqueReports.push({
            id: String(m.report_id),
            name: undefined, // Si tienes el nombre, puedes extraerlo aquí
            created_at: m.measureDate
          });
          seen.add(String(m.report_id));
        }
      }
      return uniqueReports;
    }, [measurements]);

    // Cargar reportes del campo al abrir modal
    useEffect(() => {
      if (showExportModal && selectedField.value !== 'all') {
        getReportsByField(selectedField.value as string);
      }
    }, [showExportModal, selectedField, getReportsByField]);

    // Abrir modal en vez de exportar directo
    const handleExportHistoricToPDF = () => {
      setShowExportModal(true);
      setSelectedReportIds([]);
      // Debug: log campo y reportes únicos
      console.log('Campo seleccionado:', selectedField);
      console.log('Reportes únicos detectados:', fieldReports);
    };

    // Seleccionar/deseleccionar todos
    const handleSelectAll = () => {
      if (selectedReportIds.length === fieldReports.length) {
        setSelectedReportIds([]);
      } else {
        setSelectedReportIds(fieldReports.map(r => r.id));
      }
    };

    // Confirmar selección y exportar
    const handleConfirmExport = () => {
      setShowExportModal(false);
      if (selectedReportIds.length === 0) return;
      // Filtra las mediciones solo de los reportes seleccionados
      const selectedMeasurements = measurements.filter(m => selectedReportIds.includes(String(m.report_id)));
      // Ordena los reportes seleccionados de más nuevo a más viejo
      const reportIdsSorted = [...selectedReportIds].sort((a, b) => Number(b) - Number(a));
      // Llama a la función de exportación pasando solo los reportes seleccionados y todas las mediciones del campo
      exportSelectedReportsToPDF(selectedMeasurements, reportIdsSorted, measurements);
    };

    const handleDownloadAllMeasurements = () => {
      // Placeholder for CSV generation and download logic
      // It will use the 'measurements' state variable from DashboardPage, 
      // which holds all measurements for the selected field.
      console.log("Downloading all measurements...", measurements);
      const dataToDownload = measurements; // Use the 'measurements' state variable
      if (dataToDownload.length === 0) {
        alert("No hay mediciones para descargar.");
        return;
      }

      const headers = [
        "Report ID", "Variable", "Valor", "Corral", "Fecha", 
        "Correcto", "Tipo de Objeto", "Valores Óptimos", 
        "Óptimo Mínimo", "Óptimo Máximo", "Mínimo", "Máximo"
      ];
      const csvRows = [
        headers.join(',')
      ];

      dataToDownload.forEach((m: Measurement) => {
        const row = [
          `"${m.report_id || ''}"`, 
          `"${m.variable || ''}"`, 
          `"${m.value !== undefined ? String(m.value) : ''}"`, 
          `"${m.pen || ''}"`, 
          `"${m.measureDate ? new Date(m.measureDate).toLocaleString() : ''}"`, 
          `"${(String(m.correct) === '1' || String(m.correct) === 'true') ? 'Sí' : 'No'}"`, 
          `"${m.type_of_object || ''}"`, 
          `"${Array.isArray(m.optimal_values) ? m.optimal_values.join('; ') : ''}"`, 
          `"${m.optimo_min !== undefined ? m.optimo_min : ''}"`, 
          `"${m.optimo_max !== undefined ? m.optimo_max : ''}"`, 
          `"${m.min !== undefined ? m.min : ''}"`, 
          `"${m.max !== undefined ? m.max : ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      // Generate filename
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
      let fieldNameForFile = "todos_los_campos"; // Default for 'all' fields
      if (selectedField && selectedField.value !== 'all') {
        fieldNameForFile = selectedField.label.toLowerCase().replace(/\s+/g, '_');
      }
      const filename = `${fieldNameForFile}_${timestamp}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Nueva función para exportar solo los reportes seleccionados
    function exportSelectedReportsToPDF(selectedMeasurements: Measurement[], reportIdsSorted: string[], allMeasurements: Measurement[]) {
      // 1. Totales históricos (siempre al inicio, usando todas las mediciones del campo)
      const totalReportes = new Set(allMeasurements.map(m => m.report_id)).size;
      const totalMediciones = allMeasurements.length;
      const totalAnimales = allMeasurements.filter(m => m.type_of_object === 'Animal').length;
      const totalInstalacion = allMeasurements.filter(m => m.type_of_object === 'Installation').length;

      // 2. Crear PDF
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 10;
      doc.setFontSize(20);
      doc.setTextColor(30,30,30);
      doc.text('Histórico de Reportes', 10, y);
      y += 10;

      // --- Cards modernos para los totales (centradas) ---
      const cardW = 45, cardH = 22, gap = 10;
      const cardBg = [245, 247, 250]; // gris muy suave
      const cardBorder = [220, 220, 220];
      const cardTitles = [
        { label: 'Total Reportes', value: totalReportes },
        { label: 'Total Mediciones', value: totalMediciones },
        { label: 'Total Animales', value: totalAnimales },
        { label: 'Total Instalación', value: totalInstalacion }
      ];
      const cardsBlockWidth = cardTitles.length * cardW + (cardTitles.length - 1) * gap;
      const startX = (pageWidth - cardsBlockWidth) / 2;
      const startY = y;
      cardTitles.forEach((card, i) => {
        const x = startX + i * (cardW + gap);
        doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
        doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
        doc.roundedRect(x, startY, cardW, cardH, 5, 5, 'F');
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(card.label, x + cardW/2, startY + 9, { align: 'center' });
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(String(card.value), x + cardW/2, startY + 18, { align: 'center' });
      });
      y += cardH + 12;

      // 3. Gráfico de barras del historial de % correctos por reporte (usando todas las mediciones del campo)
      doc.setFontSize(13);
      doc.setTextColor(30,30,30);
      doc.text('% Correctos por Reporte - Historial', pageWidth/2, y, { align: 'center' });
      y += 8;

      // Preparar datos para el gráfico (usando todas las mediciones del campo)
      const allReportIdStrings = [...new Set(allMeasurements.map(m => String(m.report_id)))].sort((a, b) => Number(a) - Number(b));
      const chartLabels: string[] = [];
      const healthPercentages: number[] = [];

      allReportIdStrings.forEach(reportId => {
        const reportMeasurements = allMeasurements.filter(m => String(m.report_id) === reportId);
        // Determine label (report date)
        const firstMeasurementOfReport = reportMeasurements[0];
        if (firstMeasurementOfReport && firstMeasurementOfReport.measureDate) {
          chartLabels.push(new Date(firstMeasurementOfReport.measureDate).toLocaleDateString());
        } else {
          chartLabels.push(`Reporte ${reportId}`); // Fallback
        }
        // Calculate overall health percentage
        const totalMeasurements = reportMeasurements.length;
        const correctMeasurements = reportMeasurements.filter(
          m => String(m.correct) === '1' || String(m.correct) === 'true'
        ).length;
        const healthPercentage = totalMeasurements > 0
          ? Math.round((correctMeasurements / totalMeasurements) * 100)
          : 0;
        healthPercentages.push(healthPercentage);
      });

      // --- Gráfico de barras más pequeño y centrado ---
      if (healthPercentages.length > 0) {
        const chartWidth = 180;
        const chartHeight = 55;
        const chartX = (pageWidth - chartWidth) / 2;
        const chartY = y;
        const barWidth = chartWidth / healthPercentages.length * 0.7; // 70% del espacio disponible
        const barSpacing = chartWidth / healthPercentages.length * 0.3; // 30% para espaciado

        // Ejes
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.7);
        doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // X
        doc.line(chartX, chartY, chartX, chartY + chartHeight); // Y

        // Líneas horizontales
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        for (let i = 0; i <= 10; i++) {
          const lineY = chartY + chartHeight - (chartHeight * i / 10);
          doc.line(chartX, lineY, chartX + chartWidth, lineY);
        }

        // Barras
        healthPercentages.forEach((percentage, index) => {
          const barX = chartX + (index * (barWidth + barSpacing)) + barSpacing / 2;
          const barHeight = (percentage / 100) * chartHeight;
          const barY = chartY + chartHeight - barHeight;

          // Color moderno
          if (percentage >= 80) {
            doc.setFillColor(40, 167, 69); // Verde
          } else if (percentage >= 60) {
            doc.setFillColor(255, 193, 7); // Amarillo
          } else {
            doc.setFillColor(220, 53, 69); // Rojo
          }

          doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');

          // Porcentaje en la barra
          if (barHeight > 12) {
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            const textWidth = doc.getTextWidth(`${percentage}%`);
            doc.text(`${percentage}%`, barX + barWidth/2 - textWidth/2, barY + barHeight/2 + 2.5);
          }

          // Etiqueta X
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          const label = chartLabels[index];
          const labelWidth = doc.getTextWidth(label);
          doc.text(label, barX + barWidth/2 - labelWidth/2, chartY + chartHeight + 5);
        });

        // Etiquetas Y
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        for (let i = 0; i <= 10; i++) {
          const labelY = chartY + chartHeight - (chartHeight * i / 10) + 2.5;
          const label = `${i * 10}%`;
          const labelWidth = doc.getTextWidth(label);
          doc.text(label, chartX - labelWidth - 3, labelY);
        }

        y += chartHeight + 18; // Espacio para el gráfico + etiquetas
      }

      // 4. Para cada reporte seleccionado, mostrar gauges, cards de corrales y de variables
      for (const reportId of reportIdsSorted) {
        const reportMeasurements = selectedMeasurements.filter(m => String(m.report_id) === String(reportId));
        if (!reportMeasurements.length) continue;
        doc.addPage();
        let yR = 20;
        // Título con fecha
        let fechaReporte = '-';
        if (reportMeasurements[0]?.measureDate) {
          fechaReporte = new Date(reportMeasurements[0].measureDate).toLocaleDateString();
        }
        doc.setFontSize(22);
        doc.setTextColor(30,30,30);
        doc.text(`Reporte: ${fechaReporte}`, 10, yR);
        yR += 14;
        // Calcular porcentajes para los gauges antes de dibujar cards/gauges
        const totalCountGeneral = reportMeasurements.length;
        const correctCountGeneral = reportMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
        const percentGeneral = totalCountGeneral > 0 ? Math.round((correctCountGeneral / totalCountGeneral) * 100) : 0;
        // Animales
        const animalMeasurements = reportMeasurements.filter(m => m.type_of_object === 'Animal');
        const totalCountAnimal = animalMeasurements.length;
        const correctCountAnimal = animalMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
        const percentAnimal = totalCountAnimal > 0 ? Math.round((correctCountAnimal / totalCountAnimal) * 100) : 0;
        // Instalaciones
        const installationMeasurements = reportMeasurements.filter(m => m.type_of_object === 'Installation');
        const totalCountInstallation = installationMeasurements.length;
        const correctCountInstallation = installationMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
        const percentInstallation = totalCountInstallation > 0 ? Math.round((correctCountInstallation / totalCountInstallation) * 100) : 0;

        // --- Cards resumen del reporte alineadas a la izquierda (moderno) ---
        const cardW = 42, cardH = 24, gap = 14;
        const cardBg = [240, 245, 250];
        const cardShadow = [210, 220, 230];
        const cardBorder = [220, 220, 220];
        const cardRadius = 7;
        const resumenCards = [
          { label: 'Cantidad Mediciones', value: reportMeasurements.length },
          { label: 'Total Corrales', value: new Set(reportMeasurements.map(m => m.pen)).size },
          { label: 'Variables Medidas', value: new Set(reportMeasurements.map(m => m.variable)).size }
        ];
        const startX = 18, startY = yR + 8;
        resumenCards.forEach((card, i) => {
          const x = startX;
          const y = startY + i * (cardH + gap);
          // Sombra
          doc.setDrawColor(cardShadow[0], cardShadow[1], cardShadow[2]);
          doc.setFillColor(cardShadow[0], cardShadow[1], cardShadow[2]);
          doc.roundedRect(x+1.5, y+2.5, cardW, cardH, cardRadius, cardRadius, 'F');
          // Card principal
          doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
          doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
          doc.roundedRect(x, y, cardW, cardH, cardRadius, cardRadius, 'F');
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(card.label, x + cardW/2, y + 9, { align: 'center' });
          doc.setFontSize(16);
          doc.setTextColor(30, 30, 30);
          doc.setFont('helvetica', 'bold');
          doc.text(String(card.value), x + cardW/2, y + 18, { align: 'center' });
          doc.setFont('helvetica', 'normal');
        });
        // --- Gauges modernos centrados ---
        const gaugeRadius = 22;
        const gaugeGap = 22;
        const gaugesBlockWidth = 3 * gaugeRadius * 2 + 2 * gaugeGap;
        const pageWidth = doc.internal.pageSize.getWidth();
        const cardsBlockHeight = resumenCards.length * cardH + (resumenCards.length - 1) * gap;
        const gaugesStartX = (pageWidth - gaugesBlockWidth) / 2;
        const gaugesY = startY + cardsBlockHeight / 2 - gaugeRadius;
        const gaugeLabels = ['General', 'Animales', 'Instalaciones'];
        const gaugePercents = [percentGeneral, percentAnimal, percentInstallation];
        
        // Función para obtener color moderno del gauge
        const getModernGaugeColor = (percent: number) => {
          if (percent >= 80) return [34, 197, 94]; // Verde moderno
          if (percent >= 60) return [251, 146, 60]; // Naranja moderno
          if (percent >= 40) return [251, 191, 36]; // Amarillo moderno
          return [239, 68, 68]; // Rojo moderno
        };
        
        gaugePercents.forEach((percent, i) => {
          const cx = gaugesStartX + i * (gaugeRadius * 2 + gaugeGap) + gaugeRadius;
          const cy = gaugesY + gaugeRadius;
          
          // Sombra exterior más suave y moderna
          doc.setDrawColor(240, 240, 240);
          doc.setFillColor(255, 255, 255);
          doc.circle(cx, cy, gaugeRadius + 6, 'F');
          
          // Fondo del gauge con gradiente sutil
          doc.setDrawColor(245, 245, 245);
          doc.setFillColor(250, 250, 250);
          doc.circle(cx, cy, gaugeRadius + 2, 'F');
          
          // Gauge principal con borde más suave
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(3);
          doc.circle(cx, cy, gaugeRadius, 'S');
          
          // Arco de progreso CONTINUO (sin líneas blancas)
          const startAngle = -Math.PI/2;
          const endAngle = startAngle + (2 * Math.PI * (percent/100));
          const [r, g, b] = getModernGaugeColor(percent);
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(8);
          // Dibuja el arco como una polilínea continua
          const steps = 180; // muchos pasos para que sea liso
          let prev = null;
          for (let j = 0; j <= steps * (percent/100); j++) {
            const angle = startAngle + ((endAngle - startAngle) * (j / (steps * (percent/100))));
            const x = cx + gaugeRadius * Math.cos(angle);
            const y = cy + gaugeRadius * Math.sin(angle);
            if (prev) doc.line(prev[0], prev[1], x, y);
            prev = [x, y];
          }
          
          // Círculo central blanco con sombra
          doc.setDrawColor(255, 255, 255);
          doc.setFillColor(255, 255, 255);
          doc.circle(cx, cy, gaugeRadius - 6, 'F');
          
          // Porcentaje centrado con tipografía moderna
          doc.setFontSize(14);
          doc.setTextColor(30, 30, 30);
          doc.setFont('helvetica', 'bold');
          const percentText = `${percent}%`;
          const textWidth = doc.getTextWidth(percentText);
          doc.text(percentText, cx - textWidth/2, cy + 5);
          doc.setFont('helvetica', 'normal');
          
          // Label debajo con mejor espaciado
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const label = gaugeLabels[i];
          const labelWidth = doc.getTextWidth(label);
          doc.text(label, cx - labelWidth/2, cy + gaugeRadius + 12);
          
          // Indicador de punto en el extremo del arco (opcional)
          if (percent > 0) {
            const endX = cx + gaugeRadius * Math.cos(endAngle);
            const endY = cy + gaugeRadius * Math.sin(endAngle);
            doc.setDrawColor(r, g, b);
            doc.setFillColor(255, 255, 255);
            doc.circle(endX, endY, 2, 'F');
            doc.setLineWidth(1);
            doc.circle(endX, endY, 2, 'S');
          }
        });
        // Ajustar yR para el siguiente bloque (cards + gauges)
        const gaugesBlockHeight = gaugeRadius * 2 + 20;
        yR = Math.max(startY + cardsBlockHeight, gaugesY + gaugeRadius + 20) + 12;
   
        const pensR = Array.from(new Set(reportMeasurements.map(m => m.pen))).filter(pen => pen);
        if (pensR.length) {
          yR += 10;
          doc.setFontSize(15);
          doc.text('Análisis por Corral', 10, yR);
          yR += 8;
          let col = 0, x0 = 10, cardW = 90, cardH = 60, gapX = 8, gapY = 8;
          const pageHeight = doc.internal.pageSize.getHeight();
          const margen = 10;
          pensR.forEach((pen, idx) => {
            if (yR + cardH + margen > pageHeight) {
              doc.addPage();
              yR = margen;
              col = 0;
            }
            const penMeasurements = reportMeasurements.filter(m => m.pen === pen);
            const totalCount = penMeasurements.length;
            const correctCount = penMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
            const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
            // Animales
            const animalMeasurements = penMeasurements.filter(m => m.type_of_object === 'Animal');
            const animalTotal = animalMeasurements.length;
            const animalCorrect = animalMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
            const animalPercent = animalTotal > 0 ? Math.round((animalCorrect / animalTotal) * 100) : null;
            // Instalaciones
            const installMeasurements = penMeasurements.filter(m => m.type_of_object === 'Installation');
            const installTotal = installMeasurements.length;
            const installCorrect = installMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
            const installPercent = installTotal > 0 ? Math.round((installCorrect / installTotal) * 100) : null;
            // Posición
            const x = x0 + col * (cardW + gapX);
            const yCard = yR;
            // Card
            doc.setDrawColor(200);
            doc.setFillColor(245,245,245);
            doc.roundedRect(x, yCard, cardW, cardH, 4, 4, 'F');
            doc.setFontSize(12);
            doc.setTextColor(30,30,30);
            doc.text(pen, x + 4, yCard + 8);
            doc.setFontSize(10);
            doc.setTextColor(100,100,100);
            doc.text('Score de salud', x + 4, yCard + 15);
            doc.setFontSize(16);
            doc.setTextColor(30,30,30);
            doc.text(`${percent}%`, x + 4, yCard + 25);
            doc.setFontSize(10);
            doc.setTextColor(100,100,100);
            doc.text(`${correctCount}/${totalCount} mediciones`, x + 4, yCard + 32);
            // Barra de score de salud
            const barX = x + 4;
            const barY = yCard + 30;
            const barW = cardW - 8;
            const barH = 3;
            
            let nextBarY = barY + barH;
            // Animales
            if (animalTotal > 0) {
              doc.setFontSize(9);
              doc.setTextColor(60,60,60);
              doc.text(`Animales: ${animalPercent !== null ? animalPercent + '%' : '-'} (${animalCorrect}/${animalTotal})`, x + 4, nextBarY + 6);
              // Barra de animales
              const barColorAnimal: [number, number, number] = animalPercent !== null && animalPercent < 50 ? [220,53,69] : animalPercent !== null && animalPercent < 80 ? [255,193,7] : [40,167,69];
              const barX = x + 4;
              const barW = cardW - 8;
              const barH = 3;
              doc.setFillColor(230,230,230);
              doc.roundedRect(barX, nextBarY + 8, barW, barH, 1, 1, 'F');
              doc.setFillColor(...barColorAnimal);
              doc.roundedRect(barX, nextBarY + 8, barW * ((animalPercent ?? 0)/100), barH, 1, 1, 'F');
              nextBarY += 14;
            }
            // Instalaciones
            if (installTotal > 0) {
              doc.setFontSize(9);
              doc.setTextColor(60,60,60);
              doc.text(`Instalaciones: ${installPercent !== null ? installPercent + '%' : '-'} (${installCorrect}/${installTotal})`, x + 4, nextBarY + 6);
              // Barra de instalaciones
              const barColorInst: [number, number, number] = installPercent !== null && installPercent < 50 ? [220,53,69] : installPercent !== null && installPercent < 80 ? [255,193,7] : [255,152,0];
              const barX = x + 4;
              const barW = cardW - 8;
              const barH = 3;
              doc.setFillColor(230,230,230);
              doc.roundedRect(barX, nextBarY + 8, barW, barH, 1, 1, 'F');
              doc.setFillColor(...barColorInst);
              doc.roundedRect(barX, nextBarY + 8, barW * ((installPercent ?? 0)/100), barH, 1, 1, 'F');
              nextBarY += 14;
            }
            col++;
            if (col === 3) { col = 0; yR += cardH + gapY; }
          });
          if (col !== 0) yR += cardH + gapY;
        }
        // Cards de variables por reporte (igual que antes)
        const variablesR = Array.from(new Set(reportMeasurements.map(m => m.variable))).filter(v => v);
        if (variablesR.length) {
          yR += 10;
          doc.setFontSize(15);
          doc.text('Análisis por Variable', 10, yR);
          yR += 10;
          let colV = 0, x0V = 10, cardWV = 120, cardHV = 55, gapXV = 12, gapYV = 12;
          const pageHeight = doc.internal.pageSize.getHeight();
          const margen = 10;
          variablesR.forEach((variable, idx) => {
            if (yR + cardHV + margen > pageHeight) {
              doc.addPage();
              yR = margen + 10;
              colV = 0;
            }
            const varMeasurements = reportMeasurements.filter(m => m.variable === variable);
            const type = varMeasurements[0]?.type_of_object || '-';
            const totalCount = varMeasurements.length;
            const correctCount = varMeasurements.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
            const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
            // Posición
            const x = x0V + colV * (cardWV + gapXV);
            const yCard = yR;
            // Card
            doc.setDrawColor(200);
            doc.setFillColor(250,250,250);
            doc.roundedRect(x, yCard, cardWV, cardHV, 4, 4, 'F');
            doc.setFontSize(13);
            doc.setTextColor(30,30,30);
            doc.text(variable, x + 4, yCard + 10);
            doc.setFontSize(10);
            doc.setTextColor(120,120,120);
            doc.text(type, x + 4, yCard + 17);
            doc.text('Score de salud', x + 4, yCard + 23);
            doc.setFontSize(16);
            doc.setTextColor(30,30,30);
            doc.text(`${percent}%`, x + 4, yCard + 33);
            doc.setFontSize(10);
            doc.setTextColor(100,100,100);
            doc.text(`${correctCount}/${totalCount} mediciones`, x + 4, yCard + 40);
            // Barra de score de salud para variable debajo del ratio
            const barX = x + 4;
            const barY = yCard + 43;
            const barW = cardWV - 8;
            const barH = 3;
            let barColor: [number, number, number] = [40, 167, 69]; // verde
            if (percent < 50) barColor = [220, 53, 69]; // rojo
            else if (percent < 80) barColor = [255, 193, 7]; // amarillo
            doc.setFillColor(230,230,230);
            doc.roundedRect(barX, barY, barW, barH, 1, 1, 'F');
            doc.setFillColor(...barColor);
            doc.roundedRect(barX, barY, barW * (percent/100), barH, 1, 1, 'F');
            colV++;
            if (colV === 2) { colV = 0; yR += cardHV + gapYV; }
          });
          if (colV !== 0) yR += cardHV + gapYV;
        }
      }
      // Descargar PDF
      doc.save('historico_dashboard.pdf');
    }

    /* ══════════ Redesign helpers (derived from existing state) ══════════ */
    const _pctArr = (arr: Measurement[]) =>
      arr.length ? Math.round((arr.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length / arr.length) * 100) : 0;
    const _stFromPct = (p: number): 'ok' | 'warn' | 'crit' => (p >= 80 ? 'ok' : p >= 60 ? 'warn' : 'crit');
    const _stLabel: Record<string, string> = { ok: 'óptimo', warn: 'atención', crit: 'crítico' };

    // previous report (relative to the summary report) for deltas
    const _idsDesc = Array.from(new Set(measurements.map(m => String(m.report_id)))).sort((a, b) => Number(b) - Number(a));
    const _curIdx = _idsDesc.indexOf(String(selectedReportIdForSummary));
    const _prevId = _curIdx >= 0 && _curIdx < _idsDesc.length - 1 ? _idsDesc[_curIdx + 1] : null;
    const _prevMeas = _prevId ? measurements.filter(m => String(m.report_id) === _prevId) : [];

    const renderGauge = (arr: Measurement[], prevArr: Measurement[], label: string, icon: React.ReactNode) => {
      const hasData = arr.length > 0;
      const percent = _pctArr(arr);
      const st = _stFromPct(percent);
      const C = 2 * Math.PI * 54;
      const delta = hasData && prevArr.length ? percent - _pctArr(prevArr) : null;
      return (
        <div className="rd-scorecard">
          <div className="rd-gauge-sm">
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="54" fill="none" stroke="var(--surface-sunk)" strokeWidth="12" />
              {hasData && (
                <circle cx="65" cy="65" r="54" fill="none" stroke={`var(--st-${st})`} strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - percent / 100)} transform="rotate(-90 65 65)" />
              )}
            </svg>
            <div className="center">
              {hasData ? <div className="g-num rd-num">{percent}%</div> : <div className="s-frac">Sin datos</div>}
            </div>
          </div>
          <div className="s-label">{icon} {label}</div>
          {hasData && <div className="s-frac rd-num">{arr.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length}/{arr.length} correctas</div>}
          {delta !== null && (
            <div className={`rd-delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}`}>
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '■'} {Math.abs(delta)}% vs. previo
            </div>
          )}
        </div>
      );
    };

    const _hasField = selectedField.value !== 'all' && measurements.length > 0;
    const _tabIcons = [<LayoutGrid key="g" />, <Layers key="p" />, <BarChart3 key="v" />];

    return (
      <>
        <div className="rd-page">
          {/* topbar */}
          <div className="rd-topbar">
            <div>
              <label className="rd-field-label">Campo</label>
              <select
                className="rd-select"
                value={selectedField.value}
                onMouseDown={() => { if (!fieldsByUserId?.length) getFieldsByUser(); }}
                onChange={(e) => handleFieldChange(e.target.value)}
              >
                {fields.map((field) => (
                  <option key={field.value} value={field.value}>{field.label}</option>
                ))}
              </select>
            </div>
            <div className="rd-top-right">
              <button className="rd-btn-outline" onClick={handleDownloadAllMeasurements} disabled={!_hasField}>
                <Download /> CSV
              </button>
              <button className="rd-btn" onClick={handleExportHistoricToPDF} disabled={!_hasField}>
                <FileText /> Exportar PDF
              </button>
            </div>
          </div>

          {/* header */}
          <div className="rd-greet">
            <div>
              <h1>Análisis del campo</h1>
              <div className="sub">
                {_hasField
                  ? <>Explorá mediciones, corrales y variables por reporte · <b>{measurements.length}</b> mediciones en <b>{new Set(measurements.map(m => m.report_id)).size}</b> reportes</>
                  : "Elegí un campo para ver su análisis detallado"}
              </div>
            </div>
          </div>

          {!_hasField ? (
            <section className="rd-card">
              <div className="rd-empty">
                <BarChart3 />
                <div>Seleccioná un campo en el menú de arriba para ver mediciones, scores por corral y variables.</div>
              </div>
            </section>
          ) : (
            <Tab.Group defaultIndex={0} onChange={(i) => setSelectedTab(tabs[i].key)}>
              <Tab.List className="rd-tabs">
                {tabs.map((tab, i) => (
                  <Tab key={tab.key} className={({ selected }) => `rd-tab${selected ? ' sel' : ''}`}>
                    {_tabIcons[i]}<span className="tabtext">{tab.label}</span>
                  </Tab>
                ))}
              </Tab.List>

              <Tab.Panels>
                {/* ═══════════ GENERAL ═══════════ */}
                <Tab.Panel>
                  <div className="rd-col">
                    {/* report summary */}
                    <section className="rd-card">
                      <div className="rd-cardh">
                        <div>
                          <div className="eyebrow">Reporte seleccionado</div>
                          <h3>Resumen del reporte{(() => {
                            const opt = reportOptions.find(o => String(o.value) === String(selectedReportIdForSummary));
                            const d = summaryReportMeasurements[0]?.measureDate;
                            return d ? ` · ${new Date(d).toLocaleDateString('es-AR')}` : opt ? ` · ${opt.label}` : '';
                          })()}</h3>
                        </div>
                        <div className="h-right">
                          {reportOptions.length > 0 && (
                            <select className="rd-select" value={selectedReportIdForSummary} onChange={(e) => setSelectedReportIdForSummary(e.target.value)}>
                              {reportOptions.filter(o => o.value !== 'all').slice().sort((a, b) => Number(b.value) - Number(a.value)).map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      <div style={{ padding: '14px 20px 20px', display: 'grid', gridTemplateColumns: 'minmax(150px, 0.7fr) 2fr', gap: 18, alignItems: 'center' }}>
                        <div className="rd-histstats" style={{ flexDirection: 'column' }}>
                          <div className="rd-histstat"><div className="hs-label"><TrendingUp size={14} />Mediciones</div><div className="hs-val rd-num">{summaryReportMeasurements.length}</div></div>
                          <div className="rd-histstat"><div className="hs-label"><Layers size={14} />Corrales</div><div className="hs-val rd-num">{new Set(summaryReportMeasurements.map(m => m.pen)).size}</div></div>
                          <div className="rd-histstat"><div className="hs-label"><BarChart3 size={14} />Variables</div><div className="hs-val rd-num">{new Set(summaryReportMeasurements.map(m => m.variable)).size}</div></div>
                        </div>
                        <div className="rd-score3">
                          {renderGauge(summaryReportMeasurements, _prevMeas, 'General', <Leaf size={14} />)}
                          {renderGauge(summaryReportMeasurements.filter(m => m.type_of_object === 'Animal'), _prevMeas.filter(m => m.type_of_object === 'Animal'), 'Animales', <Activity size={14} />)}
                          {renderGauge(summaryReportMeasurements.filter(m => m.type_of_object === 'Installation'), _prevMeas.filter(m => m.type_of_object === 'Installation'), 'Instalaciones', <Warehouse size={14} />)}
                        </div>
                      </div>
                    </section>

                    {/* historical */}
                    <section className="rd-card">
                      <div className="rd-cardh"><div><div className="eyebrow">Histórico</div><h3>% correctos por reporte</h3></div></div>
                      <div style={{ padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="rd-histstats">
                          <div className="rd-histstat"><div className="hs-label"><FileText size={14} />Reportes</div><div className="hs-val rd-num">{new Set(measurements.map(m => m.report_id)).size}</div></div>
                          <div className="rd-histstat"><div className="hs-label"><TrendingUp size={14} />Mediciones</div><div className="hs-val rd-num">{measurements.length}</div></div>
                          <div className="rd-histstat"><div className="hs-label"><Activity size={14} />En animales</div><div className="hs-val rd-num">{measurements.filter(m => m.type_of_object === 'Animal').length}</div></div>
                          <div className="rd-histstat"><div className="hs-label"><Warehouse size={14} />En instalación</div><div className="hs-val rd-num">{measurements.filter(m => m.type_of_object === 'Installation').length}</div></div>
                        </div>
                        <div className="rd-chartbox">
                          <div style={{ height: 260 }}>
                            {(() => {
                              const ids = [...new Set(measurements.map(m => String(m.report_id)))].sort((a, b) => Number(a) - Number(b));
                              const labels: string[] = [];
                              const perc: number[] = [];
                              ids.forEach(id => {
                                const rm = measurements.filter(m => String(m.report_id) === id);
                                labels.push(rm[0]?.measureDate ? new Date(rm[0].measureDate).toLocaleDateString('es-AR') : `Rep ${id}`);
                                perc.push(_pctArr(rm));
                              });
                              const data = {
                                labels,
                                datasets: [{ label: '% correcto', data: perc, backgroundColor: 'rgba(95,128,70,0.78)', borderColor: 'rgba(72,103,50,1)', borderWidth: 1, borderRadius: 6, maxBarThickness: 46 }],
                              };
                              const options: any = {
                                responsive: true, maintainAspectRatio: false,
                                plugins: {
                                  legend: { display: false },
                                  tooltip: {
                                    callbacks: {
                                      label: (c: any) => `Bienestar: ${c.parsed.y}% correcto`,
                                      afterLabel: (c: any) => {
                                        const rm = measurements.filter(m => String(m.report_id) === ids[c.dataIndex]);
                                        const a = rm.filter(m => m.type_of_object === 'Animal');
                                        const inst = rm.filter(m => m.type_of_object === 'Installation');
                                        return [`${rm.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length} de ${rm.length} correctas`,
                                          `🐄 Animales: ${a.length ? _pctArr(a) + '%' : 'N/A'}`,
                                          `🏠 Instalaciones: ${inst.length ? _pctArr(inst) + '%' : 'N/A'}`];
                                      },
                                    },
                                  },
                                },
                                scales: { y: { min: 0, max: 100, ticks: { stepSize: 20, callback: (v: any) => v + '%' } } },
                              };
                              return <Bar data={data} options={options} />;
                            })()}
                          </div>
                          {(() => {
                            const ids = [...new Set(measurements.map(m => String(m.report_id)))];
                            const vals = ids.map(id => _pctArr(measurements.filter(m => String(m.report_id) === id)));
                            if (!vals.length) return null;
                            const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
                            const sd = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
                            const cv = mean ? (sd / mean) * 100 : 0;
                            return <div className="rd-chartstats rd-num"><span>Prom {mean.toFixed(1)}%</span><span>DS {sd.toFixed(1)}%</span><span>CV {cv.toFixed(1)}%</span></div>;
                          })()}
                        </div>
                      </div>
                    </section>
                  </div>
                </Tab.Panel>

                {/* ═══════════ CORRALES ═══════════ */}
                <Tab.Panel>
                  <section className="rd-card">
                    <div className="rd-cardh">
                      <div><div className="eyebrow">Score de bienestar por corral</div><h3>Análisis por corral</h3></div>
                      <div className="h-right">
                        <select className="rd-select" value={selectedReportId} onChange={(e) => { setSelectedReportId(e.target.value); setSelectedPen(''); }}>
                          <option value="">Todos los reportes</option>
                          {Array.from(new Set(measurements.map(m => m.report_id))).sort((a, b) => Number(b) - Number(a)).map(id => {
                            const d = measurements.find(m => m.report_id === id)?.measureDate;
                            return <option key={id} value={id}>{d ? new Date(d).toLocaleDateString('es-AR') : id}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                    <div style={{ padding: '14px 20px 20px' }}>
                      <div className="rd-cardgrid">
                        {Array.from(new Set(measurementsToShow.map(m => m.pen))).filter(Boolean).map(pen => {
                          const pm = measurementsToShow.filter(m => m.pen === pen);
                          const total = pm.length;
                          const correct = pm.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
                          const percent = total ? Math.round((correct / total) * 100) : 0;
                          const st = _stFromPct(percent);
                          const am = pm.filter(m => m.type_of_object === 'Animal');
                          const aP = am.length ? Math.round((am.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length / am.length) * 100) : null;
                          const im = pm.filter(m => m.type_of_object === 'Installation');
                          const iP = im.length ? Math.round((im.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length / im.length) * 100) : null;
                          return (
                            <div key={pen} className={`rd-pencard${selectedPen === pen ? ' sel' : ''}`} onClick={() => setSelectedPen(pen)}>
                              <div className="pc-top">
                                <div><div className="pc-name">{pen}</div><div className="pc-frac">Score de bienestar</div></div>
                                <span className={`rd-chip ${st}`}>{st === 'ok' ? <Leaf size={13} /> : <AlertTriangle size={13} />}{_stLabel[st]}</span>
                              </div>
                              <div className="pc-score rd-num">{percent}%</div>
                              <div className="pc-frac rd-num">{correct}/{total} mediciones</div>
                              {aP !== null && (
                                <div className="rd-minibar">
                                  <div className="mb-top"><span className="lbl"><span className="rd-tag animal"><Activity size={11} />Animales</span></span><span className="v rd-num">{aP}%</span></div>
                                  <div className="rd-track"><div className={`rd-fill ${_stFromPct(aP)}`} style={{ width: `${aP}%` }} /></div>
                                </div>
                              )}
                              {iP !== null && (
                                <div className="rd-minibar">
                                  <div className="mb-top"><span className="lbl"><span className="rd-tag install"><Warehouse size={11} />Instalaciones</span></span><span className="v rd-num">{iP}%</span></div>
                                  <div className="rd-track"><div className={`rd-fill ${_stFromPct(iP)}`} style={{ width: `${iP}%` }} /></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {selectedPen && (
                        <div className="rd-detail">
                          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Variables del corral {selectedPen}</h3>
                          <div className="rd-chartbox">
                            <VariableCharts measurements={measurements} selectedPen={selectedPen} selectedReportId={selectedReportId} />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </Tab.Panel>

                {/* ═══════════ VARIABLES ═══════════ */}
                <Tab.Panel>
                  <section className="rd-card">
                    <div className="rd-cardh">
                      <div><div className="eyebrow">Score y rangos óptimos por variable</div><h3>Variables</h3></div>
                      <div className="h-right">
                        <select className="rd-select" value={selectedReportIdForSummary} onChange={(e) => setSelectedReportIdForSummary(e.target.value)}>
                          {reportOptions.length > 0 ? reportOptions.filter(o => o.value !== 'all').slice().sort((a, b) => Number(b.value) - Number(a.value)).map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          )) : <option value="">No hay reportes</option>}
                        </select>
                      </div>
                    </div>
                    <div style={{ padding: '14px 20px 20px' }}>
                      {selectedReportIdForSummary && summaryReportMeasurements.length > 0 ? (
                        <>
                          <div className="rd-cardgrid">
                            {Array.from(new Set(summaryReportMeasurements.map(m => m.variable))).map(variable => {
                              const vm = summaryReportMeasurements.filter(m => m.variable === variable);
                              const total = vm.length;
                              const percent = _pctArr(vm);
                              const st = _stFromPct(percent);
                              const correct = vm.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
                              const last = vm[vm.length - 1];
                              const isCat = last?.optimal_values && last.optimal_values.length > 0;
                              return (
                                <div key={variable} className={`rd-pencard${selectedVariable === variable ? ' sel' : ''}`} onClick={() => setSelectedVariable(variable)}>
                                  <div className="pc-top">
                                    <div><div className="pc-name">{variable}</div><span className={`rd-tag ${last?.type_of_object === 'Installation' ? 'install' : 'animal'}`} style={{ marginTop: 6 }}>{last?.type_of_object === 'Installation' ? <Warehouse size={11} /> : <Activity size={11} />}{last?.type_of_object || 'N/A'}</span></div>
                                    <span className={`rd-chip ${st}`}>{st === 'ok' ? <Leaf size={13} /> : <AlertTriangle size={13} />}{_stLabel[st]}</span>
                                  </div>
                                  <div className="pc-score rd-num">{percent}%</div>
                                  <div className="pc-frac rd-num">{correct}/{total} mediciones</div>
                                  <div className="rd-track" style={{ marginTop: 10 }}><div className={`rd-fill ${st}`} style={{ width: `${percent}%` }} /></div>
                                  <div className="rd-rangebox">
                                    {isCat
                                      ? <><span>Óptimo:</span> <b>{last!.optimal_values!.join(', ')}</b></>
                                      : (last?.optimo_min !== undefined || last?.optimo_max !== undefined)
                                        ? <>
                                            <span>Óptimo <b className="rd-num">{last?.optimo_min ?? '–'}–{last?.optimo_max ?? '–'}</b></span>
                                            {(last?.min !== undefined || last?.max !== undefined) && <span>· Rango <b className="rd-num">{last?.min ?? '–'}–{last?.max ?? '–'}</b></span>}
                                          </>
                                        : <span>Sin rango definido</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {selectedVariable && (
                            <div className="rd-detail">
                              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{selectedVariable} · rendimiento por corral</h3>
                              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>Comparativa entre corrales para el reporte seleccionado.</p>

                              <div className="rd-table-wrap" style={{ marginBottom: 18 }}>
                                <table className="rd-table">
                                  <thead><tr><th>Corral</th><th className="c">Correctas</th><th className="c">Total</th><th className="c">%</th><th className="c">Estado</th></tr></thead>
                                  <tbody>
                                    {Array.from(new Set(measurements.filter(m => m.variable === selectedVariable).map(m => m.pen))).map(pen => {
                                      if (!pen) return null;
                                      const pm = measurements.filter(m => m.pen === pen && m.variable === selectedVariable && (selectedReportIdForSummary ? String(m.report_id) === selectedReportIdForSummary : true));
                                      const total = pm.length;
                                      if (!total) return null;
                                      const correct = pm.filter(m => String(m.correct) === '1' || String(m.correct) === 'true').length;
                                      const percentage = Math.round((correct / total) * 100);
                                      const st = _stFromPct(percentage);
                                      return (
                                        <tr key={pen}>
                                          <td>{pen}</td>
                                          <td className="c rd-num">{correct}</td>
                                          <td className="c rd-num">{total}</td>
                                          <td className="c rd-num" style={{ color: `var(--st-${st}-ink)`, fontWeight: 700 }}>{percentage}%</td>
                                          <td className="c"><span className={`rd-chip ${st}`}>{_stLabel[st]}</span></td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {(() => {
                                const vmeas = summaryReportMeasurements.filter(m => m.variable === selectedVariable);
                                const pens = Array.from(new Set(vmeas.map(m => m.pen))).filter(Boolean);
                                if (!pens.length) return <div className="rd-empty">Sin datos de corrales para esta variable en el reporte.</div>;
                                return (
                                  <div className="rd-cardgrid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                                    {pens.map(pen => (
                                      <div key={pen} className="rd-chartbox">
                                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Corral: {pen}</h4>
                                        <div style={{ height: 300 }}>
                                          <VariableCharts measurements={summaryReportMeasurements} selectedPen={pen} selectedReportId={selectedReportIdForSummary || ''} singleVariableMode={true} variableToShow={selectedVariable} comparePensMode={true} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}

                              <div className="rd-detail">
                                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Tendencia histórica de {selectedVariable}</h3>
                                <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>Evolución del valor promedio en el tiempo por corral.</p>
                                <div className="rd-chartbox"><div style={{ height: 400 }}>
                                  <VariableCharts measurements={measurements} selectedPen="" selectedReportId="" singleVariableMode={true} variableToShow={selectedVariable} showTrendByPen={true} />
                                </div></div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="rd-empty">{selectedReportIdForSummary ? 'No hay datos para este reporte.' : 'Seleccioná un reporte para ver las variables.'}</div>
                      )}
                    </div>
                  </section>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          )}

          <div className="rd-foot">Score = % de mediciones dentro del rango óptimo definido por variable · Δ vs. reporte previo</div>
        </div>

        {/* export modal */}
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>Seleccionar reportes a exportar</DialogTitle></DialogHeader>
            {reportLoading ? (
              <div className="py-4 text-center">Cargando reportes...</div>
            ) : fieldReports.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No hay reportes para este campo.</div>
            ) : (
              <form className="space-y-2 max-h-72 overflow-y-auto">
                <div className="flex items-center mb-2">
                  <input type="checkbox" id="select-all" checked={selectedReportIds.length === fieldReports.length && fieldReports.length > 0} onChange={handleSelectAll} className="mr-2" />
                  <label htmlFor="select-all" className="font-medium cursor-pointer">Seleccionar todos</label>
                </div>
                {fieldReports.map((report) => (
                  <div key={report.id} className="flex items-center">
                    <input type="checkbox" id={`report-${report.id}`} checked={selectedReportIds.includes(report.id)}
                      onChange={() => setSelectedReportIds(ids => ids.includes(report.id) ? ids.filter(id => id !== report.id) : [...ids, report.id])} className="mr-2" />
                    <label htmlFor={`report-${report.id}`} className="cursor-pointer">
                      {report.name || `Reporte ${report.id}`} - {report.created_at ? new Date(report.created_at).toLocaleDateString('es-AR') : ''}
                    </label>
                  </div>
                ))}
              </form>
            )}
            <DialogFooter>
              <button type="button" className="rd-btn" disabled={selectedReportIds.length === 0} onClick={handleConfirmExport}>Exportar seleccionados</button>
              <DialogClose asChild><button type="button" className="rd-btn-outline">Cancelar</button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Chatbot />
      </>
    );
};

export default DashboardPage;
