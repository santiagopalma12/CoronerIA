import os
import logging
from datetime import datetime
from pathlib import Path
from core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    """
    Servicio de almacenamiento seguro en la nube (Azure Blob Storage).
    
    FEATURE FLAG:
    - Si ENABLE_CLOUD_BACKUP = False, actúa en modo "Simulación" (solo logs).
    - Si ENABLE_CLOUD_BACKUP = True, intenta subir a Azure.
    """
    
    def __init__(self):
        self.enabled = settings.ENABLE_CLOUD_BACKUP
        self.connection_string = settings.AZURE_STORAGE_CONNECTION_STRING
        self.blob_service_client = None
        
        if self.enabled:
            try:
                from azure.storage.blob import BlobServiceClient
                if self.connection_string:
                    self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
                    logger.info("☁️ Azure Blob Storage inicializado correctamente")
                else:
                    logger.warning("⚠️ Azure Storage habilitado pero sin Connection String")
            except Exception as e:
                logger.error(f"❌ Error inicializando Azure Storage: {e}")
        else:
            logger.info("🛡️ Azure Storage deshabilitado (Modo Offline/Ahorro)")

    async def upload_file(self, file_path: str, container_name: str, blob_name: str = None) -> str:
        """
        Sube un archivo a la nube (o simula la subida).
        
        Retorna: URL del archivo (simulada o real).
        """
        path = Path(file_path)
        if not path.exists():
            logger.error(f"❌ Archivo no encontrado para backup: {file_path}")
            return ""

        if not blob_name:
            blob_name = path.name

        # --- MODO SIMULACIÓN ---
        if not self.enabled or not self.blob_service_client:
            logger.info(f"💾 [SIMULACIÓN] Backup de evidencia: {blob_name} -> Container: {container_name}")
            return f"local://simulated_cloud/{container_name}/{blob_name}"

        # --- MODO REAL ---
        try:
            logger.info(f"☁️ Subiendo evidencia real: {blob_name}...")
            
            # Crear contenedor si no existe
            container_client = self.blob_service_client.get_container_client(container_name)
            if not container_client.exists():
                container_client.create_container()

            blob_client = container_client.get_blob_client(blob_name)
            
            with open(path, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
            
            url = blob_client.url
            logger.info(f"✅ Backup exitoso en Azure: {url}")
            return url

        except Exception as e:
            logger.error(f"❌ Error subiendo a Azure: {e}")
            return ""
