from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.models.database import sessionmanager, Base
from app.routers import auth, polls, websocket

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown."""
    # Startup
    logger.info("Starting up application...")
    sessionmanager.init_db(settings.DATABASE_URL)
    
    # Create tables (use Alembic in production)
    async with sessionmanager.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database initialized")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await sessionmanager.close()

app = FastAPI(
    title="QuickPoll API",
    description="Real-time opinion polling platform",
    version="1.0.0",
    lifespan=lifespan
)

# ✅ Allow your Next.js frontend origin
origins = [
    "http://localhost:3000",  # Next.js dev server
    "https://quickpoll-six.vercel.app/",  # (optional) add your deployed site later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # domains allowed
    allow_credentials=True,           # allow cookies / tokens
    allow_methods=["*"],              # allow all methods (GET, POST, etc.)
    allow_headers=["*"],              # allow all headers
)
# Include routers AFTER CORS middleware
app.include_router(auth.router)
app.include_router(polls.router)
app.include_router(websocket.router)

@app.get("/")
async def root():
    return {"message": "QuickPoll API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
