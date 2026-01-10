"""
Configuración de base de datos SQLite con aiosqlite.
"""

import aiosqlite
import os
from pathlib import Path
from core.config import settings


DATABASE_PATH = Path(settings.CORONERIA_DATA) / "forensia.db"


async def get_db():
    """Obtiene conexión a la base de datos."""
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    """Inicializa las tablas de la base de datos."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Tabla de usuarios
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                role TEXT DEFAULT 'medico',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        """)
        
        # Tabla de casos - Protocolo de Necropsia v2.0
        await db.execute("""
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                protocol_number TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                status TEXT DEFAULT 'borrador',
                user_id TEXT,
                
                -- Secciones del protocolo (JSON)
                datos_generales TEXT,
                fenomenos_cadavericos TEXT,
                examen_externo_cabeza TEXT,
                examen_interno_cabeza TEXT,
                examen_interno_cuello TEXT,
                examen_interno_torax TEXT,
                examen_interno_abdomen TEXT,
                aparato_genital TEXT,
                lesiones_traumaticas TEXT,
                perennizacion TEXT,
                datos_referenciales TEXT,
                causas_muerte TEXT,
                organos_adicionales TEXT,
                
                -- Compatibilidad con v1 (deprecated)
                datos_administrativos TEXT,
                examen_externo TEXT,
                examen_interno TEXT,
                conclusiones TEXT,
                
                -- Auditoría
                audio_path TEXT,
                transcript_raw TEXT,
                hash_audio TEXT,
                hash_transcript TEXT,
                hash_caso TEXT,
                
                -- Exportación
                exported_pdf_path TEXT,
                exported_at TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Tabla de auditoría
        await db.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                resource_type TEXT NOT NULL,
                resource_id TEXT NOT NULL,
                details TEXT,
                hash_before TEXT,
                hash_after TEXT,
                device_id TEXT
            )
        """)
        
        # Tabla de sesiones
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Índices
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status)
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id)
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_audit_resource 
            ON audit_log(resource_type, resource_id)
        """)
        
        await db.commit()
        print("✅ Base de datos inicializada")
