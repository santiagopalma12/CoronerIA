"""
Router de NER - Extracción de entidades con Azure OpenAI / RigoBERTa y Analisis Forense con Gemini 3
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
import logging

from services.ner_service import NERService
# Import Directo de GeminiService para la función especial de análisis
from services.gemini_service import GeminiService

router = APIRouter(prefix="/api/ner", tags=["ner"])
logger = logging.getLogger(__name__)

# Servicio NER (singleton)
ner_service = NERService()
# Instancia dedicada para Analisis (podría integrarse en NERService pero por premura Hackathon va directo)
gemini_analyzer = GeminiService()


class ExtractionRequest(BaseModel):
    text: str


class Entity(BaseModel):
    text: str
    type: str
    start: int = 0
    end: int = 0


class ExtractionResponse(BaseModel):
    entities: List[Dict[str, Any]]
    mapped_fields: Dict[str, Any]
    mode: str

class AnalysisRequest(BaseModel):
    findings_text: str

class AnalysisResponse(BaseModel):
    causa_final: str
    causa_intermedia: str
    causa_basica: str
    razonamiento_clinico: str


@router.get("/mode")
async def get_mode():
    """Obtiene el modo actual de NER (azure/edge)."""
    return {
        "mode": ner_service.get_current_mode(),
        "azure_available": ner_service.is_azure_available()
    }


@router.post("/extract", response_model=ExtractionResponse)
async def extract_entities(request: ExtractionRequest):
    """Extrae entidades y mapea a campos del protocolo."""
    
    try:
        result = await ner_service.extract_and_map(request.text)
        
        return ExtractionResponse(
            entities=result.get("entities", []),
            mapped_fields=result.get("mapped_fields", {}),
            mode=result.get("mode", "unknown")
        )
        
    except Exception as e:
        logger.error(f"Error en extracción NER: {e}")
        return ExtractionResponse(
            entities=[],
            mapped_fields={},
            mode="error"
        )

@router.post("/analyze-death-cause", response_model=AnalysisResponse)
async def analyze_death_cause_endpoint(request: AnalysisRequest):
    """
    [GEMINI 3 FEATURE]
    Analiza hallazgos forenses y razona la causa de muerte.
    """
    try:
        if not gemini_analyzer.reasoning_model:
             # Fallback ficticio si no hay key, para evitar crash en demo
            logger.warning("Gemini 3 no disponible. Usando fallback.")
            return AnalysisResponse(
                causa_final="No disponible (Configure GEMINI_API_KEY)",
                causa_intermedia="-",
                causa_basica="-",
                razonamiento_clinico="El modelo de razonamiento Gemini 3 no está activo."
            )

        result = await gemini_analyzer.analyze_death_cause(request.findings_text)
        
        return AnalysisResponse(
            causa_final=result.get("causa_final", "Indeterminado"),
            causa_intermedia=result.get("causa_intermedia", ""),
            causa_basica=result.get("causa_basica", ""),
            razonamiento_clinico=result.get("razonamiento_clinico", "Sin razonamiento.")
        )
    except Exception as e:
        logger.error(f"Error en análisis Gemini 3: {e}")
        # Retornar error controlado
        return AnalysisResponse(
            causa_final="Error en análisis",
            causa_intermedia="",
            causa_basica="",
            razonamiento_clinico=f"Hubo un error procesando la solicitud: {str(e)}"
        )


@router.post("/extract-batch")
async def extract_batch(texts: List[str]):
    """Extrae entidades de múltiples textos."""
    
    results = []
    for text in texts:
        result = await ner_service.extract_and_map(text)
        results.append(result)
    
    return {"results": results}
