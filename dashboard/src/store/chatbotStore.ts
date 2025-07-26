import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  selectedFieldId: string | null;
  sendMessage: (message: string, fieldId?: string) => Promise<void>;
  clearMessages: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setSelectedFieldId: (fieldId: string | null) => void;
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,
  selectedFieldId: null,

  sendMessage: async (message: string, fieldId?: string) => {
    const { messages } = get();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    
    set({ 
      messages: [...messages, userMessage],
      isLoading: true,
      error: null 
    });

    try {
      // Get auth token
      const authState = useAuthStore.getState();
      const token = authState.token;
      const user = authState.user;
      
      console.log('Auth state:', { token: token ? 'Present' : 'Missing', user: user?.id });
      
      if (!token) {
        throw new Error('No authentication token available. Please log in again.');
      }

      // Use provided fieldId or selectedFieldId
      const targetFieldId = fieldId || get().selectedFieldId;
      
      if (!targetFieldId) {
        throw new Error('No field selected. Please select a field first.');
      }

      // Send message to backend
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message, fieldId: targetFieldId }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      set({ 
        messages: [...get().messages, botMessage],
        isLoading: false 
      });

    } catch (error) {
      console.error('Error sending message:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error sending message',
        isLoading: false 
      });
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setIsOpen: (isOpen: boolean) => {
    set({ isOpen });
  },

  setSelectedFieldId: (fieldId: string | null) => {
    set({ selectedFieldId: fieldId });
  },
})); 