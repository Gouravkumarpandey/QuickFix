import aiohttp
import asyncio
import logging
from typing import Dict, List, Optional, Any
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class RasaConnector:
    """Connector for Rasa chatbot framework"""
    
    def __init__(self, rasa_url: str = "http://localhost:5005"):
        self.rasa_url = rasa_url
        self.session = None
        self.healthy = False
        
    async def initialize(self):
        """Initialize the Rasa connector"""
        try:
            self.session = aiohttp.ClientSession()
            
            # Test connection to Rasa server
            await self._test_connection()
            self.healthy = True
            logger.info("Rasa connector initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Rasa connector: {e}")
            self.healthy = False
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
    
    def is_healthy(self) -> bool:
        """Check if Rasa connector is healthy"""
        return self.healthy
    
    async def _test_connection(self):
        """Test connection to Rasa server"""
        try:
            async with self.session.get(f"{self.rasa_url}/version") as response:
                if response.status == 200:
                    version_info = await response.json()
                    logger.info(f"Connected to Rasa server version: {version_info}")
                else:
                    raise Exception(f"Rasa server responded with status: {response.status}")
        except Exception as e:
            logger.warning(f"Rasa server not available: {e}")
            # Don't raise exception, just log warning
    
    async def send_message(
        self, 
        message: str, 
        conversation_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send message to Rasa and get response"""
        try:
            sender_id = conversation_id or user_id or "default_user"
            
            payload = {
                "sender": sender_id,
                "message": message
            }
            
            async with self.session.post(
                f"{self.rasa_url}/webhooks/rest/webhook",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    rasa_responses = await response.json()
                    
                    # Process Rasa response
                    if rasa_responses:
                        # Get the first response
                        rasa_response = rasa_responses[0]
                        
                        # Parse response
                        bot_message = rasa_response.get("text", "I'm sorry, I didn't understand that.")
                        
                        # Get additional data if available
                        custom_data = rasa_response.get("custom", {})
                        
                        return {
                            "text": bot_message,
                            "conversation_id": sender_id,
                            "intent": custom_data.get("intent"),
                            "confidence": custom_data.get("confidence"),
                            "entities": custom_data.get("entities", []),
                            "suggestions": custom_data.get("suggestions", []),
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    else:
                        # No response from Rasa, return default
                        return await self._get_fallback_response(message, sender_id)
                
                else:
                    logger.error(f"Rasa API error: {response.status}")
                    return await self._get_fallback_response(message, sender_id)
                    
        except Exception as e:
            logger.error(f"Error sending message to Rasa: {e}")
            return await self._get_fallback_response(message, sender_id)
    
    async def _get_fallback_response(self, message: str, sender_id: str) -> Dict[str, Any]:
        """Generate fallback response when Rasa is unavailable"""
        # Simple keyword-based responses
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["hello", "hi", "hey", "start"]):
            response_text = "Hello! I'm your ComplEase assistant. How can I help you today?"
        elif any(word in message_lower for word in ["complaint", "issue", "problem"]):
            response_text = "I can help you with your complaint. Would you like to file a new complaint or check an existing one?"
        elif any(word in message_lower for word in ["status", "track", "check"]):
            response_text = "To check your complaint status, please provide your complaint ID or describe the issue."
        elif any(word in message_lower for word in ["help", "support", "assist"]):
            response_text = "I'm here to help! I can assist you with filing complaints, checking status, and answering questions about our services."
        elif any(word in message_lower for word in ["thank", "thanks"]):
            response_text = "You're welcome! Is there anything else I can help you with?"
        elif any(word in message_lower for word in ["bye", "goodbye", "exit"]):
            response_text = "Goodbye! Feel free to return if you need any assistance with your complaints."
        else:
            response_text = "I understand you're asking about that. While I'm still learning, I can help you with complaint submissions, status checks, and general guidance. Could you please rephrase your question?"
        
        return {
            "text": response_text,
            "conversation_id": sender_id,
            "intent": "fallback",
            "confidence": 0.5,
            "entities": [],
            "suggestions": [
                "File a new complaint",
                "Check complaint status",
                "Get help",
                "Contact support"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def create_conversation(self, user_id: Optional[str] = None) -> str:
        """Create a new conversation"""
        conversation_id = f"conv_{user_id}_{int(datetime.utcnow().timestamp())}"
        return conversation_id
    
    async def get_conversation_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Get conversation history"""
        try:
            # In a real implementation, this would fetch from Rasa's tracker store
            # For now, return empty history
            return []
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    async def end_conversation(self, conversation_id: str):
        """End a conversation"""
        try:
            # In a real implementation, this would clean up the conversation
            logger.info(f"Ending conversation: {conversation_id}")
            
        except Exception as e:
            logger.error(f"Error ending conversation: {e}")
    
    async def parse_message(self, message: str) -> Dict[str, Any]:
        """Parse message for intent and entities"""
        try:
            payload = {
                "text": message
            }
            
            async with self.session.post(
                f"{self.rasa_url}/model/parse",
                json=payload,
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    parse_result = await response.json()
                    return {
                        "intent": parse_result.get("intent", {}).get("name"),
                        "confidence": parse_result.get("intent", {}).get("confidence"),
                        "entities": parse_result.get("entities", [])
                    }
                
        except Exception as e:
            logger.error(f"Error parsing message: {e}")
        
        return {
            "intent": "unknown",
            "confidence": 0.0,
            "entities": []
        }
