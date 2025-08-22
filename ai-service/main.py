from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
from contextlib import asynccontextmanager
import logging
from datetime import datetime

# Import route modules
from app.api.routes import router as api_router
from app.chatbot.rasa_connector import RasaConnector
from app.chatbot.dialogflow_connector import DialogflowConnector
from app.models.classifier import ComplaintClassifier
from app.models.sentiment import SentimentAnalyzer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
rasa_connector = None
dialogflow_connector = None
complaint_classifier = None
sentiment_analyzer = None

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting AI Service...")
    
    try:
        # Initialize AI models and connectors
        global rasa_connector, dialogflow_connector, complaint_classifier, sentiment_analyzer
        
        # Initialize Rasa connector
        rasa_connector = RasaConnector()
        await rasa_connector.initialize()
        
        # Initialize Dialogflow connector
        dialogflow_connector = DialogflowConnector()
        await dialogflow_connector.initialize()
        
        # Initialize ML models
        complaint_classifier = ComplaintClassifier()
        await complaint_classifier.load_model()
        
        sentiment_analyzer = SentimentAnalyzer()
        await sentiment_analyzer.load_model()
        
        logger.info("AI Service initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize AI Service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Service...")
    
    # Cleanup resources
    if rasa_connector:
        await rasa_connector.cleanup()
    
    if dialogflow_connector:
        await dialogflow_connector.cleanup()

# Create FastAPI app
app = FastAPI(
    title="ComplEase AI Service",
    description="AI-powered complaint analysis and chatbot service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React frontend
        "http://localhost:5000",  # Backend API
        "https://complaease.com", # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "AI Service",
        "version": "1.0.0",
        "components": {
            "rasa": rasa_connector.is_healthy() if rasa_connector else False,
            "dialogflow": dialogflow_connector.is_healthy() if dialogflow_connector else False,
            "classifier": complaint_classifier.is_loaded() if complaint_classifier else False,
            "sentiment": sentiment_analyzer.is_loaded() if sentiment_analyzer else False
        }
    }

# Authentication dependency
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token from backend"""
    try:
        # TODO: Implement JWT verification with backend
        # For now, just check if token exists
        if not credentials.credentials:
            raise HTTPException(status_code=401, detail="Invalid token")
        return credentials.credentials
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Include API routes
app.include_router(api_router, prefix="/api", tags=["API"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return HTTPException(
        status_code=500,
        detail="Internal server error"
    )

# Startup event (legacy - keeping for compatibility)
@app.on_event("startup")
async def startup_event():
    logger.info("AI Service startup event triggered")

# Shutdown event (legacy - keeping for compatibility)
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("AI Service shutdown event triggered")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
