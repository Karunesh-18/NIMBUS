import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Person_C.scheduler.jobs import start_scheduler

# Setup logger
logger = logging.getLogger("nimbus.main")
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the lifecycle of the FastAPI application.
    Starts background ingestion schedulers on startup and shuts them down on shutdown.
    """
    logger.info("Initializing background scheduler on startup...")
    scheduler = start_scheduler()
    
    yield
    
    if scheduler:
        logger.info("Shutting down background scheduler...")
        scheduler.shutdown()

app = FastAPI(
    title="NIMBUS API",
    description="Backend API for NIMBUS Air Quality & Enforcement Platform (Person C)",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from Person_C.api import wards, aqi, agent, simulation, enforcement, citizen

app.include_router(wards.router)
app.include_router(aqi.router)
app.include_router(agent.router)
app.include_router(simulation.router)
app.include_router(enforcement.router)
app.include_router(citizen.router)

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Simple health check.
    """
    return {"status": "healthy"}
