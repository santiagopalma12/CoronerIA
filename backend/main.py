"""
CoronerIA Backend - Main Application
Asistente de IA para Documentación Médico-Legal
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import init_db
from core.logging_config import setup_logging
from routers import transcription, ner, export, cases, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicialización y cleanup de la aplicación."""
    # Startup
    setup_logging()
    await init_db()
    print(f"🔬 CoronerIA Backend iniciado en modo: {settings.CORONERIA_MODE}")
    
    yield
    
    # Shutdown
    print("🔬 CoronerIA Backend cerrado")


app = FastAPI(
    title="CoronerIA API",
    description="API para asistente de documentación médico-legal con IA",
    version="2.0.0",
    lifespan=lifespan,
    redirect_slashes=False
)

# CORS para frontend Electron
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(transcription.router)
app.include_router(ner.router)
app.include_router(export.router)
app.include_router(cases.router)


@app.get("/")
async def root():
    """Health check."""
    return {
        "status": "ok",
        "service": "CoronerIA API",
        "version": "2.0.0",
        "mode": settings.CORONERIA_MODE
    }


@app.get("/health")
async def health():
    """Health check detallado."""
    return {
        "status": "healthy",
        "azure_configured": settings.is_azure_configured,
        "mode": settings.CORONERIA_MODE,
        "language": settings.CORONERIA_LANGUAGE
    }
