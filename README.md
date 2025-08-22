# QuickFix - Comprehensive Complaint Management System

QuickFix is a full-stack web application designed to streamline complaint management processes with AI-powered features including intelligent chatbot support, automated categorization, and sentiment analysis.

## 🚀 Features

### Frontend (React + TailwindCSS)
- **User Authentication**: Secure login, registration, and password reset
- **Dashboard**: Real-time complaint statistics and overview
- **Complaint Management**: Submit, track, and manage complaints
- **AI Chatbot**: Intelligent support and guidance
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live status updates and notifications

### Backend (Node.js + Express + MongoDB)
- **RESTful API**: Comprehensive API for all operations
- **Authentication & Authorization**: JWT-based security
- **File Upload**: Support for complaint attachments
- **Email/SMS Notifications**: Automated communication
- **Admin Panel**: Administrative management tools
- **Rate Limiting**: API protection and abuse prevention

### AI Service (Python + FastAPI)
- **Chatbot Integration**: Rasa and Dialogflow support
- **Text Classification**: Automatic complaint categorization
- **Sentiment Analysis**: Emotion detection in complaints
- **Intent Recognition**: Natural language understanding
- **Entity Extraction**: Key information identification

## 🏗️ Architecture

```
complaease/
├── frontend/              # React application
├── backend/               # Node.js API server
├── ai-service/            # Python AI microservice
└── docs/                  # Documentation
```

## 📋 Prerequisites

- **Node.js** (v16+)
- **Python** (v3.8+)
- **MongoDB** (v5.0+)
- **Redis** (optional, for caching)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/complaease.git
cd complaease
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### 4. AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/complaease
JWT_SECRET=your-jwt-secret
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

#### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_AI_SERVICE_URL=http://localhost:8000/api
```

#### AI Service (.env)
```env
RASA_URL=http://localhost:5005
DIALOGFLOW_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Complaints
- `GET /api/complaints` - Get user complaints
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints/:id` - Get specific complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### AI Services
- `POST /api/chatbot/message` - Send message to chatbot
- `POST /api/classifier/categorize` - Categorize text
- `POST /api/sentiment/analyze` - Analyze sentiment

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### AI Service Tests
```bash
cd ai-service
pytest
pytest --cov=app
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Set up production environment variables
2. Build frontend: `npm run build`
3. Start backend: `npm start`
4. Start AI service: `python main.py`

## 📊 Features in Detail

### Complaint Management
- **Multi-step Forms**: Guided complaint submission
- **File Attachments**: Image and document support
- **Status Tracking**: Real-time progress updates
- **Priority Levels**: Urgent, High, Medium, Low
- **Categories**: Infrastructure, Services, Safety, etc.

### AI-Powered Features
- **Smart Categorization**: Automatic complaint classification
- **Sentiment Analysis**: Emotion detection and priority adjustment
- **Chatbot Support**: 24/7 automated assistance
- **Duplicate Detection**: Identify similar complaints
- **Auto-Response**: Intelligent acknowledgments

### Admin Features
- **Dashboard Analytics**: Comprehensive reporting
- **User Management**: Account administration
- **Complaint Assignment**: Workflow management
- **Bulk Operations**: Batch processing
- **Export Tools**: Data export capabilities

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Data sanitization
- **File Type Validation**: Secure uploads
- **CORS Protection**: Cross-origin security
- **Helmet.js**: Security headers

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries
- **Caching**: Redis integration
- **Compression**: Gzip responses
- **Pagination**: Efficient data loading
- **Image Optimization**: Automatic resizing
- **CDN Ready**: Static asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend**: React, TailwindCSS, Context API
- **Backend**: Node.js, Express, MongoDB, JWT
- **AI/ML**: Python, FastAPI, Rasa, TensorFlow
- **DevOps**: Docker, CI/CD, AWS/Azure deployment

## 🆘 Support

For support, email support@complaease.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with government systems
- [ ] Blockchain verification
- [ ] IoT device integration

## 📄 Documentation

- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guidelines](docs/contributing.md)
- [Architecture Overview](docs/architecture.md)
