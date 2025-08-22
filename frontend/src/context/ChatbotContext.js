import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { chatbotService } from '../services/chatbotService';

// Initial state
const initialState = {
  messages: [],
  currentConversationId: null,
  isTyping: false,
  isConnected: true,
  error: null,
  suggestions: [],
  conversationHistory: [],
  capabilities: {
    intentClassification: false,
    sentimentAnalysis: false,
    entityExtraction: false,
    multilingual: false
  }
};

// Action types
const CHATBOT_ACTIONS = {
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING: 'SET_TYPING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CONVERSATION_ID: 'SET_CONVERSATION_ID',
  SET_SUGGESTIONS: 'SET_SUGGESTIONS',
  SET_CONVERSATION_HISTORY: 'SET_CONVERSATION_HISTORY',
  SET_CAPABILITIES: 'SET_CAPABILITIES',
  RESET_CONVERSATION: 'RESET_CONVERSATION'
};

// Reducer
const chatbotReducer = (state, action) => {
  switch (action.type) {
    case CHATBOT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    
    case CHATBOT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    
    case CHATBOT_ACTIONS.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload
      };
    
    case CHATBOT_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload
      };
    
    case CHATBOT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isTyping: false
      };
    
    case CHATBOT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case CHATBOT_ACTIONS.SET_CONVERSATION_ID:
      return {
        ...state,
        currentConversationId: action.payload
      };
    
    case CHATBOT_ACTIONS.SET_SUGGESTIONS:
      return {
        ...state,
        suggestions: action.payload
      };
    
    case CHATBOT_ACTIONS.SET_CONVERSATION_HISTORY:
      return {
        ...state,
        conversationHistory: action.payload
      };
    
    case CHATBOT_ACTIONS.SET_CAPABILITIES:
      return {
        ...state,
        capabilities: action.payload
      };
    
    case CHATBOT_ACTIONS.RESET_CONVERSATION:
      return {
        ...initialState,
        capabilities: state.capabilities
      };
    
    default:
      return state;
  }
};

// Create context
const ChatbotContext = createContext();

// Custom hook to use chatbot context
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

