import { create } from 'zustand';
import { axiosInstance } from './authStore';
import {
  Report,
  ReportWithMeasurements2,
  CreateReport,
  MeasurementData,
  MeasurementEditData,
} from './interface/report.interface';

interface ReportState {
  reportsByFielId: { [fieldId: string]: Report[] } | null;
  reportById: ReportWithMeasurements2[] | null | [];
  reportByIdNameAndComment: { name: string; comment: string } | null;
  createReportId: number | null;
  measurementVariablesData: MeasurementData[] | null;
  measurementEditData: MeasurementEditData[] | null;
  reportsLoading: boolean;
  createReport: (report: Report) => Promise<void>;
  onDelete: (id: number, fieldId: string) => Promise<void>;
  onUpdate: (report_id: number, measurementsUpdates: any) => Promise<void>;
  update: (
    report_id: number,
    reportUpdate: any,
    field_id: number
  ) => Promise<void>;
  getAllReportsByField: (field_id: string) => void;
  getReportById: (
    id: number | null,
    onlyNameAndComment?: string
  ) => Promise<void>;
  resetDetail: () => void;
  resetCreateReportId: () => void;
  resetMeasurementEditData: () => void;
  resetReportByIdNameAndComment: () => void;
  setMeasurementData: (data: MeasurementData[]) => void;
  createMeasurementWithReportId: (data: any, field_id: string) => void;
  getMeasurementEditData: (report_id: number, subject_id: number) => void;
  onDeleteMeasurement: (report_id: number, measurement_id: number) => void;
  setCreateReportId: (report_id: number) => void;
}

const useReportStore = create<ReportState>((set) => ({
  reportsByFielId: null,
  reportById: null,
  reportsLoading: false,
  createReportId: null,
  reportByIdNameAndComment: null,
  measurementVariablesData: null,
  measurementEditData: null,
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

  onDeleteMeasurement: async (report_id: number, measurement_id: number) => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.delete(`/measurements/${measurement_id}`);
      set({ reportsLoading: false });
      useReportStore.getState().getReportById(report_id);
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error deleting report:', error);
    }
  },

  onUpdate: async (report_id, measurementsUpdates) => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.patch(
        `/measurements/bulkUpdate`,
        measurementsUpdates
      );
      useReportStore.getState().getReportById(report_id);
      set({ reportsLoading: false });
    } catch (error: any) {
      console.log(error?.response.message);
      set({ reportsLoading: false });
      console.error('Error updating report:', error);
    }
  },

  update: async (report_id: number, reportUpdate: any, field_id) => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.patch(`/reports/${report_id}`, reportUpdate);
      useReportStore.getState().getAllReportsByField(field_id);
      set({ reportsLoading: false });
    } catch (error: any) {
      console.log(error?.response.message);
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
  getReportById: async (id: number | null, onlyNameAndComment?: string) => {
    set({ reportsLoading: true });
    console.log(
      onlyNameAndComment,
      useReportStore.getState().reportByIdNameAndComment
    );

    try {
      if (onlyNameAndComment) {
        const response = await axiosInstance.get(
          `/reports/${id}?onlyNameAndComment=${onlyNameAndComment}`
        );
        set({ reportByIdNameAndComment: response.data, reportsLoading: false });
        return;
      } else {
        const response = await axiosInstance.get(`/reports/${id}`);
        set({ reportById: response.data, reportsLoading: false });
      }
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

  resetMeasurementEditData: () => {
    set({
      measurementEditData: null,
    });
  },

  resetReportByIdNameAndComment: () => {
    set({
      reportByIdNameAndComment: null,
    });
  },

  setCreateReportId: (report_id) => {
    set({
      createReportId: report_id,
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
  getMeasurementEditData: async (report_id, subject_id) => {
    set({ reportsLoading: true });
    try {
      const response = await axiosInstance.get(
        `/measurements/${report_id}/${subject_id}`
      );
      set({ measurementEditData: response.data, reportsLoading: false });
    } catch (error: any) {
      console.log(error?.response);
      set({ reportsLoading: false });
      console.error('Error fetching report by ID:', error);
    }
  },
}));

export default useReportStore;
