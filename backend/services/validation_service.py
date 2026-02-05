import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from core.config import settings

logger = logging.getLogger(__name__)

class ValidationService:
    """
    Servicio de validación de consistencia biológica y forense.
    Detecta posibles errores de transcripción o alucinaciones del LLM.
    """

    def __init__(self):
        self.dictionary_path = Path(settings.CORONERIA_DATA).parent / "data" / "medical_dictionary.json"
        self.rules = self._load_rules()

    def _load_rules(self) -> Dict:
        """Carga reglas y rangos desde el diccionario json."""
        try:
            if not self.dictionary_path.exists():
                logger.warning(f"Diccionario médico no encontrado en {self.dictionary_path}")
                return {}
            
            with open(self.dictionary_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("rangos_referencia", {})
        except Exception as e:
            logger.error(f"Error cargando reglas de validación: {e}")
            return {}

    def validate_case(self, data: Dict[str, Any]) -> List[str]:
        """
        Valida un caso completo y retorna una lista de advertencias (human-readable).
        """
        warnings = []
        
        # 1. Validar Pesos de Órganos (Entidades planas o mapeadas)
        mapped = data.get("mapped_fields", {})
        
        # Mapeo de campos internos a claves de reglas
        field_map = {
            "examen_interno_cabeza.encefalo.peso": "encefalo_peso",
            "examen_interno_torax.corazon.peso": "corazon_peso",
            "examen_interno_torax.pulmon_derecho.peso": "pulmon_derecho_peso",
            "examen_interno_torax.pulmones.derecho.peso": "pulmon_derecho_peso", # Variante
            "examen_interno_torax.pulmon_izquierdo.peso": "pulmon_izquierdo_peso",
            "examen_interno_torax.pulmones.izquierdo.peso": "pulmon_izquierdo_peso", # Variante
            "examen_interno_abdomen.higado.peso": "higado_peso",
            "examen_interno_abdomen.bazo.peso": "bazo_peso",
            "examen_interno_abdomen.rinon_derecho.peso": "rinon_peso",
            "examen_interno_abdomen.rinones.derecho.peso": "rinon_peso", # Variante
            "examen_interno_abdomen.rinon_izquierdo.peso": "rinon_peso",
            "examen_interno_abdomen.rinones.izquierdo.peso": "rinon_peso" # Variante
        }

        for field_path, rule_key in field_map.items():
            val = mapped.get(field_path)
            if val is not None:
                # Intentar convertir a float para comparar
                try:
                    weight = float(val)
                    if not self._check_range(weight, rule_key):
                         w_min = self.rules[rule_key]['min']
                         w_max = self.rules[rule_key]['max']
                         organ_name = rule_key.replace('_peso', '').replace('_', ' ').capitalize()
                         warnings.append(f"[!] {organ_name}: {weight}g fuera de rango normal ({w_min}-{w_max}g). Verificar dictado.")
                except (ValueError, TypeError):
                    pass # No es un número, ignorar validación de rango

        # 2. Validar Completitud Crítica
        required_fields = [
            ("datos_generales.numero_informe", "Falta Número de Informe"),
            ("datos_generales.fallecido.sexo", "Falta Sexo del Fallecido")
        ]

        for field, msg in required_fields:
            if not mapped.get(field):
                warnings.append(f"[!] {msg}")

        return warnings

    def _check_range(self, value: float, rule_key: str) -> bool:
        """Verifica si un valor está dentro del rango de referencia."""
        if rule_key not in self.rules:
            return True # Si no hay regla, pasa
        
        r = self.rules[rule_key]
        return r['min'] <= value <= r['max']
