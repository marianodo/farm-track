import { create } from 'zustand';
import { axiosInstance } from './authStore';
import MeasurementStats from './interface/measurementStats.interface';

interface MeasurementStatsStore {
  stats: MeasurementStats | null;
  statsByUser: MeasurementStats | null;
  statsByField: MeasurementStats | null;
  statsByReport: MeasurementStats | null;
  statsLoading: boolean;
  getStats: (totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean) => Promise<void>;
  getStatsByUser: (userId: string, totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean) => Promise<void>;
  getStatsByField: (fieldId: string, totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean, byReport?: boolean) => Promise<void>;
  getStatsByReport: (reportId: string, totalMeasurement?: boolean, byObject?: boolean, byPen?: boolean, byVariable?: boolean, byVariableByPen?: boolean) => Promise<void>;
  resetStatsByUser: () => void;
  resetStatsByField: () => void;
  resetStats: () => void;
}

const useMeasurementStatsStore = create<MeasurementStatsStore>((set) => ({
  stats: null,
  statsLoading: false,
  statsByUser: null,
  statsByField: null,
  statsByReport: null,
  getStats: async (totalMeasurement, byObject, byPen, byVariable, byVariableByPen) => {
    set({ statsLoading: true });
    try {
      const response = await axiosInstance.get('/measurements/stats', {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen
        }
      });
      set({ stats: response.data, statsLoading: false });
    } catch (error) {
      set({ statsLoading: false });
      console.error('Error fetching stats:', error);
    }
  },
  getStatsByUser: async (userId: string, totalMeasurement, byObject, byPen, byVariable, byVariableByPen) => {
    set({ statsLoading: true });
    try {
      const response = await axiosInstance.get(`/measurements/stats/ByUserId/${userId}`, {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen
        }
      });
      set({ stats: response.data, statsLoading: false });
    } catch (error) {
      set({ statsLoading: false });
      console.error('Error fetching stats by user:', error);
    }
  },
  getStatsByField: async (fieldId: string, totalMeasurement, byObject, byPen, byVariable, byVariableByPen, byReport) => {
    set({ statsLoading: true });
    try {
      const response = await axiosInstance.get(`/measurements/stats/byFieldId/${fieldId}`, {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen,
          byReport
        }
      });
      set({ statsByField: response.data, statsLoading: false });
    } catch (error) {
      set({ statsLoading: false });
      console.error('Error fetching stats by field:', error);
    }
  },
  getStatsByReport: async (reportId: string, totalMeasurement, byObject, byPen, byVariable, byVariableByPen) => {
    set({ statsLoading: true });
    try {
      const response = await axiosInstance.get(`/measurements/stats/byReportId/${reportId}`, {
        params: {
          totalMeasurement,
          byObject,
          byPen,
          byVariable,
          byVariableByPen
        }
      });
      set({ statsByReport: response.data, statsLoading: false });
    } catch (error) {
      set({ statsLoading: false });
      console.error('Error fetching stats by report:', error);
    }
  },
  resetStats: () => set({ stats: null }),
  resetStatsByUser: () => set({ statsByUser: null }),
  resetStatsByField: () => set({ statsByField: null })

}));

export default useMeasurementStatsStore;