// Chatbot provider component
export const ChatbotProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  // Initialize chatbot
  const initializeChatbot = useCallback(async () => {
    try {
      // Get chatbot capabilities
      const capabilities = await chatbotService.getCapabilities();
      dispatch({
        type: CHATBOT_ACTIONS.SET_CAPABILITIES,
        payload: capabilities.features || {}
      });

      // Set initial greeting message
      const greetingMessage = {
        id: Date.now(),
        text: "Hello! I'm your ComplEase assistant. I'm here to help you with your complaints and answer any questions you might have. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      };

      dispatch({
        type: CHATBOT_ACTIONS.ADD_MESSAGE,
        payload: greetingMessage
      });

      dispatch({
        type: CHATBOT_ACTIONS.SET_CONNECTED,
        payload: true
      });
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      dispatch({
        type: CHATBOT_ACTIONS.SET_CONNECTED,
        payload: false
      });
    }
  }, []);

  // Send message to chatbot
  const sendMessage = useCallback(async (messageText) => {
    try {
      // Add user message
      const userMessage = {
        id: Date.now(),
        text: messageText,
        sender: 'user',
        timestamp: new Date()
      };

      dispatch({
        type: CHATBOT_ACTIONS.ADD_MESSAGE,
        payload: userMessage
      });

      dispatch({
        type: CHATBOT_ACTIONS.SET_TYPING,
        payload: true
      });

      dispatch({
        type: CHATBOT_ACTIONS.CLEAR_ERROR
      });

      // Send to chatbot service
      const response = await chatbotService.sendMessage(
        messageText,
        state.currentConversationId
      );

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response.message || response.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: response.intent,
        sentiment: response.sentiment,
        entities: response.entities
      };

      dispatch({
        type: CHATBOT_ACTIONS.ADD_MESSAGE,
        payload: botMessage
      });

      // Update conversation ID if provided
      if (response.conversationId) {
        dispatch({
          type: CHATBOT_ACTIONS.SET_CONVERSATION_ID,
          payload: response.conversationId
        });
      }

      // Set suggestions if provided
      if (response.suggestions) {
        dispatch({
          type: CHATBOT_ACTIONS.SET_SUGGESTIONS,
          payload: response.suggestions
        });
      }

      dispatch({
        type: CHATBOT_ACTIONS.SET_TYPING,
        payload: false
      });

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: error.response || "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support if the issue persists.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };

      dispatch({
        type: CHATBOT_ACTIONS.ADD_MESSAGE,
        payload: errorMessage
      });

      dispatch({
        type: CHATBOT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to send message'
      });

      throw error;
    }
  }, [state.currentConversationId]);

  // Start new conversation
  const startNewConversation = useCallback(async (initialMessage = null) => {
    try {
      const response = await chatbotService.startConversation(initialMessage);
      
      dispatch({
        type: CHATBOT_ACTIONS.SET_CONVERSATION_ID,
        payload: response.conversationId
      });

      if (initialMessage) {
        await sendMessage(initialMessage);
      }

      return response;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }, [sendMessage]);

  // End current conversation
  const endConversation = useCallback(async () => {
    try {
      if (state.currentConversationId) {
        await chatbotService.endConversation(state.currentConversationId);
      }
      
      dispatch({
        type: CHATBOT_ACTIONS.RESET_CONVERSATION
      });
    } catch (error) {
      console.error('Failed to end conversation:', error);
      // Reset anyway
      dispatch({
        type: CHATBOT_ACTIONS.RESET_CONVERSATION
      });
    }
  }, [state.currentConversationId]);

  // Get conversation history
  const getConversationHistory = useCallback(async (conversationId) => {
    try {
      const history = await chatbotService.getConversationHistory(conversationId);
      
      dispatch({
        type: CHATBOT_ACTIONS.SET_CONVERSATION_HISTORY,
        payload: history
      });

      return history;
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      throw error;
    }
  }, []);

  // Classify intent
  const classifyIntent = useCallback(async (message) => {
    try {
      const intent = await chatbotService.classifyIntent(message);
      return intent;
    } catch (error) {
      console.error('Failed to classify intent:', error);
      return null;
    }
  }, []);

  // Analyze sentiment
  const analyzeSentiment = useCallback(async (message) => {
    try {
      const sentiment = await chatbotService.analyzeSentiment(message);
      return sentiment;
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      return null;
    }
  }, []);

  // Get complaint suggestions
  const getComplaintSuggestions = useCallback(async (partialComplaint) => {
    try {
      const suggestions = await chatbotService.getComplaintSuggestions(partialComplaint);
      
      dispatch({
        type: CHATBOT_ACTIONS.SET_SUGGESTIONS,
        payload: suggestions
      });

      return suggestions;
    } catch (error) {
      console.error('Failed to get complaint suggestions:', error);
      return [];
    }
  }, []);

  // Report interaction feedback
  const reportFeedback = useCallback(async (feedback) => {
    try {
      if (state.currentConversationId) {
        await chatbotService.reportInteraction(state.currentConversationId, feedback);
      }
    } catch (error) {
      console.error('Failed to report feedback:', error);
    }
  }, [state.currentConversationId]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({
      type: CHATBOT_ACTIONS.CLEAR_ERROR
    });
  }, []);

  // Reset conversation
  const resetConversation = useCallback(() => {
    dispatch({
      type: CHATBOT_ACTIONS.RESET_CONVERSATION
    });
    // Re-initialize with greeting
    initializeChatbot();
  }, [initializeChatbot]);

  // Context value
  const value = {
    ...state,
    initializeChatbot,
    sendMessage,
    startNewConversation,
    endConversation,
    getConversationHistory,
    classifyIntent,
    analyzeSentiment,
    getComplaintSuggestions,
    reportFeedback,
    clearError,
    resetConversation
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotContext;
