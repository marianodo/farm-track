import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export interface Report {
  id: string;
  name: string;
  comment?: string;
  created_at?: string;
  updated_at?: string;
  correlative_id?: number;
  userId?: string;
  field_id?: string;
  fieldName?: string;
}

interface ReportState {
  reports: Report[] | null;
  reportsByUser: Report[] | null;
  reportsByField: Record<string, Report[]>;
  reportLoading: boolean;
  reportError: string | null;
  
  getReportsByUser: () => Promise<Report[] | undefined>;
  getReportsByField: (fieldId: string) => Promise<Report[] | undefined>;
}

const useReportStore = create<ReportState>((set, get) => ({
  reports: null,
  reportsByUser: null,
  reportsByField: {},
  reportLoading: false,
  reportError: null,
  
  getReportsByUser: async () => {
    set({ reportLoading: true, reportError: null });
    
    try {
      const { token, user } = useAuthStore.getState();
      
      if (!token) {
        console.warn('No authentication token available');
        set({ reportLoading: false, reportsByUser: [] });
        return [];
      }
      
      const userId = user?.id;
      
      try {
        if (userId) {
          // First fetch all fields for the user
          const fieldsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/fields/byUserId/${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const fields = fieldsResponse.data || [];
          console.log(`Found ${fields.length} fields for user ${userId}`);
          
          if (fields.length === 0) {
            set({ reportsByUser: [], reportLoading: false });
            return [];
          }
          
          // Fetch reports for each field
          const allReports: Report[] = [];
          for (const field of fields) {
            try {
              console.log(`Fetching reports for field ${field.id} (${field.name})`);
              const reportResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/reports/byField/${field.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              const fieldReports = reportResponse.data || [];
              
              // Log data to help debug date issues
              if (fieldReports.length > 0) {
                console.log('Sample report data structure:', fieldReports[0]);
                console.log('Sample date from API:', fieldReports[0]?.created_at);
              }
              
              // Add the field name to each report and validate dates
              const reportsWithFieldName = fieldReports.map((report: Report) => {
                // Ensure created_at is a properly formatted ISO date string if it exists
                let fixedCreatedAt = report.created_at;
                
                if (report.created_at && typeof report.created_at === 'string') {
                  try {
                    // Try to parse and re-stringify to ensure proper format
                    const date = new Date(report.created_at);
                    if (!isNaN(date.getTime())) {
                      fixedCreatedAt = date.toISOString();
                    }
                  } catch (e) {
                    console.error('Error parsing date:', e);
                  }
                }
                
                return {
                  ...report,
                  id: report.id?.toString() || `report-${Math.random().toString(36).substr(2, 9)}`,
                  created_at: fixedCreatedAt,
                  fieldName: field.name
                };
              });
              
              allReports.push(...reportsWithFieldName);
            } catch (fieldError) {
              console.error(`Error fetching reports for field ${field.id}:`, fieldError);
              // Continue with other fields even if one fails
            }
          }
          
          // Sort all reports by date (newest first)
          allReports.sort((a, b) => {
            return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
          });
          
          console.log(`Successfully fetched ${allReports.length} reports across all fields`);
          set({ reportsByUser: allReports, reportLoading: false });
          return allReports;
        } else {
          console.warn('No user ID available to fetch reports');
          set({ reportLoading: false, reportsByUser: [] });
          return [];
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        set({ reportLoading: false, reportError: 'Failed to load reports' });
        return [];
      }
    } catch (error) {
      console.error('Error in getReportsByUser:', error);
      set({ reportLoading: false, reportError: 'An unexpected error occurred' });
      return [];
    }
  },
  
  getReportsByField: async (fieldId: string) => {
    set({ reportLoading: true, reportError: null });
    
    try {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        console.warn('No authentication token available');
        return [];
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/byField/${fieldId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const reports = response.data || [];
      
      // Update the reports by field in the store
      set(state => ({
        reportsByField: {
          ...state.reportsByField,
          [fieldId]: reports
        },
        reportLoading: false
      }));
      
      return reports;
    } catch (error) {
      console.error(`Error fetching reports for field ${fieldId}:`, error);
      set({ reportLoading: false, reportError: `Failed to load reports for field ${fieldId}` });
      return [];
    }
  }
}));

export default useReportStore;
