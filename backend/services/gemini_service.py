
import logging
import google.generativeai as genai
from core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Modelo Base (Eficiente para transcripción y extracción)
            self.basic_model = genai.GenerativeModel('gemini-2.0-flash-lite')
            # Modelo Razonamiento (Avanzado para causas de muerte)
            self.reasoning_model = genai.GenerativeModel('gemini-3-flash-preview')
            logger.info("✅ Gemini Service híbrido inicializado (v2.0 Lite + v3 Flash Preview)")
        else:
            self.basic_model = None
            self.reasoning_model = None
            logger.warning("⚠️ GEMINI_API_KEY no configurada.")

    async def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribe audio utilizando Gemini 1.5 Flash (Multimodal).
        Sube el archivo a la API de Gemini y solicita la transcripción.
        """
        if not self.basic_model:
            raise ValueError("Gemini no está configurado. Verifica GEMINI_API_KEY.")

        try:
            logger.info(f"📤 Subiendo audio a Gemini: {audio_path}")
            # Subir archivo usando la API de File
            audio_file = genai.upload_file(path=audio_path)
            
            # Esperar a que el archivo esté en estado ACTIVE
            import time
            max_wait = 30  # máximo 30 segundos
            wait_time = 0
            while audio_file.state.name == "PROCESSING" and wait_time < max_wait:
                logger.info(f"⏳ Esperando que archivo esté listo... ({wait_time}s)")
                time.sleep(2)
                wait_time += 2
                audio_file = genai.get_file(audio_file.name)
            
            if audio_file.state.name != "ACTIVE":
                raise ValueError(f"Archivo no está activo después de {max_wait}s: {audio_file.state.name}")
            
            # Prompt para transcripción médica precisa
            prompt = """
            Actúa como un transcriptor médico experto forense.
            Escucha atentamente este audio de una necropsia y transcríbelo textualmente.
            Mantén la terminología médica exacta.
            Si hay pausas o ruidos, ignóralos.
            Devuelve SOLO el texto transcrito, sin formato markdown ni comentarios.
            """

            logger.info("🧠 Generando transcripción con Gemini...")
            
            # Retry Logic para 429 Resource Exhausted
            import time
            max_retries = 3
            base_delay = 2
            
            for attempt in range(max_retries + 1):
                try:
                    response = self.basic_model.generate_content([prompt, audio_file])
                    text = response.text
                    logger.info(f"✅ Transcripción Gemini completada ({len(text)} caracteres)")
                    return text
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries:
                        sleep_time = base_delay * (2 ** attempt)
                        logger.warning(f"⚠️ Cuota excedida (429). Reintentando en {sleep_time}s... (Intento {attempt + 1}/{max_retries})")
                        time.sleep(sleep_time)
                    else:
                        raise e

        except Exception as e:
            logger.error(f"❌ Error en transcripción Gemini: {e}")
            raise

    async def extract_entities(self, text: str) -> dict:
        """
        Extrae entidades médico-legales del texto usando Gemini.
        Utiliza la estructura de campos v2.0 del protocolo IMLCF.
        """
        if not self.basic_model:
            raise ValueError("Gemini no está configurado.")

        prompt = f"""
Actúa como un experto forense peruano del IMLCF. Analiza el texto de necropsia y extrae información estructurada.

TEXTO DEL DICTADO:
"{text}"

INSTRUCCIONES:
1. Extrae "entities": lista de objetos con "text" y "type" (ORGAN, WEIGHT, MEASUREMENT, LESION_TYPE, CONDITION, PERSON, AGE, SEX)
2. Extrae "mapped_fields": diccionario con rutas de campo y valores

ESTRUCTURA DE CAMPOS (usar estas rutas exactas):

DATOS GENERALES:
- "datos_generales.numero_informe": número de protocolo/informe
- "datos_generales.fallecido.nombre": nombre del fallecido
- "datos_generales.fallecido.apellido_paterno": apellido paterno
- "datos_generales.fallecido.apellido_materno": apellido materno  
- "datos_generales.fallecido.edad": edad (número)
- "datos_generales.fallecido.sexo": "M" o "F"

FENÓMENOS CADAVÉRICOS:
- "fenomenos_cadavericos.livideces.observaciones": descripción de livideces
- "fenomenos_cadavericos.rigidez.observaciones": descripción de rigidez
- "fenomenos_cadavericos.tiempo_muerte_horas": tiempo estimado de muerte

EXAMEN INTERNO CABEZA:
- "examen_interno_cabeza.encefalo.peso": peso en gramos (número)
- "examen_interno_cabeza.encefalo.descripcion": descripción

