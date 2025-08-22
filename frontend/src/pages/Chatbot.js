import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial greeting message
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your ComplEase assistant. I'm here to help you with your complaints and answer any questions you might have. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate API call to chatbot service
    try {
      // TODO: Replace with actual API call to AI service
      const response = await simulateBotResponse(inputMessage);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const simulateBotResponse = async (userInput) => {
    // Simple keyword-based responses for demo
    const input = userInput.toLowerCase();
    
    if (input.includes('complaint') || input.includes('submit')) {
      return "I can help you submit a complaint! You can file a new complaint by clicking the 'New Complaint' button or by saying 'I want to file a complaint'. What type of issue are you experiencing?";
    } else if (input.includes('status') || input.includes('check')) {
      return "To check your complaint status, you can go to your Dashboard or Complaint List. Each complaint has a unique ID that you can use to track its progress. Would you like me to help you find a specific complaint?";
    } else if (input.includes('urgent') || input.includes('emergency')) {
      return "For urgent matters, please mark your complaint as 'Urgent' priority when submitting. For emergencies requiring immediate attention, please contact the appropriate emergency services. How can I assist you with your urgent complaint?";
    } else if (input.includes('help') || input.includes('how')) {
      return "I'm here to help! I can assist you with:\n• Filing new complaints\n• Checking complaint status\n• Explaining the complaint process\n• Providing general information\n\nWhat specific help do you need?";
    } else if (input.includes('hello') || input.includes('hi')) {
      return "Hello! I'm glad you're here. I'm your ComplEase virtual assistant, ready to help you with any complaint-related questions or tasks. What can I do for you today?";
    } else {
      return "I understand you're asking about: '" + userInput + "'. While I'm still learning, I can help you with complaint submissions, status checks, and general guidance. Could you please rephrase your question or let me know if you'd like to file a complaint?";
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    { text: "File a new complaint", action: () => setInputMessage("I want to file a complaint") },
    { text: "Check complaint status", action: () => setInputMessage("Check my complaint status") },
    { text: "How does this work?", action: () => setInputMessage("How does the complaint system work?") },
    { text: "Contact support", action: () => setInputMessage("I need to contact human support") }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    🤖
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">ComplEase Assistant</h1>
                    <p className="text-sm text-blue-100">
                      {isConnected ? 'Online' : 'Connecting...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || !isConnected}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">How I can help:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Guide you through filing complaints</li>
              <li>• Help check the status of your submissions</li>
              <li>• Provide information about complaint categories and priorities</li>
              <li>• Answer frequently asked questions</li>
              <li>• Connect you with human support when needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
