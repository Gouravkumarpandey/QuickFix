from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

# Import AI services
from ..chatbot.rasa_connector import RasaConnector
from ..chatbot.dialogflow_connector import DialogflowConnector
from ..models.classifier import ComplaintClassifier
from ..models.sentiment import SentimentAnalyzer

logger = logging.getLogger(__name__)
router = APIRouter()

# Request/Response Models
class ChatMessage(BaseModel):
    message: str
    conversationId: Optional[str] = None
    userId: Optional[str] = None
    timestamp: Optional[datetime] = None

class ChatResponse(BaseModel):
    message: str
    conversationId: str
    intent: Optional[str] = None
    confidence: Optional[float] = None
    entities: Optional[List[Dict[str, Any]]] = None
    suggestions: Optional[List[str]] = None
    timestamp: datetime

class TextAnalysisRequest(BaseModel):
    text: str

class IntentResponse(BaseModel):
    intent: str
    confidence: float
    entities: List[Dict[str, Any]]

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    score: float

class ClassificationResponse(BaseModel):
    category: str
    confidence: float
    subcategory: Optional[str] = None

class ComplaintSuggestionsRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class ComplaintSuggestionsResponse(BaseModel):
    suggestions: Dict[str, Any]

# Chatbot Routes
@router.post("/chatbot/message", response_model=ChatResponse)
async def send_message(request: ChatMessage):
    """Send message to chatbot and get response"""
    try:
        # Use Rasa connector by default, fallback to Dialogflow
        rasa_connector = RasaConnector()
        
        if rasa_connector.is_healthy():
            response = await rasa_connector.send_message(
                message=request.message,
                conversation_id=request.conversationId,
                user_id=request.userId
            )
        else:
            # Fallback to Dialogflow
            dialogflow_connector = DialogflowConnector()
            response = await dialogflow_connector.send_message(
                message=request.message,
                session_id=request.conversationId or f"user_{request.userId}",
                user_id=request.userId
            )
        
        return ChatResponse(
            message=response.get("text", "I'm sorry, I didn't understand that."),
            conversationId=response.get("conversation_id", request.conversationId or "new"),
            intent=response.get("intent"),
            confidence=response.get("confidence"),
            entities=response.get("entities", []),
            suggestions=response.get("suggestions", []),
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error in chatbot message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chatbot/conversation")
async def start_conversation(request: Dict[str, Any]):
    """Start a new conversation"""
    try:
        rasa_connector = RasaConnector()
        conversation_id = await rasa_connector.create_conversation(
            user_id=request.get("user_id")
        )
        
        return {
            "conversationId": conversation_id,
            "status": "started",
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error starting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chatbot/conversation/{conversation_id}")
async def get_conversation_history(conversation_id: str):
    """Get conversation history"""
    try:
        rasa_connector = RasaConnector()
        history = await rasa_connector.get_conversation_history(conversation_id)
        
        return {
            "conversationId": conversation_id,
            "history": history,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chatbot/conversation/{conversation_id}/end")
async def end_conversation(conversation_id: str):
    """End a conversation"""
    try:
        rasa_connector = RasaConnector()
        await rasa_connector.end_conversation(conversation_id)
        
        return {
            "conversationId": conversation_id,
            "status": "ended",
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error ending conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chatbot/feedback")
async def submit_feedback(request: Dict[str, Any]):
    """Submit feedback for chatbot interaction"""
    try:
        # Log feedback for analysis
        logger.info(f"Chatbot feedback: {request}")
        
        return {
            "status": "received",
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Text Analysis Routes
@router.post("/classifier/intent", response_model=IntentResponse)
async def classify_intent(request: TextAnalysisRequest):
    """Classify intent from text"""
    try:
        classifier = ComplaintClassifier()
        result = await classifier.classify_intent(request.text)
        
        return IntentResponse(
            intent=result.get("intent", "unknown"),
            confidence=result.get("confidence", 0.0),
            entities=result.get("entities", [])
        )
        
    except Exception as e:
        logger.error(f"Error classifying intent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classifier/categorize", response_model=ClassificationResponse)
async def categorize_complaint(request: TextAnalysisRequest):
    """Categorize complaint text"""
    try:
        classifier = ComplaintClassifier()
        result = await classifier.categorize_text(request.text)
        
        return ClassificationResponse(
            category=result.get("category", "Other"),
            confidence=result.get("confidence", 0.0),
            subcategory=result.get("subcategory")
        )
        
    except Exception as e:
        logger.error(f"Error categorizing complaint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/classifier/entities")
async def extract_entities(request: TextAnalysisRequest):
    """Extract entities from text"""
    try:
        classifier = ComplaintClassifier()
        entities = await classifier.extract_entities(request.text)
        
        return {
            "entities": entities,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error extracting entities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sentiment/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: TextAnalysisRequest):
    """Analyze sentiment of text"""
    try:
        analyzer = SentimentAnalyzer()
        result = await analyzer.analyze(request.text)
        
        return SentimentResponse(
            sentiment=result.get("sentiment", "neutral"),
            confidence=result.get("confidence", 0.0),
            score=result.get("score", 0.0)
        )
        
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# AI Assistant Routes
@router.post("/assistant/complaint-suggestions", response_model=ComplaintSuggestionsResponse)
async def get_complaint_suggestions(request: ComplaintSuggestionsRequest):
    """Get AI-powered suggestions for complaint improvement"""
    try:
        classifier = ComplaintClassifier()
        suggestions = await classifier.get_complaint_suggestions(
            title=request.title,
            description=request.description,
            category=request.category
        )
        
        return ComplaintSuggestionsResponse(suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Error getting complaint suggestions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# System Routes
@router.get("/chatbot/capabilities")
async def get_capabilities():
    """Get chatbot capabilities"""
    try:
        rasa_connector = RasaConnector()
        dialogflow_connector = DialogflowConnector()
        
        return {
            "capabilities": [
                "Basic Q&A",
                "Complaint Guidance",
                "Status Inquiries",
                "General Information",
                "Intent Classification",
                "Entity Extraction",
                "Sentiment Analysis"
            ],
            "features": {
                "intentClassification": True,
                "sentimentAnalysis": True,
                "entityExtraction": True,
                "multilingual": False,
                "rasa": rasa_connector.is_healthy(),
                "dialogflow": dialogflow_connector.is_healthy()
            },
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error getting capabilities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chatbot/metrics")
async def get_metrics():
    """Get chatbot metrics"""
    try:
        # TODO: Implement metrics collection
        return {
            "totalConversations": 0,
            "totalMessages": 0,
            "averageSessionDuration": 0,
            "satisfactionScore": 0,
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chatbot/train")
async def train_chatbot(request: Dict[str, Any]):
    """Train chatbot with new data (admin only)"""
    try:
        # TODO: Implement training functionality
        logger.info(f"Training request received: {request}")
        
        return {
            "status": "training_started",
            "timestamp": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error training chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))
