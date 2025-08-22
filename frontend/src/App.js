import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { ChatbotProvider } from './context/ChatbotContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintList from './pages/ComplaintList';
import Chatbot from './pages/Chatbot';

// Styles
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ComplaintProvider>
          <ChatbotProvider>
            <div className="App min-h-screen flex flex-col">
              <Navbar />
              
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/complaint-form" element={
                    <ProtectedRoute>
                      <ComplaintForm />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/complaint-list" element={
                    <ProtectedRoute>
                      <ComplaintList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/chatbot" element={
                    <ProtectedRoute>
                      <Chatbot />
                    </ProtectedRoute>
                  } />
                  
                  {/* Redirect unknown routes to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              
              <Footer />
            </div>
          </ChatbotProvider>
        </ComplaintProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