EXAMEN INTERNO TÓRAX:
- "examen_interno_torax.pulmones.derecho.peso": peso en gramos (número)
- "examen_interno_torax.pulmones.derecho.descripcion": descripción
- "examen_interno_torax.pulmones.izquierdo.peso": peso en gramos (número)
- "examen_interno_torax.pulmones.izquierdo.descripcion": descripción
- "examen_interno_torax.corazon.peso": peso en gramos (número)
- "examen_interno_torax.corazon.descripcion": descripción

EXAMEN INTERNO ABDOMEN:
- "examen_interno_abdomen.higado.peso": peso en gramos (número)
- "examen_interno_abdomen.higado.descripcion": descripción
- "examen_interno_abdomen.bazo.peso": peso en gramos (número)
- "examen_interno_abdomen.rinones.derecho.peso": peso en gramos (número)
- "examen_interno_abdomen.rinones.izquierdo.peso": peso en gramos (número)

CAUSAS DE MUERTE:
- "causas_muerte.diagnostico_presuntivo.causa_final.texto": causa final
- "causas_muerte.diagnostico_presuntivo.causa_basica.texto": causa básica

EJEMPLO de respuesta:
{{
  "entities": [
    {{"text": "Juan Rodríguez", "type": "PERSON"}},
    {{"text": "23 años", "type": "AGE"}},
    {{"text": "masculino", "type": "SEX"}}
  ],
  "mapped_fields": {{
    "datos_generales.fallecido.nombre": "Juan",
    "datos_generales.fallecido.apellido_paterno": "Rodríguez",
    "datos_generales.fallecido.edad": 23,
    "datos_generales.fallecido.sexo": "M"
  }}
}}

Responde SOLO con JSON válido, sin markdown ni comentarios.
"""
        
        try:
            logger.info("🔍 Extrayendo entidades v2.0 con Gemini...")
            # Retry Logic para 429 Resource Exhausted
            import time
            max_retries = 3
            base_delay = 2
            
            for attempt in range(max_retries + 1):
                try:
                    response = self.basic_model.generate_content(prompt)
                    # Limpiar posible markdown ```json ... ```
                    clean_text = response.text.replace("```json", "").replace("```", "").strip()
                    import json
                    result = json.loads(clean_text)
                    logger.info(f"✅ NER v2.0: {len(result.get('mapped_fields', {}))} campos extraídos")
                    return result
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries:
                        sleep_time = base_delay * (2 ** attempt)
                        logger.warning(f"⚠️ Cuota NER excedida (429). Reintentando en {sleep_time}s... (Intento {attempt + 1}/{max_retries})")
                        time.sleep(sleep_time)
                    else:
                        raise e
        except Exception as e:
            return {"entities": [], "mapped_fields": {}}

    async def analyze_death_cause(self, findings_text: str) -> dict:
        """
        Utiliza Gemini 3 (Reasoning Model) para deducir la causa de muerte
        basada en los hallazgos transcritos.
        """
        if not self.reasoning_model:
            raise ValueError("Gemini 3 (Reasoning) no está configurado.")

        prompt = f"""
        Actúa como un Médico Legista Senior.
        Analiza los siguientes HALLAZGOS DE NECROPSIA y razona paso a paso para determinar la Causa de Muerte.
        Utiliza tu capacidad de razonamiento profundo para conectar lesiones y patologías.

        HALLAZGOS:
        "{findings_text}"
        
        Tu tarea:
        1. Identificar la Causa Final (mecanismo que produjo la muerte directa).
        2. Identificar la Causa Intermedia (consecuencia patológica).
        3. Identificar la Causa Básica (evento o enfermedad inicial).
        4. Proveer un "razonamiento_clinico" detallado justificando tu deducción.

        Responde SOLO en JSON con este formato:
        {{
            "causa_final": "...",
            "causa_intermedia": "...",
            "causa_basica": "...",
            "razonamiento_clinico": "..."
        }}
        """

        try:
            logger.info("🧠 Gemini 3 Thinking: Analizando causa de muerte...")
            
            # Retry Logic
            import time
            max_retries = 3
            base_delay = 2
            
            for attempt in range(max_retries + 1):
                try:
                    response = self.reasoning_model.generate_content(prompt)
                    clean_text = response.text.replace("```json", "").replace("```", "").strip()
                    import json
                    result = json.loads(clean_text)
                    logger.info("✅ Gemini 3: Análisis completado.")
                    return result
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries:
                        sleep_time = base_delay * (2 ** attempt)
                        logger.warning(f"⚠️ Gemini 3 Busy (429). Reintentando en {sleep_time}s...")
                        time.sleep(sleep_time)
                    else:
                        raise e
                        
        except Exception as e:
            logger.error(f"❌ Error Gemini 3 Reasoning: {e}")
            raise

print("Gemini Service Loaded")
