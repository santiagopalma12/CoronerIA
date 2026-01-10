"""
Router de NER - Extracción de entidades con Azure OpenAI / RigoBERTa
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, List
import logging

from services.ner_service import NERService

router = APIRouter(prefix="/api/ner", tags=["ner"])
logger = logging.getLogger(__name__)

# Servicio NER (singleton)
ner_service = NERService()


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


@router.post("/extract-batch")
async def extract_batch(texts: List[str]):
    """Extrae entidades de múltiples textos."""
    
    results = []
    for text in texts:
        result = await ner_service.extract_and_map(text)
        results.append(result)
    
    return {"results": results}
