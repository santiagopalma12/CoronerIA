"""
Router de transcripción - Azure Speech y Whisper Local
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging

from services.speech_service import SpeechService

router = APIRouter(prefix="/api/transcription", tags=["transcription"])
logger = logging.getLogger(__name__)

# Servicio de speech (singleton)
speech_service = SpeechService()


class TranscribeRequest(BaseModel):
    audio_path: str


@router.get("/mode")
async def get_mode():
    """Obtiene el modo actual de reconocimiento (azure/edge)."""
    return {
        "mode": speech_service.get_current_mode(),
        "azure_available": speech_service.is_azure_available()
    }


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe un archivo de audio."""
    
    try:
        # Guardar archivo temporal
        import tempfile
        import os
        
        # Detectar extensión correcta basada en content_type
        ext = ".webm" if file.content_type == "audio/webm" else ".wav"
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Convertir webm a WAV si es necesario (Gemini no soporta webm/Opus de Chrome)
        final_path = tmp_path
        if ext == ".webm":
            import subprocess
            wav_path = tmp_path.replace(".webm", ".wav")
            try:
                logger.info(f"🔄 Convirtiendo {tmp_path} a WAV...")
                result = subprocess.run([
                    "ffmpeg", "-y", "-i", tmp_path,
                    "-acodec", "pcm_s16le",
                    "-ar", "16000",
                    "-ac", "1",
                    wav_path
                ], capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    logger.info(f"✅ Conversión exitosa: {wav_path}")
                    os.unlink(tmp_path)  # Eliminar webm original
                    final_path = wav_path
                else:
                    logger.error(f"❌ FFmpeg error: {result.stderr}")
            except Exception as conv_err:
                logger.error(f"❌ Error en conversión: {conv_err}")
        
        # Remover silencios del audio (necropsias pueden tener muchas pausas)
        if final_path.endswith(".wav"):
            import subprocess
            processed_path = final_path.replace(".wav", "_processed.wav")
            try:
                logger.info(f"🔇 Removiendo silencios de {final_path}...")
                result = subprocess.run([
                    "ffmpeg", "-y", "-i", final_path,
                    "-af", "silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-40dB",
                    "-ar", "16000", "-ac", "1",
                    processed_path
                ], capture_output=True, text=True, timeout=60)
                
                if result.returncode == 0:
                    # Comparar tamaños
                    original_size = os.path.getsize(final_path)
                    processed_size = os.path.getsize(processed_path)
                    reduction = (1 - processed_size / original_size) * 100 if original_size > 0 else 0
                    logger.info(f"✅ Silencios removidos: {reduction:.1f}% reducción")
                    os.unlink(final_path)  # Eliminar original
                    final_path = processed_path
                else:
                    logger.warning(f"⚠️ No se pudieron remover silencios: {result.stderr}")
            except Exception as proc_err:
                logger.warning(f"⚠️ Error removiendo silencios: {proc_err}")
        
        # Transcribir
        text = await speech_service.transcribe_file(final_path)
        
        # Limpiar
        os.unlink(final_path)
        
        return {
            "text": text,
            "mode": speech_service.get_current_mode()
        }
        
    except Exception as e:
        logger.error(f"Error en transcripción: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket para transcripción en tiempo real."""
    
    await websocket.accept()
    logger.info("Cliente WebSocket conectado")
    
    try:
        # Callbacks para enviar al cliente
        async def on_partial(text: str):
            await websocket.send_json({
                "type": "partial",
                "text": text
            })
        
        async def on_final(text: str):
            await websocket.send_json({
                "type": "final",
                "text": text
            })
        
        async def on_error(error: str):
            await websocket.send_json({
                "type": "error",
                "message": error
            })
        
        # Iniciar reconocimiento
        await speech_service.start_streaming(
            on_partial=on_partial,
            on_final=on_final,
            on_error=on_error
        )
        
        # Mantener conexión y escuchar comandos
        while True:
            data = await websocket.receive_text()
            
            if data == "stop":
                await speech_service.stop_streaming()
                break
            elif data == "pause":
                await speech_service.pause_streaming()
            elif data == "resume":
                await speech_service.resume_streaming()
                
    except WebSocketDisconnect:
        logger.info("Cliente WebSocket desconectado")
    except Exception as e:
        logger.error(f"Error en WebSocket: {e}")
    finally:
        await speech_service.stop_streaming()
