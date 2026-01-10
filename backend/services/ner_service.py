"""
Servicio de extracción de entidades (NER).
Soporta Azure OpenAI GPT-4 (cloud) y RigoBERTa (edge).
"""

import os
import json
import logging
import re
from typing import Dict, Any, List

from core.config import settings
from services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

# System prompt para Azure OpenAI
SYSTEM_PROMPT_NER = """
Eres un especialista forense experto en estructurar información de protocolos de necropsia.
Tu tarea es extraer entidades y MÁPEALAS a la estructura JSON exacta del Protocolo ForensIA v2.

## INSTRUCCIONES
1. Lee todo el texto del dictado.
2. Extrae:
   - DATOS GENERALES: Nombre, Edad, Sexo, N° Informe.
   - BIOMETRÍA: Talla (m), Peso (kg).
   - PRENDAS: Lista de prendas (tipo, color, material, descripción).
   - EXAMEN EXTERNO: Piel, Cicatrices, Tatuajes, Cabeza (perímetro, forma, cabello, ojos...), Cuello, Tórax, Abdomen, Miembros (sup/inf), Genitales externos.
   - FENÓMENOS CADAVÉRICOS: Livideces, Rigidez, Temperatura, etc.
   - EXAMEN INTERNO (CABEZA): Encéfalo, Cerebelo, Tronco (pesos y características).
   - EXAMEN INTERNO (CUELLO): Columna, Faringe, Esófago, Laringe, Glotis, Epiglotis, Hioides, Tráquea, Tiroides, Vasos.
   - EXAMEN INTERNO (TÓRAX): Pulmones, Corazón (valvulas, cavidades), Timo, Mediastino.
   - EXAMEN INTERNO (ABDOMEN): Hígado, Bazo, Páncreas, Riñones, Estómago, Intestinos, etc.
   - APARATO GENITAL: Femenino (Útero, Ovarios) o Masculino (Próstata).
   - LESIONES TRAUMÁTICAS: Descripción detallada de lesiones.
   - PERENNIZACIÓN: Si se tomaron fotos/videos, responsables.
   - DATOS REFERENCIALES: Situación (Identificado/NN), Destino (Donación, etc.).
   - CAUSAS DE MUERTE: Diagnóstico presuntivo (causa final, intermedia, básica) y Etiología (homicida/suicida/etc).
   - ÓRGANOS ADICIONALES: Placenta, cordón umbilical.

3. Responde SOLAMENTE con el siguiente JSON válido (sin markdown):

```json
{
  "entities": [],
  "mapped_fields": {
    "datos_generales.numero_informe": "...",
    "datos_generales.fallecido.nombre": "...",
    "datos_generales.fallecido.edad": 0,
    "datos_generales.fallecido.sexo": "M",
    "datos_generales.fallecido.talla": 0.0,
    "datos_generales.fallecido.peso": 0.0,
    
    "datos_generales.prendas": [
      {"tipo": "Casaca", "color": "Gris", "material": "Cuero", "descripcion": "..."}
    ],

    "examen_externo.piel": "...",
    "examen_externo.cicatrices": "...",
    "examen_externo.tatuajes": "...",
    "examen_externo.cabeza": "...",
    "examen_externo_cabeza.perimetro_cefalico": 0,
    "examen_externo_cabeza.forma": "...",
    "examen_externo_cabeza.cabello": "...",
    "examen_externo.cuello": "...",
    "examen_externo.torax": "...",
    "examen_externo.abdomen": "...",
    "examen_externo.miembros_superiores": "...",
    "examen_externo.miembros_inferiores": "...",
    "examen_externo.genitales_externos": "...",

    "fenomenos_cadavericos.livideces.observaciones": "...",
    
    "examen_interno_cabeza.encefalo.peso": 0,
    "examen_interno_cabeza.encefalo.descripcion": "...",
    
    "examen_interno_cuello.laringe.descripcion": "...",
    "examen_interno_cuello.traquea.descripcion": "...",
    "examen_interno_cuello.tiroides.peso": 0,

    "examen_interno_torax.pulmon_derecho.peso": 0,
    "examen_interno_torax.corazon.peso": 0,
    
    "examen_interno_abdomen.higado.peso": 0,
    "examen_interno_abdomen.estomago.descripcion": "...",

    "aparato_genital.femenino.utero.descripcion": "...",
    "aparato_genital.masculino.prostata": "...",

    "lesiones_traumaticas.descripcion": "...",

    "perennizacion.se_realizo": "si",
    "perennizacion.responsable.nombre": "...",

    "datos_referenciales.datos_referenciales": "...",
    "datos_referenciales.tipo_situacion_cadaver": "identificado",

    "organos_adicionales.placenta": false,
    "organos_adicionales.caracteristicas": "...",

    "causas_muerte.diagnostico_presuntivo.causa_final.texto": "...",
    "causas_muerte.diagnostico_presuntivo.etiologia.forma": "HOMICIDA"
  }
}
```

## DETALLES DE CORRESPONDENCIA (IMPORTANTE)
- Si dice "1.69 m", asigna -> `datos_generales.fallecido.talla`: 1.69
- Si dice "Cicatriz oblicua de 4 cm en fosa iliaca derecha", asigna -> `examen_externo.cicatrices`: "Cicatriz oblicua de 4 cm en fosa iliaca derecha"
- Asigna pesos a `nombre_organo.peso` (en gramos).
- Si describe lesiones, agrégalas a `lesiones_traumaticas.descripcion` Y/O al campo específico (ej: `examen_externo.cabeza`).
"""


