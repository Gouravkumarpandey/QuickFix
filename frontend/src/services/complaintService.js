import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Complaint service functions
export const complaintService = {
  // Submit a new complaint
  submitComplaint: async (complaintData) => {
    try {
      const formData = new FormData();
      
      // Append text data
      Object.keys(complaintData).forEach(key => {
        if (key !== 'attachments') {
          formData.append(key, complaintData[key]);
        }
      });
      
      // Append files
      if (complaintData.attachments && complaintData.attachments.length > 0) {
        complaintData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      const response = await apiClient.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit complaint' };
    }
  },

  // Get all complaints for the current user
  getComplaints: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const response = await apiClient.get(`/complaints?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch complaints' };
    }
  },

  // Get a specific complaint by ID
  getComplaintById: async (complaintId) => {
    try {
      const response = await apiClient.get(`/complaints/${complaintId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch complaint details' };
    }
  },

  // Update a complaint
  updateComplaint: async (complaintId, updateData) => {
    try {
      const response = await apiClient.put(`/complaints/${complaintId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update complaint' };
    }
  },

  // Delete a complaint
  deleteComplaint: async (complaintId) => {
    try {
      const response = await apiClient.delete(`/complaints/${complaintId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete complaint' };
    }
  },

  // Add a comment to a complaint
  addComment: async (complaintId, comment) => {
    try {
      const response = await apiClient.post(`/complaints/${complaintId}/comments`, {
        comment
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add comment' };
    }
  },

  // Get comments for a complaint
  getComments: async (complaintId) => {
    try {
      const response = await apiClient.get(`/complaints/${complaintId}/comments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch comments' };
    }
  },

  // Get complaint statistics
  getComplaintStats: async () => {
    try {
      const response = await apiClient.get('/complaints/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch complaint statistics' };
    }
  },

  // Search complaints
  searchComplaints: async (searchTerm, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      });
      
      const response = await apiClient.get(`/complaints/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search complaints' };
    }
  },

  // Rate a complaint resolution
  rateComplaint: async (complaintId, rating, feedback = '') => {
    try {
      const response = await apiClient.post(`/complaints/${complaintId}/rating`, {
        rating,
        feedback
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to rate complaint' };
    }
  },

  // Get complaint categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/complaints/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  // Get complaint priorities
  getPriorities: async () => {
    try {
      const response = await apiClient.get('/complaints/priorities');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch priorities' };
    }
  },

  // Download attachment
  downloadAttachment: async (complaintId, attachmentId) => {
    try {
      const response = await apiClient.get(
        `/complaints/${complaintId}/attachments/${attachmentId}`,
        { responseType: 'blob' }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'attachment';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to download attachment' };
    }
  },

  // Export complaints to CSV/PDF
  exportComplaints: async (format = 'csv', filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await apiClient.get(
        `/complaints/export?${queryParams.toString()}`,
        { responseType: 'blob' }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to export complaints' };
    }
  }
};

export default complaintService;
