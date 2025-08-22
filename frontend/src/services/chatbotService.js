import axios from 'axios';

const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000/api';

// Create axios instance for AI service
const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // Longer timeout for AI processing
});

// Request interceptor to add auth token
aiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI Service Error:', error);
    return Promise.reject(error);
  }
);

// Chatbot service functions
export const chatbotService = {
  // Send message to chatbot
  sendMessage: async (message, conversationId = null) => {
    try {
      const payload = {
        message,
        conversationId,
        timestamp: new Date().toISOString()
      };
      
      const response = await aiClient.post('/chatbot/message', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        message: 'Failed to send message to chatbot',
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact support.'
      };
    }
  },

  // Start a new conversation
  startConversation: async (initialMessage = null) => {
    try {
      const payload = {
        action: 'start_conversation',
        initialMessage
      };
      
      const response = await aiClient.post('/chatbot/conversation', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to start conversation' };
    }
  },

  // Get conversation history
  getConversationHistory: async (conversationId) => {
    try {
      const response = await aiClient.get(`/chatbot/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch conversation history' };
    }
  },

  // End conversation
  endConversation: async (conversationId) => {
    try {
      const response = await aiClient.post(`/chatbot/conversation/${conversationId}/end`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to end conversation' };
    }
  },

  // Get suggested responses/quick replies
  getSuggestions: async (context) => {
    try {
      const response = await aiClient.post('/chatbot/suggestions', { context });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get suggestions' };
    }
  },

  // Classify complaint intent from message
  classifyIntent: async (message) => {
    try {
      const response = await aiClient.post('/classifier/intent', { text: message });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to classify intent' };
    }
  },

  // Analyze sentiment of message
  analyzeSentiment: async (message) => {
    try {
      const response = await aiClient.post('/sentiment/analyze', { text: message });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to analyze sentiment' };
    }
  },

  // Extract entities from complaint text
  extractEntities: async (text) => {
    try {
      const response = await aiClient.post('/classifier/entities', { text });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to extract entities' };
    }
  },

  // Get AI-powered complaint suggestions
  getComplaintSuggestions: async (partialComplaint) => {
    try {
      const response = await aiClient.post('/assistant/complaint-suggestions', partialComplaint);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get complaint suggestions' };
    }
  },

  // Auto-categorize complaint
  categorizeComplaint: async (complaintText) => {
    try {
      const response = await aiClient.post('/classifier/categorize', { text: complaintText });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to categorize complaint' };
    }
  },

  // Get FAQ responses
  getFAQResponse: async (question) => {
    try {
      const response = await aiClient.post('/chatbot/faq', { question });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get FAQ response' };
    }
  },

  // Report chatbot interaction quality
  reportInteraction: async (conversationId, feedback) => {
    try {
      const response = await aiClient.post('/chatbot/feedback', {
        conversationId,
        feedback
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to report interaction' };
    }
  },

  // Get chatbot analytics/metrics
  getChatbotMetrics: async () => {
    try {
      const response = await aiClient.get('/chatbot/metrics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch chatbot metrics' };
    }
  },

  // Train chatbot with new data (admin only)
  trainChatbot: async (trainingData) => {
    try {
      const response = await aiClient.post('/chatbot/train', trainingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to train chatbot' };
    }
  },

  // Get available chatbot capabilities
  getCapabilities: async () => {
    try {
      const response = await aiClient.get('/chatbot/capabilities');
      return response.data;
    } catch (error) {
      // Return default capabilities if service is unavailable
      return {
        capabilities: [
          'Basic Q&A',
          'Complaint Guidance',
          'Status Inquiries',
          'General Information'
        ],
        features: {
          intentClassification: false,
          sentimentAnalysis: false,
          entityExtraction: false,
          multilingual: false
        }
      };
    }
  }
};

// Mock responses for development/fallback
export const mockChatbotResponses = {
  greeting: "Hello! I'm your ComplEase assistant. How can I help you today?",
  helpMenu: "I can help you with:\n• Filing complaints\n• Checking status\n• General information\n• Frequently asked questions",
  complaintHelp: "To file a complaint, I'll need some information. What type of issue are you experiencing?",
  statusHelp: "To check your complaint status, please provide your complaint ID or describe the issue.",
  fallback: "I'm sorry, I didn't understand that. Could you please rephrase your question or type 'help' for assistance?",
  error: "I'm experiencing some technical difficulties. Please try again in a moment or contact support if the issue persists."
};

export default chatbotService;