class NERService:
    """Servicio unificado de extracción de entidades."""
    
    def __init__(self):
        self._mode = self._determine_mode()
        self._azure_client = None
        self._local_model = None
        self._gemini_service = None
        
        if self._mode == "gemini":
            self._gemini_service = GeminiService()
        
        logger.info(f"NERService inicializado en modo: {self._mode}")
    
    def _determine_mode(self) -> str:
        """Determina el modo basado en configuración."""
        effective = settings.get_effective_mode()
        
        if settings.GEMINI_API_KEY:
            return "gemini"
        
        if effective == "azure" and settings.AZURE_OPENAI_KEY:
            return "azure"
        return "edge"
    
    def get_current_mode(self) -> str:
        return self._mode
    
    def is_azure_available(self) -> bool:
        return bool(settings.AZURE_OPENAI_KEY)
    
    async def extract_and_map(self, text: str) -> Dict[str, Any]:
        """Extrae entidades y mapea a campos del protocolo."""
        
        if self._mode == "azure":
            return await self._extract_azure(text)
        elif self._mode == "gemini":
             # Usamos el método extract_entities de GeminiService que ya devuelve la estructura correcta
            result = await self._gemini_service.extract_entities(text)
            result["mode"] = "gemini"
            return result
        else:
            return await self._extract_local(text)
    
    async def _extract_azure(self, text: str) -> Dict[str, Any]:
        """Extrae usando Azure OpenAI GPT-4."""
        try:
            from openai import AzureOpenAI
            
            if self._azure_client is None:
                self._azure_client = AzureOpenAI(
                    api_key=settings.AZURE_OPENAI_KEY,
                    api_version="2024-02-01",
                    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
                )
            
            response = self._azure_client.chat.completions.create(
                model=settings.AZURE_OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT_NER},
                    {"role": "user", "content": text}
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=2000
            )
            
            result = json.loads(response.choices[0].message.content)
            result["mode"] = "azure"
            
            return result
            
        except Exception as e:
            logger.error(f"Error en Azure OpenAI NER: {e}")
            # Fallback a local
            return await self._extract_local(text)
    
    async def _extract_local(self, text: str) -> Dict[str, Any]:
        """Extrae usando regex y patrones locales (fallback simple)."""
        
        entities = []
        mapped_fields = {}
        
        # Patrones para extracción básica
        patterns = {
            "WEIGHT": r'(\d+(?:[.,]\d+)?)\s*(?:gramos?|gr?|g)\b',
            "MEASUREMENT": r'(\d+(?:[.,]\d+)?)\s*(?:por|x)\s*(\d+(?:[.,]\d+)?)\s*(?:centímetros?|cm)\b',
            "TEMPERATURE": r'(\d+(?:[.,]\d+)?)\s*(?:grados?|°C?)\b',
        }
        
        for entity_type, pattern in patterns.items():
            for match in re.finditer(pattern, text, re.IGNORECASE):
                entities.append({
                    "text": match.group(0),
                    "type": entity_type,
                    "start": match.start(),
                    "end": match.end()
                })
        
        # Mapeo básico de órganos
        organ_patterns = {
            r'pulm[oó]n\s+derecho': ('campo_60_pulmon_derecho', 'peso_pulmon_derecho'),
            r'pulm[oó]n\s+izquierdo': ('campo_61_pulmon_izquierdo', 'peso_pulmon_izquierdo'),
            r'coraz[oó]n': ('campo_63_corazon', 'peso_corazon'),
            r'h[ií]gado': ('campo_72_higado', 'peso_higado'),
            r'bazo': ('campo_74_bazo', 'peso_bazo'),
            r'enc[eé]falo': ('campo_52_encefalo', 'peso_encefalo'),
        }
        
        text_lower = text.lower()
        
        for pattern, (field, weight_field) in organ_patterns.items():
            if re.search(pattern, text_lower):
                entities.append({
                    "text": re.search(pattern, text_lower).group(0),
                    "type": "ORGAN"
                })
                
                # Buscar peso asociado
                weight_match = re.search(r'(\d+)\s*(?:gramos?|g)', text_lower)
                if weight_match:
                    mapped_fields[weight_field] = int(weight_match.group(1))
        
        # Lesiones
        lesion_patterns = [
            r'herida\s+contusa',
            r'herida\s+cortante',
            r'equimosis',
            r'esquimosis',
            r'hematoma',
            r'laceración',
        ]
        
        for pattern in lesion_patterns:
            match = re.search(pattern, text_lower)
            if match:
                entities.append({
                    "text": match.group(0),
                    "type": "LESION_TYPE"
                })
        
        return {
            "entities": entities,
            "mapped_fields": mapped_fields,
            "mode": "edge"
        }
