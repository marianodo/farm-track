import { create } from 'zustand';
import { axiosInstance } from './authStore';

export interface Report {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReportWithIds extends Omit<Report, 'id'> {}

interface ReportState {
  reports: Report[] | null;
  reportById: Report | null;
  reportsLoading: boolean;
  createReport: (report: ReportWithIds) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, report: Partial<ReportWithIds>) => Promise<void>;
  getAllReports: () => void;
  getReportById: (id: number | null) => Promise<void>;
  resetDetail: () => void;
}

const useReportStore = create<ReportState>((set) => ({
  reports: null,
  reportById: null,
  reportsLoading: false,
  createReport: async (report: ReportWithIds): Promise<void> => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.post('/reports', report);
      useReportStore.getState().getAllReports();
      set({ reportsLoading: false });
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error creating report:', error);
    }
  },
  onDelete: async (id: number) => {
    try {
      await axiosInstance.delete(`/reports/${id}`);
      useReportStore.getState().getAllReports();
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error deleting report:', error);
    }
  },
  onUpdate: async (id: number, report: Partial<ReportWithIds>) => {
    set({ reportsLoading: true });
    try {
      await axiosInstance.patch(`/reports/${id}`, report);
      useReportStore.getState().getAllReports();
      set({ reportsLoading: false });
    } catch (error: any) {
      set({ reportsLoading: false });
      console.error('Error updating report:', error);
    }
  },
  getAllReports: async () => {
    set({ reportsLoading: true });
    try {
      const response = await axiosInstance.get('/reports');
      set({
        reports: response.data.length ? response.data : [],
        reportsLoading: false,
      });
    } catch (error) {
      set({ reportsLoading: false });
      console.error('Error fetching reports:', error);
    }
  },
  getReportById: async (id: number | null) => {
    set({ reportsLoading: true });
    try {
      if (id) {
        const response = await axiosInstance.get(`/reports/${id}`);
        set({
          reportById: response.data ? response.data : null,
          reportsLoading: false,
        });
      }
    } catch (error) {
      set({ reportsLoading: false });
      console.error('Error fetching report by ID:', error);
    }
  },
  resetDetail: () => {
    set({
      reportById: null,
    });
  },
}));

export default useReportStore;
