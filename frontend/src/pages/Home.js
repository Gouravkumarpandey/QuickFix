import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Welcome to ComplEase
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Your comprehensive complaint management solution
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Easy Submission</h3>
            <p className="text-gray-600">
              Submit complaints quickly and efficiently with our user-friendly interface.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Real-time Tracking</h3>
            <p className="text-gray-600">
              Track the status of your complaints in real-time and get updates.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">AI-Powered Support</h3>
            <p className="text-gray-600">
              Get instant help with our intelligent chatbot support system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
