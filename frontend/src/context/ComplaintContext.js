import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { complaintService } from '../services/complaintService';

// Initial state
const initialState = {
  complaints: [],
  currentComplaint: null,
  stats: {
    total: 0,
    pending: 0,
    resolved: 0,
    rejected: 0
  },
  filters: {
    status: '',
    category: '',
    priority: '',
    searchTerm: ''
  },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  }
};

// Action types
const COMPLAINT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_COMPLAINTS: 'SET_COMPLAINTS',
  SET_CURRENT_COMPLAINT: 'SET_CURRENT_COMPLAINT',
  ADD_COMPLAINT: 'ADD_COMPLAINT',
  UPDATE_COMPLAINT: 'UPDATE_COMPLAINT',
  DELETE_COMPLAINT: 'DELETE_COMPLAINT',
  SET_STATS: 'SET_STATS',
  SET_FILTERS: 'SET_FILTERS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_PAGINATION: 'SET_PAGINATION',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const complaintReducer = (state, action) => {
  switch (action.type) {
    case COMPLAINT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case COMPLAINT_ACTIONS.SET_COMPLAINTS:
      return {
        ...state,
        complaints: action.payload,
        isLoading: false,
        error: null
      };
    
    case COMPLAINT_ACTIONS.SET_CURRENT_COMPLAINT:
      return {
        ...state,
        currentComplaint: action.payload,
        isLoading: false,
        error: null
      };
    
    case COMPLAINT_ACTIONS.ADD_COMPLAINT:
      return {
        ...state,
        complaints: [action.payload, ...state.complaints],
        stats: {
          ...state.stats,
          total: state.stats.total + 1,
          pending: state.stats.pending + 1
        }
      };
    
    case COMPLAINT_ACTIONS.UPDATE_COMPLAINT:
      return {
        ...state,
        complaints: state.complaints.map(complaint =>
          complaint.id === action.payload.id ? action.payload : complaint
        ),
        currentComplaint: state.currentComplaint?.id === action.payload.id 
          ? action.payload 
          : state.currentComplaint
      };
    
    case COMPLAINT_ACTIONS.DELETE_COMPLAINT:
      const deletedComplaint = state.complaints.find(c => c.id === action.payload);
      return {
        ...state,
        complaints: state.complaints.filter(complaint => complaint.id !== action.payload),
        currentComplaint: state.currentComplaint?.id === action.payload 
          ? null 
          : state.currentComplaint,
        stats: {
          ...state.stats,
          total: state.stats.total - 1,
          [deletedComplaint?.status]: Math.max(0, state.stats[deletedComplaint?.status] - 1)
        }
      };
    
    case COMPLAINT_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload
      };
    
    case COMPLAINT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
    
    case COMPLAINT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case COMPLAINT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case COMPLAINT_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };
    
    case COMPLAINT_ACTIONS.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const ComplaintContext = createContext();

// Custom hook to use complaint context
export const useComplaint = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaint must be used within a ComplaintProvider');
  }
  return context;
};

// Complaint provider component
export const ComplaintProvider = ({ children }) => {
  const [state, dispatch] = useReducer(complaintReducer, initialState);

  // Fetch complaints
  const fetchComplaints = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: COMPLAINT_ACTIONS.CLEAR_ERROR });
      
      const response = await complaintService.getComplaints(filters);
      
      dispatch({
        type: COMPLAINT_ACTIONS.SET_COMPLAINTS,
        payload: response.complaints || []
      });
      
      if (response.pagination) {
        dispatch({
          type: COMPLAINT_ACTIONS.SET_PAGINATION,
          payload: response.pagination
        });
      }
      
      return response;
    } catch (error) {
      dispatch({
        type: COMPLAINT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to fetch complaints'
      });
      throw error;
    }
  }, []);

  // Fetch complaint by ID
  const fetchComplaintById = useCallback(async (complaintId) => {
    try {
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: COMPLAINT_ACTIONS.CLEAR_ERROR });
      
      const complaint = await complaintService.getComplaintById(complaintId);
      
      dispatch({
        type: COMPLAINT_ACTIONS.SET_CURRENT_COMPLAINT,
        payload: complaint
      });
      
      return complaint;
    } catch (error) {
      dispatch({
        type: COMPLAINT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to fetch complaint'
      });
      throw error;
    }
  }, []);

  // Submit new complaint
  const submitComplaint = useCallback(async (complaintData) => {
    try {
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: COMPLAINT_ACTIONS.CLEAR_ERROR });
      
      const newComplaint = await complaintService.submitComplaint(complaintData);
      
      dispatch({
        type: COMPLAINT_ACTIONS.ADD_COMPLAINT,
        payload: newComplaint
      });
      
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: false });
      return newComplaint;
    } catch (error) {
      dispatch({
        type: COMPLAINT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to submit complaint'
      });
      throw error;
    }
  }, []);

  // Update complaint
  const updateComplaint = useCallback(async (complaintId, updateData) => {
    try {
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: COMPLAINT_ACTIONS.CLEAR_ERROR });
      
      const updatedComplaint = await complaintService.updateComplaint(complaintId, updateData);
      
      dispatch({
        type: COMPLAINT_ACTIONS.UPDATE_COMPLAINT,
        payload: updatedComplaint
      });
      
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: false });
      return updatedComplaint;
    } catch (error) {
      dispatch({
        type: COMPLAINT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to update complaint'
      });
      throw error;
    }
  }, []);

  // Delete complaint
  const deleteComplaint = useCallback(async (complaintId) => {
    try {
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: COMPLAINT_ACTIONS.CLEAR_ERROR });
      
      await complaintService.deleteComplaint(complaintId);
      
      dispatch({
        type: COMPLAINT_ACTIONS.DELETE_COMPLAINT,
        payload: complaintId
      });
      
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: false });
    } catch (error) {
      dispatch({
        type: COMPLAINT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to delete complaint'
      });
      throw error;
    }
  }, []);

  // Fetch complaint statistics
  const fetchStats = useCallback(async () => {
    try {
      const stats = await complaintService.getComplaintStats();
      
      dispatch({
        type: COMPLAINT_ACTIONS.SET_STATS,
        payload: stats
      });
      
      return stats;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // Search complaints
  const searchComplaints = useCallback(async (searchTerm, filters = {}) => {
    try {
      dispatch({ type: COMPLAINT_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: COMPLAINT_ACTIONS.CLEAR_ERROR });
      
      const response = await complaintService.searchComplaints(searchTerm, filters);
      
      dispatch({
        type: COMPLAINT_ACTIONS.SET_COMPLAINTS,
        payload: response.complaints || []
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: COMPLAINT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to search complaints'
      });
      throw error;
    }
  }, []);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({
      type: COMPLAINT_ACTIONS.SET_FILTERS,
      payload: filters
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: COMPLAINT_ACTIONS.CLEAR_ERROR });
  }, []);

  // Reset state
  const resetState = useCallback(() => {
    dispatch({ type: COMPLAINT_ACTIONS.RESET_STATE });
  }, []);

  // Context value
  const value = {
    ...state,
    fetchComplaints,
    fetchComplaintById,
    submitComplaint,
    updateComplaint,
    deleteComplaint,
    fetchStats,
    searchComplaints,
    setFilters,
    clearError,
    resetState
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

export default ComplaintContext;
