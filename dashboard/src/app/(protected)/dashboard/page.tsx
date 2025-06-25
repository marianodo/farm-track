"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
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

import RadialGauge from "./RadialGauge";
import { Tab } from "@headlessui/react";
import VariableCharts from "./VariableCharts";
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import useReportStore from '@/store/reportStore';

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

        // --- Cards resumen del reporte alineadas a la izquierda (más chicas) ---
        const cardW = 38, cardH = 20, gap = 10;
        const cardBg = [245, 247, 250];
        const cardBorder = [220, 220, 220];
        const resumenCards = [
          { label: 'Cantidad Mediciones', value: reportMeasurements.length },
          { label: 'Total Corrales', value: new Set(reportMeasurements.map(m => m.pen)).size },
          { label: 'Variables Medidas', value: new Set(reportMeasurements.map(m => m.variable)).size }
        ];
        const startX = 10;
        const startY = yR;
        resumenCards.forEach((card, i) => {
          const x = startX;
          const y = startY + i * (cardH + gap);
          doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
          doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
          doc.roundedRect(x, y, cardW, cardH, 5, 5, 'F');
          doc.setFontSize(10);
          doc.setTextColor(120, 120, 120);
          doc.text(card.label, x + cardW/2, y + 8, { align: 'center' });
          doc.setFontSize(15);
          doc.setTextColor(40, 40, 40);
          doc.text(String(card.value), x + cardW/2, y + 16, { align: 'center' });
        });
        // --- Gauges centrados horizontal y verticalmente respecto a las cards ---
        const gaugeRadius = 24;
        const gaugeGap = 18;
        const gaugesBlockWidth = 3 * gaugeRadius * 2 + 2 * gaugeGap;
        const pageWidth = doc.internal.pageSize.getWidth();
        const cardsBlockHeight = resumenCards.length * cardH + (resumenCards.length - 1) * gap;
        const gaugesStartX = (pageWidth - gaugesBlockWidth) / 2;
        const gaugesY = startY + cardsBlockHeight / 2 - gaugeRadius;
        const gaugeLabels = ['General', 'Animales', 'Instalaciones'];
        const gaugePercents = [percentGeneral, percentAnimal, percentInstallation];
        gaugePercents.forEach((percent, i) => {
          const cx = gaugesStartX + i * (gaugeRadius * 2 + gaugeGap) + gaugeRadius;
          const cy = gaugesY + gaugeRadius;
          // Fondo
          doc.setDrawColor(220);
          doc.setLineWidth(5);
          doc.circle(cx, cy, gaugeRadius, 'S');
          // Arco de progreso
          const startAngle = -Math.PI/2;
          const endAngle = startAngle + (2 * Math.PI * (percent/100));
          if (percent >= 80) doc.setDrawColor(40,167,69);
          else if (percent >= 60) doc.setDrawColor(255,193,7);
          else doc.setDrawColor(220,53,69);
          doc.setLineWidth(7);
          const steps = 40;
          let prev = null;
          for (let j = 0; j <= steps * (percent/100); j++) {
            const angle = startAngle + ((endAngle - startAngle) * (j / steps));
            const x = cx + gaugeRadius * Math.cos(angle);
            const y = cy + gaugeRadius * Math.sin(angle);
            if (prev) doc.line(prev[0], prev[1], x, y);
            prev = [x, y];
          }
          // Porcentaje centrado
          doc.setFontSize(13);
          doc.setTextColor(40,40,40);
          const percentText = `${percent}%`;
          const textWidth = doc.getTextWidth(percentText);
          doc.text(percentText, cx - textWidth/2, cy + 4);
          // Label debajo
          doc.setFontSize(9);
          doc.setTextColor(100,100,100);
          const label = gaugeLabels[i];
          const labelWidth = doc.getTextWidth(label);
          doc.text(label, cx - labelWidth/2, cy + gaugeRadius + 10);
        });
        // Ajustar yR para el siguiente bloque (cards + gauges)
        const gaugesBlockHeight = gaugeRadius * 2 + 20;
        yR = Math.max(startY + cardsBlockHeight, gaugesY + gaugeRadius + 20) + 8;
   
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

    return (
      <>
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
                    <label htmlFor="field-select" className="block text-sm font-medium mb-2">Seleccionar Campo:</label>
                    <select
                        id="field-select"
                        value={selectedField.value}
                        onChange={(e) => handleFieldChange(e.target.value)}
                        onClick={() => setIsDropdownOpen(true)}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setIsDropdownOpen(false)}
                        className="w-full sm:w-72 p-2 border border-measure-green rounded-md focus:outline-none focus:ring-2 focus:ring-measure-green"
                    >
                        {loadingFields ? (
                            <option disabled>Cargando campos...</option>
                        ) : fields.map((field: Field | AllFieldsOption, index: number) => (
                            <option key={field.value + '_' + index} value={field.value}>
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
    {/* General Tab - current report summary and historical data */}
    <div className="w-full space-y-6">
        {/* Latest Report Summary */}
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                {(() => {
                    let titleDate = "-";
                    if (selectedReportIdForSummary && summaryReportMeasurements.length > 0 && summaryReportMeasurements[0]?.measureDate) {
                        titleDate = new Date(summaryReportMeasurements[0].measureDate).toLocaleDateString();
                    } else if (selectedReportIdForSummary) {
                        const selectedOption = reportOptions.find(opt => String(opt.value) === String(selectedReportIdForSummary));
                        if (selectedOption && selectedOption.label.includes(' (ID:')) {
                            titleDate = selectedOption.label.split(' (ID:')[0];
                        } else if (selectedOption) {
                            titleDate = selectedOption.label; 
                        } else {
                            titleDate = `ID: ${selectedReportIdForSummary}`;
                        }
                    }
                    return <h2 className="text-xl font-semibold">Resumen del Reporte: {titleDate}</h2>;
                })()}
                {reportOptions.length > 0 && (
                    <select
                        value={selectedReportIdForSummary}
                        onChange={handleReportChangeForSummary}
                        className="ml-4 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                        {reportOptions
                            .filter(option => option.value !== 'all') 
                            .slice() 
                            .sort((a, b) => Number(b.value) - Number(a.value)) 
                            .map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Summary Stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Cantidad Mediciones</span>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold">{summaryReportMeasurements.length}</span>
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Corrales</span>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold">{new Set(summaryReportMeasurements.map(m => m.pen)).size}</span>
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Variables Medidas</span>
                            <div className="flex items-center">
                                <span className="text-2xl font-bold">{new Set(summaryReportMeasurements.map(m => m.variable)).size}</span>
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
                            <div className="flex items-center justify-center w-full" style={{minHeight: '140px'}}>
  {(() => {
    // Use measurementsToShow which is filtered by selectedReportId or defaults to all measurements
    if (!summaryReportMeasurements.length && !selectedReportIdForSummary) { // If no summary report selected and no summary measurements
      return (
        <div className="text-center">
          <RadialGauge value={NaN} size={120} />
          <p className="text-sm text-gray-500 mt-2">0/0</p>
        </div>
      );
    }

    const totalCountCurrent = summaryReportMeasurements.length;
    const correctCountCurrent = summaryReportMeasurements.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
    const percentCurrent = totalCountCurrent > 0 ? Math.round((correctCountCurrent / totalCountCurrent) * 100) : 0;

    let comparisonDisplay = null;

    if (selectedReportIdForSummary && measurements.length > 0) {
      const allReportIdsNumeric = reportOptions.map(opt => Number(opt.value)).filter(id => !isNaN(id)).sort((a, b) => b - a); // Descending, from summary options
      const currentReportNumericId = Number(selectedReportIdForSummary);
      const currentIndex = allReportIdsNumeric.indexOf(currentReportNumericId);

      if (currentIndex !== -1 && currentIndex < allReportIdsNumeric.length - 1) { // Check if not the oldest report
        const previousReportId = allReportIdsNumeric[currentIndex + 1];
        const previousReportMeasurements = measurements.filter(m => Number(m.report_id) === previousReportId);

        if (previousReportMeasurements.length > 0) {
          const totalCountPrevious = previousReportMeasurements.length;
          const correctCountPrevious = previousReportMeasurements.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
          const percentPrevious = totalCountPrevious > 0 ? Math.round((correctCountPrevious / totalCountPrevious) * 100) : 0;
          const diff = percentCurrent - percentPrevious;

          const arrow = diff > 0 ? '↑' : '↓';
          const color = diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-500';
          const sign = diff > 0 ? '+' : '';

          comparisonDisplay = (
            <span className={`ml-1 text-xs font-semibold ${color}`}>
              ({arrow} {sign}{diff.toFixed(0)}%)
            </span>
          );
        }
      }
    }
    
    // If measurementsToShow is empty (e.g. selected report has no general field data), but we want to show something generic
    if (summaryReportMeasurements.length === 0 && selectedReportIdForSummary) {
        return (
            <div className="text-center">
                <RadialGauge value={NaN} size={120} />
                <p className="text-sm text-gray-500 mt-2">Sin datos para este reporte</p>
                {comparisonDisplay && <p className="text-xs text-gray-500">vs ant.</p>} 
            </div>
        );
    }
    if (summaryReportMeasurements.length === 0 && !selectedReportIdForSummary) { // Should be caught by the first check, but as a fallback
        return (
            <div className="text-center">
                <RadialGauge value={NaN} size={120} />
                <p className="text-sm text-gray-500 mt-2">0/0</p>
            </div>
        );
    }

    return (
      <div className="text-center">
        <RadialGauge value={percentCurrent} size={120} />
        <p className="text-lg font-semibold text-gray-700 mt-2">
          {correctCountCurrent}/{totalCountCurrent}
          {comparisonDisplay}
        </p>
        <p className="text-xs text-gray-500">mediciones correctas</p>
      </div>
    );
  })()}
</div>
                            
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Salud Actual de Animales</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-center w-full" style={{minHeight: '140px'}}>
  {(() => {
    const animalMeasurementsCurrent = summaryReportMeasurements.filter(m => m.type_of_object === 'Animal');

    if (animalMeasurementsCurrent.length === 0 && !selectedReportIdForSummary) {
      return (
        <div className="text-center">
          <RadialGauge value={NaN} size={120} />
          <p className="text-sm text-gray-500 mt-2">0/0 (animales)</p>
        </div>
      );
    }

    const totalCountCurrent = animalMeasurementsCurrent.length;
    const correctCountCurrent = animalMeasurementsCurrent.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
    const percentCurrent = totalCountCurrent > 0 ? Math.round((correctCountCurrent / totalCountCurrent) * 100) : 0;

    let comparisonDisplay = null;

    if (selectedReportIdForSummary && measurements.length > 0) {
      const allReportIdsNumeric = reportOptions.map(opt => Number(opt.value)).filter(id => !isNaN(id)).sort((a, b) => b - a);
      const currentReportNumericId = Number(selectedReportIdForSummary);
      const currentIndex = allReportIdsNumeric.indexOf(currentReportNumericId);

      if (currentIndex !== -1 && currentIndex < allReportIdsNumeric.length - 1) {
        const previousReportId = allReportIdsNumeric[currentIndex + 1];
        const previousReportAllMeasurements = measurements.filter(m => Number(m.report_id) === previousReportId);
        const animalMeasurementsPrevious = previousReportAllMeasurements.filter(m => m.type_of_object === 'Animal');

        if (animalMeasurementsPrevious.length > 0) {
          const totalCountPrevious = animalMeasurementsPrevious.length;
          const correctCountPrevious = animalMeasurementsPrevious.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
          const percentPrevious = totalCountPrevious > 0 ? Math.round((correctCountPrevious / totalCountPrevious) * 100) : 0;
          const diff = percentCurrent - percentPrevious;

          const arrow = diff > 0 ? '↑' : '↓';
          const color = diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-500';
          const sign = diff > 0 ? '+' : '';

          comparisonDisplay = (
            <span className={`ml-1 text-xs font-semibold ${color}`}>
              ({arrow} {sign}{diff.toFixed(0)}%)
            </span>
          );
        }
      }
    }

    if (animalMeasurementsCurrent.length === 0 && selectedReportIdForSummary) {
        return (
            <div className="text-center">
                <RadialGauge value={NaN} size={120} />
                <p className="text-sm text-gray-500 mt-2">Sin datos de animales para este reporte</p>
                {comparisonDisplay && <p className="text-xs text-gray-500">vs ant.</p>} 
            </div>
        );
    }
     if (animalMeasurementsCurrent.length === 0 && !selectedReportIdForSummary) { // Fallback, should be caught by first check
        return (
            <div className="text-center">
                <RadialGauge value={NaN} size={120} />
                <p className="text-sm text-gray-500 mt-2">0/0 (animales)</p>
            </div>
        );
    }

    return (
      <div className="text-center">
        <RadialGauge value={percentCurrent} size={120} />
        <p className="text-lg font-semibold text-gray-700 mt-2">
          {correctCountCurrent}/{totalCountCurrent}
          {comparisonDisplay}
        </p>
        <p className="text-xs text-gray-500">mediciones correctas (animales)</p>
      </div>
    );
  })()}
</div>
                            
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Salud Actual de Instalaciones</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-center w-full" style={{minHeight: '140px'}}>
  {(() => {
    const installationMeasurementsCurrent = summaryReportMeasurements.filter(m => m.type_of_object === 'Installation');

    if (installationMeasurementsCurrent.length === 0 && !selectedReportIdForSummary) {
      return (
        <div className="text-center">
          <RadialGauge value={NaN} size={120} />
          <p className="text-sm text-gray-500 mt-2">0/0 (instalaciones)</p>
        </div>
      );
    }

    const totalCountCurrent = installationMeasurementsCurrent.length;
    const correctCountCurrent = installationMeasurementsCurrent.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
    const percentCurrent = totalCountCurrent > 0 ? Math.round((correctCountCurrent / totalCountCurrent) * 100) : 0;

    let comparisonDisplay = null;

    if (selectedReportIdForSummary && measurements.length > 0) {
      const allReportIdsNumeric = reportOptions.map(opt => Number(opt.value)).filter(id => !isNaN(id)).sort((a, b) => b - a);
      const currentReportNumericId = Number(selectedReportIdForSummary);
      const currentIndex = allReportIdsNumeric.indexOf(currentReportNumericId);

      if (currentIndex !== -1 && currentIndex < allReportIdsNumeric.length - 1) {
        const previousReportId = allReportIdsNumeric[currentIndex + 1];
        const previousReportAllMeasurements = measurements.filter(m => Number(m.report_id) === previousReportId);
        const installationMeasurementsPrevious = previousReportAllMeasurements.filter(m => m.type_of_object === 'Installation');

        if (installationMeasurementsPrevious.length > 0) {
          const totalCountPrevious = installationMeasurementsPrevious.length;
          const correctCountPrevious = installationMeasurementsPrevious.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
          const percentPrevious = totalCountPrevious > 0 ? Math.round((correctCountPrevious / totalCountPrevious) * 100) : 0;
          const diff = percentCurrent - percentPrevious;

          const arrow = diff > 0 ? '↑' : '↓';
          const color = diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-500';
          const sign = diff > 0 ? '+' : '';

          comparisonDisplay = (
            <span className={`ml-1 text-xs font-semibold ${color}`}>
              ({arrow} {sign}{diff.toFixed(0)}%)
            </span>
          );
        }
      }
    }

    if (installationMeasurementsCurrent.length === 0 && selectedReportIdForSummary) {
        return (
            <div className="text-center">
                <RadialGauge value={NaN} size={120} />
                <p className="text-sm text-gray-500 mt-2">Sin datos de instalaciones para este reporte</p>
                {comparisonDisplay && <p className="text-xs text-gray-500">vs ant.</p>} 
            </div>
        );
    }
    if (installationMeasurementsCurrent.length === 0 && !selectedReportIdForSummary) { // Fallback, should be caught by first check
        return (
            <div className="text-center">
                <RadialGauge value={NaN} size={120} />
                <p className="text-sm text-gray-500 mt-2">0/0 (instalaciones)</p>
            </div>
        );
    }

    return (
      <div className="text-center">
        <RadialGauge value={percentCurrent} size={120} />
        <p className="text-lg font-semibold text-gray-700 mt-2">
          {correctCountCurrent}/{totalCountCurrent}
          {comparisonDisplay}
        </p>
        <p className="text-xs text-gray-500">mediciones correctas (instalaciones)</p>
      </div>
    );
  })()}
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
                                {(() => {
    if (!measurements.length) return <span className="text-2xl font-bold">0</span>;
    const uniqueReportIds = new Set(measurements.map(m => m.report_id)).size;
    return <span className="text-2xl font-bold">{uniqueReportIds}</span>;
})()}
                                <svg className="w-5 h-5 ml-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Mediciones</span>
                            <div className="flex items-center">
                                {(() => {
    if (!measurements.length) return <span className="text-2xl font-bold">0</span>;
    return <span className="text-2xl font-bold">{measurements.length}</span>;
})()}
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
                <div className="col-span-3 mt-6">
    <div className="bg-gray-50 p-4 rounded-lg h-full">
        <h3 className="text-sm font-medium text-gray-500 mb-4">% Correctos por Reporte</h3>
        <div className="h-64">
            {(() => {
                if (!measurements.length) return null;
                // Group by report_id
                const grouped = measurements.reduce((acc, m) => {
                    const id = m.report_id;
                    if (!acc[id]) acc[id] = [];
                    acc[id].push(m);
                    return acc;
                }, {} as Record<string | number, Measurement[]>);
                // Sort by report_id (descending, assuming numeric)
                const sortedReportIds = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
                // Show up to 5 most recent reports
                if (!measurements.length) return null;

                const reportIdStrings = [...new Set(measurements.map(m => String(m.report_id)))].sort((a, b) => Number(a) - Number(b));

                const chartLabels: string[] = [];
                const healthPercentages: number[] = [];

                reportIdStrings.forEach(reportId => {
                    const reportMeasurements = measurements.filter(m => String(m.report_id) === reportId);
                    
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

                const chartData = {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: '% Salud General',
                            data: healthPercentages,
                            backgroundColor: 'rgba(54, 162, 235, 0.7)', // Blue
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            maxBarThickness: 50,
                        },
                    ],
                };
                const options = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true },
                        tooltip: {
                            callbacks: {
                                label: function(context: any) { // Keep any for Chart.js context
                                    return `Salud General: ${context.parsed.y}% correcto`;
                                },
                                afterLabel: function(context: any) {
                                    const reportId = reportIdStrings[context.dataIndex];
                                    const reportData = measurements.filter(m => String(m.report_id) === reportId);
                                    const totalMeasurements = reportData.length;
                                    const correctMeasurements = reportData.filter(
                                        m => String(m.correct) === '1' || String(m.correct) === 'true'
                                    ).length;
                                    
                                    // Calculate animal percentage
                                    const animalData = reportData.filter(m => m.type_of_object === 'Animal');
                                    const animalTotal = animalData.length;
                                    const animalCorrect = animalData.filter(
                                        m => String(m.correct) === '1' || String(m.correct) === 'true'
                                    ).length;
                                    const animalPercentage = animalTotal > 0 
                                        ? Math.round((animalCorrect / animalTotal) * 100) 
                                        : 'N/A';
                                    
                                    // Calculate installation percentage
                                    const installationData = reportData.filter(m => m.type_of_object === 'Installation');
                                    const installationTotal = installationData.length;
                                    const installationCorrect = installationData.filter(
                                        m => String(m.correct) === '1' || String(m.correct) === 'true'
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
                                callback: function(tickValue: string | number) {
                                    return tickValue + '%';
                                },
                            },
                            title: {
                                display: true,
                                text: '% Correcto',
                            },
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Reporte',
                            },
                        },
                    },
                };
                return <Bar data={chartData} options={options} style={{height: '220px'}} />;
            })()}
        </div>
    </div>
</div>
            </div>
        </div>
    </div>
    {/* Latest Report Measurements Table */}
    <div className="mt-8">
      {(() => {
        if (!measurements.length) return null;
        const reportIds = measurements.map(m => m.report_id);
        const latestReportId = Math.max(...reportIds.map(Number));
        const latestMeasurements = measurements.filter(m => Number(m.report_id) === latestReportId);

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

        if (!latestMeasurements.length && !measurements.length) return null; // Hide if no data at all

        return (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Mediciones del Último Reporte</h3>
              <div className="flex gap-2">
                {measurements.length > 0 && (
                  <>
                    <button 
                      onClick={handleDownloadAllMeasurements}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 text-sm"
                    >
                      Download (CSV)
                    </button>
                    <button
                      onClick={handleExportHistoricToPDF}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                    >
                      Exportar a PDF
                    </button>
                  </>
                )}
              </div>
            </div>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Variable</th>
                  <th className="py-2 px-4 border-b">Valor</th>
                  <th className="py-2 px-4 border-b">Corral</th>
                  <th className="py-2 px-4 border-b">Fecha</th>
                  <th className="py-2 px-4 border-b">¿Correcto?</th>
<th className="py-2 px-4 border-b">Optimal Value</th>
                </tr>
              </thead>
              <tbody>
                {latestMeasurements.map((m, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="py-2 px-4 border-b">{m.variable}</td>
                    <td className="py-2 px-4 border-b">{m.value}</td>
                    <td className="py-2 px-4 border-b">{m.pen}</td>
                    <td className="py-2 px-4 border-b">{new Date(m.measureDate).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">
  {String(m.correct) === '1' || String(m.correct) === 'true' ? (
    <span className="flex justify-center">
      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  ) : (
    <span className="flex justify-center">
      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  )}
</td>
<td className="py-2 px-4 border-b">
  {Array.isArray(m.optimal_values) && m.optimal_values.length > 0
    ? m.optimal_values.join(', ')
    : (m.optimo_min !== undefined && m.optimo_max !== undefined
        ? `${m.optimo_min} - ${m.optimo_max}`
        : '-')}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </div>
</Tab.Panel>
                                    <Tab.Panel>
                                        {/* Pens Tab */}
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                                            <h2 className="text-2xl font-semibold mb-4 md:mb-0">Análisis por Corral</h2>
                                            <div>
                                                {/* Report Date Dropdown */}
                                                <div>
                                                    <label htmlFor="report-select" className="block text-xs font-medium mb-1">Reporte</label>
                                                    <select
                                                        id="report-select"
                                                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 min-w-[150px]"
                                                        value={selectedReportId}
                                                        onChange={e => {
                                                            console.log('Selected report ID:', e.target.value);
                                                            setSelectedReportId(e.target.value);
                                                            setSelectedPen(""); // Reset pen selection when report changes
                                                        }}
                                                    >
                                                        <option value="">Todos los reportes</option>
                                                        {/* Sorting reports from newest to oldest */}
                                                        {Array.from(new Set(measurements.map((m: Measurement) => m.report_id)))
                                                            .sort((a, b) => Number(b) - Number(a)) /* Sort by report_id, higher numbers first (newer) */
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
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Array.from(new Set(measurementsToShow.map(m => m.pen))).map(pen => {
                                                // Use measurementsToShow for filtering to ensure consistency with the selected report
                                                const penMeasurements = measurementsToShow.filter(m => m.pen === pen);
                                                const totalCount = penMeasurements.length;
                                                const correctCount = penMeasurements.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
                                                const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
                                                
                                                // Get animal measurements
                                                const animalMeasurements = penMeasurements.filter(m => m.type_of_object === 'Animal');
                                                const animalTotalCount = animalMeasurements.length;
                                                const animalCorrectCount = animalMeasurements.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
                                                const animalPercent = animalTotalCount > 0 ? Math.round((animalCorrectCount / animalTotalCount) * 100) : null;
                                                
                                                // Get installation measurements
                                                const installMeasurements = penMeasurements.filter(m => m.type_of_object === 'Installation');
                                                const installTotalCount = installMeasurements.length;
                                                const installCorrectCount = installMeasurements.filter((m: Measurement) => String(m.correct) === '1' || String(m.correct) === 'true').length;
                                                const installPercent = installTotalCount > 0 ? Math.round((installCorrectCount / installTotalCount) * 100) : null;
                                                
                                                // Icon logic
                                                let icon = null;
                                                if (percent >= 85) {
                                                    icon = (
                                                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    );
                                                } else if (percent >= 70) {
                                                    icon = (
                                                        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                                                        </svg>
                                                    );
                                                } else {
                                                    icon = (
                                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
                                                        </svg>
                                                    );
                                                }
                                                return (
                                                    <div
                                                        key={pen}
                                                        className={
                                                            `bg-white p-6 rounded-lg shadow flex flex-col justify-between min-h-[170px] border transition-all cursor-pointer ` +
                                                            (selectedPen === pen ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent')
                                                        }
                                                        onClick={() => setSelectedPen(pen)}
                                                    >
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-1">{pen}</h3>
                                                            <span className="text-sm text-gray-500">Score de salud</span>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className="text-3xl font-bold">{percent}%</div>
                                                                {icon}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{correctCount}/{totalCount} mediciones</div>
                                                            <div className="mt-3 space-y-1">
                                                                {animalPercent !== null && (
                                                                    <div>
                                                                        <div className="flex items-center mb-1">
                                                                            <span className="text-xs bg-blue-50 px-2 py-1 rounded mr-2">🐄</span>
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-medium flex justify-between">
                                                                                    <span>Animales</span>
                                                                                    <span>{animalPercent}%</span>
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">{animalCorrectCount}/{animalTotalCount}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                                            <div 
                                                                                className={`h-2 rounded-full ${animalPercent >= 85 ? 'bg-green-500' : animalPercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                                style={{ width: `${animalPercent}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {installPercent !== null && (
                                                                    <div className="mt-2">
                                                                        <div className="flex items-center mb-1">
                                                                            <span className="text-xs bg-green-50 px-2 py-1 rounded mr-2">🏠</span>
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-medium flex justify-between">
                                                                                    <span>Instalaciones</span>
                                                                                    <span>{installPercent}%</span>
                                                                                </div>
                                                                                <div className="text-xs text-gray-500">{installCorrectCount}/{installTotalCount}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                                            <div 
                                                                                className={`h-2 rounded-full ${installPercent >= 85 ? 'bg-green-500' : installPercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                                style={{ width: `${installPercent}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Variable Charts for Selected Pen */}
                                        {selectedPen && (
                                            <VariableCharts 
                                                measurements={measurements} // Always pass all measurements
                                                selectedPen={selectedPen} 
                                                selectedReportId={selectedReportId} 
                                            />
                                        )}
                                    </Tab.Panel>

                                    <Tab.Panel>
                                        {/* Numerical Variables Tab */}
                                        <div className="mb-6 flex justify-between items-center">
                                            <h2 className="text-xl font-semibold">Variables</h2>
                                            <div>
                                                <label htmlFor="variable-report-select" className="block text-xs font-medium mb-1">Reporte</label>
                                                <select
                                                    id="variable-report-select"
                                                    value={selectedReportIdForSummary}
                                                    onChange={e => setSelectedReportIdForSummary(e.target.value)}
                                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 min-w-[150px]"
                                                >
                                                    {reportOptions.length > 0 ? (
                                                        reportOptions
                                                            .filter(option => option.value !== 'all') 
                                                            .slice() 
                                                            .sort((a, b) => Number(b.value) - Number(a.value)) 
                                                            .map(option => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                        ))
                                                    ) : (
                                                        <option value="">No hay reportes disponibles</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        {selectedReportIdForSummary && summaryReportMeasurements.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {Array.from(new Set(summaryReportMeasurements.map(m => m.variable))).map(variable => {
                                                        const variableMeasurements = summaryReportMeasurements.filter(m => m.variable === variable);
                                                        const totalCount = variableMeasurements.length;
                                                        const correctCount = variableMeasurements.filter(m => m.correct === 1).length;
                                                        const correctPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
                                                        const latestMeasurement = variableMeasurements[variableMeasurements.length - 1];
                                                        return (
                                                            <div 
                                                                key={variable} 
                                                                className={
                                                                    `bg-white p-6 rounded-lg shadow-md mb-6 cursor-pointer border transition-all min-h-[170px] flex flex-col justify-between ` +
                                                                    (selectedVariable === variable ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent')
                                                                }
                                                                style={{ width: '100%' }}
                                                                onClick={() => setSelectedVariable(variable)}
                                                            >
                                                                <div>
                                                                    <h3 className="text-lg font-semibold mb-1">{variable}</h3>
                                                                    <span className="text-xs text-gray-500 block">{latestMeasurement.type_of_object || 'N/A'}</span>
                                                                    <span className="text-sm text-gray-500 mt-1 block">Score de salud</span>
                                                                    
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <div className="text-3xl font-bold">{correctPercentage}%</div>
                                                                        {correctPercentage >= 80 ? (
                                                                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        ) : correctPercentage >= 50 ? (
                                                                            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
                                                                            </svg>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">{correctCount}/{totalCount} mediciones</div>
                                                                    
                                                                    <div className="mt-4">
                                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                                            <div 
                                                                                className={`h-2 rounded-full ${correctPercentage >= 85 ? 'bg-green-500' : correctPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                                style={{ width: `${correctPercentage}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {/* Selected Variable Detail View */}
                                                {selectedVariable && (
                                                    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                                                        <h3 className="text-xl font-semibold mb-4">Rendimiento de la Variable: {selectedVariable} por Corral</h3>
                                                        <p className="text-sm text-gray-600 mb-4">Comparativa de valores entre los diferentes corrales para el reporte seleccionado</p>
                                                        
                                                        {/* Summary Table of Pens */}
                                                        <div className="mb-6 overflow-x-auto">
                                                          <h3 className="text-lg font-semibold mb-4">Resumen por Corral</h3>
                                                          <div className="border rounded-lg overflow-hidden">
                                                            <table className="w-full text-sm bg-white shadow-md rounded-lg overflow-hidden">
                                                              <thead className="bg-gray-50">
                                                                <tr>
                                                                  <th className="px-4 py-2 text-left">Corral</th>
                                                                  <th className="px-4 py-2 text-center">Mediciones Correctas</th>
                                                                  <th className="px-4 py-2 text-center">Total</th>
                                                                  <th className="px-4 py-2 text-center">Porcentaje</th>
                                                                  <th className="px-4 py-2 text-center">Estado</th>
                                                                </tr>
                                                              </thead>
                                                              <tbody>
                                                                {Array.from(new Set(measurements.filter(m => m.variable === selectedVariable).map(m => m.pen)))
                                                                  .map(pen => {
                                                                    // Skip empty pen names
                                                                    if (!pen) return null;
                                                                    
                                                                    const penMeasurements = measurements.filter(m => 
                                                                      m.pen === pen && 
                                                                      m.variable === selectedVariable && 
                                                                      (selectedReportId ? String(m.report_id) === selectedReportId : true)
                                                                    );
                                                                    
                                                                    // Count correct measurements
                                                                    const total = penMeasurements.length;
                                                                    
                                                                    // Skip rendering if there's no data for this pen
                                                                    if (total === 0) return null;
                                                                    
                                                                    let correct = 0;
                                                                    
                                                                    // Get optimal ranges or values
                                                                    const measurementWithRanges = penMeasurements.find(m => 
                                                                      m.optimo_min !== undefined || m.optimo_max !== undefined || 
                                                                      (m as any).optimal_value !== undefined || (m as any).optimal_values !== undefined
                                                                    );
                                                                    
                                                                    // Extract optimization values
                                                                    const optimalMin = measurementWithRanges?.optimo_min;
                                                                    const optimalMax = measurementWithRanges?.optimo_max;
                                                                    const optimalValue = (measurementWithRanges as any)?.optimal_value || 
                                                                                       (measurementWithRanges as any)?.optimo_valor;
                                                                    
                                                                    // Get optimal values array if available
                                                                    let optimalValues: string[] = [];
                                                                    if ((measurementWithRanges as any)?.optimal_values) {
                                                                      const values = (measurementWithRanges as any).optimal_values;
                                                                      optimalValues = Array.isArray(values) ? values : 
                                                                        typeof values === 'string' ? values.split(',') : [];
                                                                    }
                                                                    
                                                                    // Determine if this is a categorical variable
                                                                    const isCategorical = penMeasurements.some(m => {
                                                                      const value = (m as any).valor !== undefined ? (m as any).valor : m.value;
                                                                      return typeof value === 'string' && isNaN(Number(value));
                                                                    });
                                                                    
                                                                    // Count correct measurements
                                                                    if (isCategorical) {
                                                                      correct = penMeasurements.filter(m => {
                                                                        const value = (m as any).valor !== undefined ? (m as any).valor : m.value;
                                                                        if (optimalValues.length > 0) {
                                                                          return optimalValues.includes(value);
                                                                        } else if (optimalValue) {
                                                                          return value === optimalValue;
                                                                        }
                                                                        return false;
                                                                      }).length;
                                                                    } else if (optimalMin !== undefined && optimalMax !== undefined) {
                                                                      correct = penMeasurements.filter(m => {
                                                                        const value = (m as any).valor !== undefined ? (m as any).valor : m.value;
                                                                        const numValue = Number(value);
                                                                        return !isNaN(numValue) && numValue >= optimalMin && numValue <= optimalMax;
                                                                      }).length;
                                                                    }
                                                                    
                                                                    // Calculate percentage
                                                                    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
                                                                    
                                                                    // Determine status
                                                                    let status = "";
                                                                    let statusColor = "";
                                                                    let statusIcon = "";
                                                                    
                                                                    if (percentage >= 75) {
                                                                      status = "Alto";
                                                                      statusColor = "text-green-600";
                                                                      statusIcon = "✅";
                                                                    } else if (percentage >= 50) {
                                                                      status = "Medio";
                                                                      statusColor = "text-yellow-600";
                                                                      statusIcon = "⚠️";
                                                                    } else {
                                                                      status = "Bajo";
                                                                      statusColor = "text-red-600";
                                                                      statusIcon = "❌";
                                                                    }
                                                                    
                                                                    return (
                                                                      <tr key={pen} className="border-t hover:bg-gray-50">
                                                                        <td className="px-4 py-2">{pen}</td>
                                                                        <td className="px-4 py-2 text-center">{correct}</td>
                                                                        <td className="px-4 py-2 text-center">{total}</td>
                                                                        <td className="px-4 py-2 text-center font-medium">
                                                                          <span className={`${statusColor}`}>{percentage}%</span>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">
                                                                          <span className={`inline-flex items-center ${statusColor}`}>
                                                                            <span className="mr-1">{statusIcon}</span>
                                                                            {status}
                                                                          </span>
                                                                        </td>
                                                                      </tr>
                                                                    );
                                                                  })}
                                                              </tbody>
                                                            </table>
                                                          </div>
                                                        </div>
                                                        
                                                        {/* Get unique pens that have measurements for this variable */}
                                                        {(() => {
                                                            // Filter measurements for selected variable and report
                                                            const variableMeasurements = summaryReportMeasurements
                                                                .filter(m => m.variable === selectedVariable);
                                                            
                                                            // Get unique pens with this variable
                                                            const uniquePens = Array.from(new Set(variableMeasurements.map(m => m.pen)))
                                                                .filter(pen => pen); // Filter out empty pen values
                                                            
                                                            if (uniquePens.length === 0) {
                                                                return (
                                                                    <div className="text-center text-gray-500 py-10">
                                                                        No hay datos de corrales disponibles para esta variable en el reporte seleccionado.
                                                                    </div>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    {uniquePens.map(pen => (
                                                                        <div key={pen} className="bg-gray-50 p-4 rounded-lg">
                                                                            <h4 className="text-lg font-medium mb-2">Corral: {pen}</h4>
                                                                            
                                                                            <div style={{ height: '300px' }}>
                                                                                <VariableCharts 
                                                                                    measurements={summaryReportMeasurements}
                                                                                    selectedPen={pen}
                                                                                    selectedReportId={selectedReportIdForSummary || ""}
                                                                                    singleVariableMode={true}
                                                                                    variableToShow={selectedVariable}
                                                                                    comparePensMode={true}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()} 
                                                        
                                                        {/* Add trend over time section if needed */}
                                                        <div className="mt-8">
                                                            <h3 className="text-xl font-semibold mb-4">Tendencia Histórica de {selectedVariable}</h3>
                                                            <p className="text-sm text-gray-600 mb-4">Evolución del valor promedio a través del tiempo por corral</p>
                                                            
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <div style={{ height: '400px' }}>
                                                                    <VariableCharts 
                                                                        measurements={measurements}
                                                                        selectedPen=""
                                                                        selectedReportId=""
                                                                        singleVariableMode={true}
                                                                        variableToShow={selectedVariable}
                                                                        showTrendByPen={true}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                     </div>
                                                 )}
                                             </>
                                         ) : (
                                            <div className="text-center text-gray-500 py-10">
                                                {selectedReportIdForSummary ? "No hay datos disponibles para este reporte." : "Seleccione un reporte para ver las variables numéricas."}
                                            </div>
                                        )}
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Seleccionar reportes a exportar</DialogTitle>
            </DialogHeader>
            {reportLoading ? (
              <div className="py-4 text-center">Cargando reportes...</div>
            ) : fieldReports.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No hay reportes para este campo.</div>
            ) : (
              <form className="space-y-2 max-h-72 overflow-y-auto">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedReportIds.length === fieldReports.length && fieldReports.length > 0}
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <label htmlFor="select-all" className="font-medium cursor-pointer">Seleccionar todos</label>
                </div>
                {fieldReports.map((report) => (
                  <div key={report.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`report-${report.id}`}
                      checked={selectedReportIds.includes(report.id)}
                      onChange={() => {
                        setSelectedReportIds(ids => ids.includes(report.id)
                          ? ids.filter(id => id !== report.id)
                          : [...ids, report.id]);
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`report-${report.id}`} className="cursor-pointer">
                      {report.name || `Reporte ${report.id}`} - {report.created_at ? new Date(report.created_at).toLocaleDateString() : ''}
                    </label>
                  </div>
                ))}
              </form>
            )}
            <DialogFooter>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={selectedReportIds.length === 0}
                onClick={handleConfirmExport}
              >
                Exportar seleccionados
              </button>
              <DialogClose asChild>
                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
};

export default DashboardPage;