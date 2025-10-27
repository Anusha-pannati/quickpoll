from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import logging
from app.services.websocket_manager import manager

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    poll_id: Optional[int] = Query(None)
):                                                                      
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket, poll_id)
    
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            
            # Handle ping/pong for connection keep-alive
            if data == "ping":
                await websocket.send_text("pong")
            
            logger.debug(f"Received message: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, poll_id)
        logger.info(f"WebSocket disconnected for poll {poll_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, poll_id)
