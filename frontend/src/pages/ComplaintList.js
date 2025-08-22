import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    searchTerm: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch complaints from API
    // Mock data for now
    const mockComplaints = [
      {
        id: 1,
        title: 'Water leakage in building A',
        category: 'Infrastructure',
        priority: 'high',
        status: 'pending',
        description: 'Severe water leakage causing damage to property',
        location: 'Building A, Floor 3',
        submittedAt: '2025-08-20T10:30:00Z',
        updatedAt: '2025-08-20T10:30:00Z'
      },
      {
        id: 2,
        title: 'Noise disturbance from construction',
        category: 'Environment',
        priority: 'medium',
        status: 'resolved',
        description: 'Construction noise disturbing residents',
        location: 'Main Street',
        submittedAt: '2025-08-19T14:15:00Z',
        updatedAt: '2025-08-21T09:45:00Z'
      },
      {
        id: 3,
        title: 'Power outage in residential area',
        category: 'Public Services',
        priority: 'urgent',
        status: 'in-progress',
        description: 'Complete power outage affecting entire neighborhood',
        location: 'Pine Street Area',
        submittedAt: '2025-08-18T18:20:00Z',
        updatedAt: '2025-08-19T08:30:00Z'
      }
    ];

    setComplaints(mockComplaints);
    setFilteredComplaints(mockComplaints);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = complaints;

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(complaint => complaint.status === filters.status);
    }
    if (filters.category) {
      filtered = filtered.filter(complaint => complaint.category === filters.category);
    }
    if (filters.priority) {
      filtered = filtered.filter(complaint => complaint.priority === filters.priority);
    }
    if (filters.searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  }, [filters, complaints]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">My Complaints</h1>
          
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Search complaints..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Public Services">Public Services</option>
                <option value="Transportation">Transportation</option>
                <option value="Environment">Environment</option>
                <option value="Safety">Safety</option>
              </select>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <button
              onClick={() => navigate('/complaint-form')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              New Complaint
            </button>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <div key={complaint.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">{complaint.title}</h2>
                      <p className="text-gray-600 mb-3">{complaint.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {complaint.category}
                        </span>
                        <span className={`px-2 py-1 bg-gray-100 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>📍 {complaint.location}</p>
                        <p>📅 Submitted: {formatDate(complaint.submittedAt)}</p>
                        <p>🔄 Updated: {formatDate(complaint.updatedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <span className="text-lg font-bold text-gray-500">#{complaint.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm">
                      View Details
                    </button>
                    {complaint.status === 'pending' && (
                      <button className="px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-md text-sm">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600 mb-4">No complaints found matching your criteria.</p>
                <button
                  onClick={() => navigate('/complaint-form')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Submit Your First Complaint
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintList;
