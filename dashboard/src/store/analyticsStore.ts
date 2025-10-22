import { create } from 'zustand';

interface BasicStats {
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  totalFields: number;
  totalPens: number;
  totalMeasurements: number;
  totalReports: number;
  totalSubjects: number;
  totalProductivity: number;
}

interface MonthlyGrowth {
  newUsersMonth: number;
  newFieldsMonth: number;
  newMeasurementsMonth: number;
  newReportsMonth: number;
}

interface UsageEvaluation {
  adoptionRate: number;
  avgFieldsPerUser: number;
  avgPensPerField: number;
  avgMeasurementsPerReport: number;
  usageLevel: 'low' | 'medium' | 'high';
  hasGrowth: boolean;
  hasRegularActivity: boolean;
}

interface AnalyticsData {
  basicStats: BasicStats;
  monthlyGrowth: MonthlyGrowth;
  usageEvaluation: UsageEvaluation;
  generatedAt: string;
}

interface AnalyticsState {
  analyticsData: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  fetchAnalytics: (token: string) => Promise<void>;
  clearAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analyticsData: null,
  loading: false,
  error: null,

  fetchAnalytics: async (token: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos de analytics');
      }

      const data = await response.json();
      set({ analyticsData: data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false 
      });
    }
  },

  clearAnalytics: () => {
    set({ analyticsData: null, error: null });
  },
}));
