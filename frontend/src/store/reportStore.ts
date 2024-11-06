import { create } from 'zustand';
import { axiosInstance } from './authStore';
import {
  Report,
  ReportWithMeasurements,
  CreateReport,
  MeasurementData,
} from './interface/report.interface';

interface ReportState {
  reportsByFielId: { [fieldId: string]: Report[] } | null;
  reportById: ReportWithMeasurements[] | null | [];
  createReportId: number | null;
  measurementVariablesData: MeasurementData[] | null;
  reportsLoading: boolean;
  createReport: (report: Report) => Promise<void>;
  onDelete: (id: number, fieldId: string) => Promise<void>;
  onUpdate: (id: number, report: CreateReport) => Promise<void>;
  getAllReportsByField: (field_id: string) => void;
  getReportById: (id: number | null) => Promise<void>;
  resetDetail: () => void;
  resetCreateReportId: () => void;
  setMeasurementData: (data: MeasurementData[]) => void;
  createMeasurementWithReportId: (data: any, field_id: string) => void;
}

const useReportStore = create<ReportState>((set) => ({
  reportsByFielId: null,
  reportById: null,
  reportsLoading: false,
  createReportId: null,
  measurementVariablesData: null,
  createReport: async (report: CreateReport): Promise<void> => {
    set({ reportsLoading: true });
    try {
      const response = await axiosInstance.post('/reports', report);
      const newReport = response.data;
      useReportStore.getState().getAllReportsByField(report.field_id);
      //   useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ reportsLoading: false, createReportId: newReport.id });
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error creating report:', error);
    }
  },
  onDelete: async (id: number, fieldId: string) => {
    try {
      await axiosInstance.delete(`/reports/${id}`);
      set({ reportsLoading: false });
      useReportStore.getState().getAllReportsByField(fieldId);
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error deleting report:', error);
    }
  },
  onUpdate: async (id: number, report: CreateReport) => {
    set({ reportsLoading: true });
    try {
      set({ reportsLoading: false });
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error updating report:', error);
    }
  },
  getAllReportsByField: async (field_id) => {
    set({ reportsLoading: true });
    try {
      const response = await axiosInstance.get(`/reports/byField/${field_id}`);
      set((state) => ({
        reportsByFielId: {
          ...state.reportsByFielId,
          [field_id]: response.data.length ? response.data : [],
        },
        reportsLoading: false,
      }));
    } catch (error) {
      set({ reportsLoading: false });
      console.error('Error fetching reports:', error);
    }
  },
  getReportById: async (id: number | null) => {
    set({ reportsLoading: true });
    try {
      const response = await axiosInstance.get(`/reports/${id}`);
      set({ reportById: response.data, reportsLoading: false });
    } catch (error: any) {
      console.log(error?.response);
      set({ reportsLoading: false });
      console.error('Error fetching report by ID:', error);
    }
  },
  resetDetail: () => {
    set({
      reportById: null,
    });
  },

  resetCreateReportId: () => {
    set({
      createReportId: null,
    });
  },
  setMeasurementData: (data) => {
    set({
      measurementVariablesData: data,
    });
  },
  createMeasurementWithReportId: async (
    data: any,
    field_id: string
  ): Promise<void> => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.post('/measurements', data);
      // const newReport = response.data;
      useReportStore.getState().getAllReportsByField(field_id);
      //   useTypeOfObjectStore.getState().getAllTypeOfObjects();
      set({ reportsLoading: false });
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error creating report:', error);
    }
  },
}));

export default useReportStore;
