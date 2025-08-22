import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    // Mock data for now
    setStats({
      totalComplaints: 25,
      pendingComplaints: 8,
      resolvedComplaints: 15,
      rejectedComplaints: 2
    });

    setRecentComplaints([
      { id: 1, title: 'Water leakage issue', status: 'pending', date: '2025-08-20' },
      { id: 2, title: 'Noise complaint', status: 'resolved', date: '2025-08-19' },
      { id: 3, title: 'Power outage', status: 'pending', date: '2025-08-18' }
    ]);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your complaints.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Complaints</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalComplaints}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingComplaints}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolvedComplaints}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{stats.rejectedComplaints}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/complaint-form')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              New Complaint
            </button>
            <button
              onClick={() => navigate('/complaint-list')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              View All Complaints
            </button>
            <button
              onClick={() => navigate('/chatbot')}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Chat Support
            </button>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Complaints</h2>
          {recentComplaints.length > 0 ? (
            <div className="space-y-3">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <h3 className="font-medium">{complaint.title}</h3>
                    <p className="text-sm text-gray-600">#{complaint.id} • {complaint.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No complaints yet. Submit your first complaint!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
