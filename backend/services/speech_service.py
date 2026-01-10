"""
Servicio unificado de reconocimiento de voz.
Soporta Azure AI Speech (cloud) y Whisper local (edge).
"""

import os
import logging
from typing import Callable, Optional
from enum import Enum

from core.config import settings
from services.gemini_service import GeminiService

logger = logging.getLogger(__name__)


class SpeechMode(Enum):
    AZURE = "azure"
    EDGE = "edge"
    GEMINI = "gemini"


class SpeechService:
    """Servicio unificado de Speech-to-Text."""
    
    def __init__(self):
        self._mode = self._determine_mode()
        self._azure_recognizer = None
        self._whisper_model = None
        self._gemini_service = None
        self._is_streaming = False

        if self._mode == "gemini":
            self._gemini_service = GeminiService()
        
        logger.info(f"SpeechService inicializado en modo: {self._mode}")
    
    def _determine_mode(self) -> str:
        """Determina el modo basado en configuración y disponibilidad."""
        effective = settings.get_effective_mode()
        
        if settings.GEMINI_API_KEY:
            return "gemini"
        
        if effective == "azure" and settings.AZURE_SPEECH_KEY:
            return "azure"
        return "edge"
    
    def get_current_mode(self) -> str:
        return self._mode
    
    def is_azure_available(self) -> bool:
        return bool(settings.AZURE_SPEECH_KEY)
    
    async def transcribe_file(self, audio_path: str) -> str:
        """Transcribe un archivo de audio."""
        
        if self._mode == "azure":
            return await self._transcribe_azure(audio_path)
        elif self._mode == "gemini":
            return await self._gemini_service.transcribe_audio(audio_path)
        else:
            return await self._transcribe_whisper(audio_path)
    
    async def _transcribe_azure(self, audio_path: str) -> str:
        """Transcribe usando Azure AI Speech."""
        try:
            import azure.cognitiveservices.speech as speechsdk
            
            speech_config = speechsdk.SpeechConfig(
                subscription=settings.AZURE_SPEECH_KEY,
                region=settings.AZURE_SPEECH_REGION
            )
            speech_config.speech_recognition_language = settings.CORONERIA_LANGUAGE
            
            audio_config = speechsdk.AudioConfig(filename=audio_path)
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config,
                audio_config=audio_config
            )
            
            # Añadir vocabulario forense
            phrase_list = speechsdk.PhraseListGrammar.from_recognizer(recognizer)
            for term in self._get_forensic_terms():
                phrase_list.addPhrase(term)
            
            # Reconocer
            result = recognizer.recognize_once()
            
            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                return result.text
            else:
                logger.warning(f"Azure Speech no reconoció: {result.reason}")
                return ""
                
        except Exception as e:
            logger.error(f"Error en Azure Speech: {e}")
            # Fallback a Whisper
            return await self._transcribe_whisper(audio_path)
    
    async def _transcribe_whisper(self, audio_path: str) -> str:
        """Transcribe usando Whisper local."""
        try:
            if self._whisper_model is None:
                await self._load_whisper()
            
            segments, info = self._whisper_model.transcribe(
                audio_path,
                language="es",
                initial_prompt=self._get_forensic_prompt(),
                vad_filter=True
            )
            
            return " ".join([s.text for s in segments])
            
        except Exception as e:
            logger.error(f"Error en Whisper: {e}")
            return ""
    
    async def _load_whisper(self):
        """Carga el modelo Whisper."""
        from faster_whisper import WhisperModel
        
        model_path = os.path.join(settings.CORONERIA_MODELS, "whisper", "large-v3")
        
        # Verificar si hay GPU
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        compute_type = "float16" if device == "cuda" else "int8"
        
        logger.info(f"Cargando Whisper en {device}...")
        
        self._whisper_model = WhisperModel(
            "medium",
            device=device,
            compute_type=compute_type,
            download_root=os.path.join(settings.CORONERIA_MODELS, "whisper")
        )
        
        logger.info("Whisper cargado correctamente")
    
    async def start_streaming(
        self,
        on_partial: Callable,
        on_final: Callable,
        on_error: Callable
    ):
        """Inicia streaming de reconocimiento."""
        self._is_streaming = True
        
        if self._mode == "azure":
            await self._start_azure_streaming(on_partial, on_final, on_error)
        else:
            await self._start_whisper_streaming(on_partial, on_final, on_error)
    
    async def _start_azure_streaming(
        self,
        on_partial: Callable,
        on_final: Callable,
        on_error: Callable
    ):
        """Streaming con Azure AI Speech."""
        try:
            import azure.cognitiveservices.speech as speechsdk
            
            speech_config = speechsdk.SpeechConfig(
                subscription=settings.AZURE_SPEECH_KEY,
                region=settings.AZURE_SPEECH_REGION
            )
            speech_config.speech_recognition_language = settings.CORONERIA_LANGUAGE
            
            audio_config = speechsdk.AudioConfig(use_default_microphone=True)
            
            self._azure_recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config,
                audio_config=audio_config
            )
            
            # Vocabulario forense
            phrase_list = speechsdk.PhraseListGrammar.from_recognizer(
                self._azure_recognizer
            )
            for term in self._get_forensic_terms():
                phrase_list.addPhrase(term)
            
            # Callbacks
            def handle_recognizing(evt):
                import asyncio
                asyncio.create_task(on_partial(evt.result.text))
            
            def handle_recognized(evt):
                import asyncio
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    asyncio.create_task(on_final(evt.result.text))
            
            def handle_canceled(evt):
                import asyncio
                if evt.reason == speechsdk.CancellationReason.Error:
                    asyncio.create_task(on_error(evt.error_details))
            
            self._azure_recognizer.recognizing.connect(handle_recognizing)
            self._azure_recognizer.recognized.connect(handle_recognized)
            self._azure_recognizer.canceled.connect(handle_canceled)
            
            self._azure_recognizer.start_continuous_recognition()
            
        except Exception as e:
            logger.error(f"Error iniciando Azure streaming: {e}")
            await on_error(str(e))
    
    async def _start_whisper_streaming(
        self,
        on_partial: Callable,
        on_final: Callable,
        on_error: Callable
    ):
        """Streaming con Whisper local (simulado con chunks)."""
        # Whisper no soporta streaming nativo, usamos chunks
        # Esta es una implementación simplificada
        await on_error("Whisper streaming no implementado aún. Use modo archivo.")
    
    async def stop_streaming(self):
        """Detiene el streaming."""
        self._is_streaming = False
        
        if self._azure_recognizer:
            self._azure_recognizer.stop_continuous_recognition()
            self._azure_recognizer = None
    
    async def pause_streaming(self):
        """Pausa el streaming."""
        # Para Azure, no hay pausa nativa, así que detenemos
        if self._azure_recognizer:
            self._azure_recognizer.stop_continuous_recognition()
    
    async def resume_streaming(self):
        """Reanuda el streaming."""
        if self._azure_recognizer:
            self._azure_recognizer.start_continuous_recognition()
    
    def _get_forensic_terms(self) -> list:
        """Retorna lista de términos forenses para mejorar reconocimiento."""
        return [
            # Fenómenos cadavéricos
            "livideces", "livideces dorsales", "livideces modificables",
            "rigidez cadavérica", "rigidez generalizada",
            "putrefacción", "fauna cadavérica",
            # Lesiones
            "herida contusa", "herida cortante", "herida punzante",
            "herida incisa", "equimosis", "esquimosis", "hematoma",
            "excoriación", "laceración", "abrasión",
            "orificio de entrada", "orificio de salida",
            # Órganos
            "encéfalo", "meninges", "duramadre", "aracnoides",
            "pulmón derecho", "pulmón izquierdo",
            "pericardio", "miocardio", "endocardio",
            "hígado", "bazo", "páncreas",
            "peritoneo", "epiplón", "mesenterio",
            # Patología
            "congestivo", "edematoso", "antracosis",
            "atelectasia", "enfisema", "hemorragia",
            "hemorragia subaracnoidea", "hematoma subdural",
        ]
    
    def _get_forensic_prompt(self) -> str:
        """Retorna prompt para Whisper con vocabulario forense."""
        return """
        Transcripción de autopsia médico-legal en español peruano.
        Términos frecuentes: livideces, rigidez cadavérica, esquimosis,
        cianosis, petequias, herida contusa, herida cortante, proyectil,
        orificio de entrada, orificio de salida, trayectoria, antracosis,
        congestión pulmonar, edema cerebral, hemorragia subaracnoidea.
        """
