"""
Router de casos - CRUD de protocolos de necropsia v2.0
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
import secrets
import json
import aiosqlite

from core.database import get_db

router = APIRouter(prefix="/api/cases", tags=["cases"])


# ============================================
# SECCIONES DEL PROTOCOLO v2.0
# ============================================

PROTOCOL_SECTIONS = [
    'datos_generales',
    'fenomenos_cadavericos',
    'examen_externo_cabeza',
    'examen_interno_cabeza',
    'examen_interno_cuello',
    'examen_interno_torax',
    'examen_interno_abdomen',
    'aparato_genital',
    'lesiones_traumaticas',
    'perennizacion',
    'datos_referenciales',
    'causas_muerte',
    'organos_adicionales',
]

# Compatibilidad v1
LEGACY_SECTIONS = [
    'datos_administrativos',
    'examen_externo',
    'examen_interno',
    'conclusiones',
]


# ============================================
# MODELOS
# ============================================

class CaseCreate(BaseModel):
    protocol_number: Optional[str] = None
    datos_generales: Optional[Dict] = None


class CaseUpdate(BaseModel):
    # v2.0 sections
    datos_generales: Optional[Dict] = None
    fenomenos_cadavericos: Optional[Dict] = None
    examen_externo_cabeza: Optional[Dict] = None
    examen_interno_cabeza: Optional[Dict] = None
    examen_interno_cuello: Optional[Dict] = None
    examen_interno_torax: Optional[Dict] = None
    examen_interno_abdomen: Optional[Dict] = None
    aparato_genital: Optional[Dict] = None
    lesiones_traumaticas: Optional[Dict] = None
    perennizacion: Optional[Dict] = None
    datos_referenciales: Optional[Dict] = None
    causas_muerte: Optional[Dict] = None
    organos_adicionales: Optional[Dict] = None
    
    # Legacy v1 (compatibilidad)
    datos_administrativos: Optional[Dict] = None
    examen_externo: Optional[Dict] = None
    examen_interno: Optional[Dict] = None
    conclusiones: Optional[Dict] = None


class CaseResponse(BaseModel):
    id: str
    protocol_number: Optional[str]
    status: str
    created_at: str
    updated_at: Optional[str]


# ============================================
# ENDPOINTS
# ============================================

@router.get("", response_model=List[CaseResponse])
async def list_cases(
    status: Optional[str] = None,
    limit: int = 50,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Lista todos los casos."""
    
    if status:
        query = "SELECT id, protocol_number, status, created_at, updated_at FROM cases WHERE status = ? AND status != 'deleted' ORDER BY created_at DESC LIMIT ?"
        cursor = await db.execute(query, (status, limit))
    else:
        query = "SELECT id, protocol_number, status, created_at, updated_at FROM cases WHERE status != 'deleted' ORDER BY created_at DESC LIMIT ?"
        cursor = await db.execute(query, (limit,))
    
    rows = await cursor.fetchall()
    
    return [
        CaseResponse(
            id=row[0],
            protocol_number=row[1],
            status=row[2],
            created_at=row[3],
            updated_at=row[4]
        )
        for row in rows
    ]


@router.post("", response_model=CaseResponse)
async def create_case(
    case: CaseCreate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Crea un nuevo caso."""
    
    case_id = secrets.token_hex(16)
    now = datetime.now().isoformat()
    
    await db.execute(
        """INSERT INTO cases (id, protocol_number, created_at, updated_at, status, datos_generales)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            case_id,
            case.protocol_number,
            now,
            now,
            "borrador",
            json.dumps(case.datos_generales) if case.datos_generales else None
        )
    )
    await db.commit()
    
    return CaseResponse(
        id=case_id,
        protocol_number=case.protocol_number,
        status="borrador",
        created_at=now,
        updated_at=now
    )


@router.get("/{case_id}")
async def get_case(case_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Obtiene un caso completo con todas las secciones."""
    
    # Construir SELECT con todas las secciones
    all_sections = PROTOCOL_SECTIONS + LEGACY_SECTIONS
    sections_sql = ', '.join(all_sections)
    
    cursor = await db.execute(
        f"""SELECT id, protocol_number, status, created_at, updated_at,
                  {sections_sql},
                  audio_path, transcript_raw, hash_caso
           FROM cases WHERE id = ?""",
        (case_id,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    # Construir respuesta
    result = {
        "id": row[0],
        "protocol_number": row[1],
        "status": row[2],
        "created_at": row[3],
        "updated_at": row[4],
    }
    
    # Parsear secciones JSON
    idx = 5
    for section in all_sections:
        result[section] = json.loads(row[idx]) if row[idx] else {}
        idx += 1
    
    result["audio_path"] = row[idx]
    result["transcript_raw"] = row[idx + 1]
    result["hash_caso"] = row[idx + 2]
    
    return result


@router.patch("/{case_id}")
async def update_case(
    case_id: str,
    update: CaseUpdate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Actualiza campos de un caso."""
    
    # Verificar que existe
    cursor = await db.execute("SELECT id FROM cases WHERE id = ?", (case_id,))
    if not await cursor.fetchone():
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    now = datetime.now().isoformat()
    updates = ["updated_at = ?"]
    values = [now]
    
    # Actualizar todas las secciones que vengan en el request
    update_dict = update.model_dump(exclude_unset=True)
    
    for section in PROTOCOL_SECTIONS + LEGACY_SECTIONS:
        if section in update_dict and update_dict[section] is not None:
            updates.append(f"{section} = ?")
            values.append(json.dumps(update_dict[section]))
    
    values.append(case_id)
    
    query = f"UPDATE cases SET {', '.join(updates)} WHERE id = ?"
    await db.execute(query, values)
    await db.commit()
    
    return {"message": "Caso actualizado", "updated_at": now}


@router.delete("/{case_id}")
async def delete_case(case_id: str, db: aiosqlite.Connection = Depends(get_db)):
    """Elimina un caso (soft delete)."""
    
    await db.execute(
        "UPDATE cases SET status = 'deleted', updated_at = ? WHERE id = ?",
        (datetime.now().isoformat(), case_id)
    )
    await db.commit()
    
    return {"message": "Caso eliminado"}


@router.patch("/{case_id}/status")
async def update_case_status(
    case_id: str,
    status: str,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Actualiza el status de un caso."""
    
    valid_statuses = ['borrador', 'en_proceso', 'completado', 'firmado', 'deleted']
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status inválido. Debe ser uno de: {valid_statuses}")
    
    await db.execute(
        "UPDATE cases SET status = ?, updated_at = ? WHERE id = ?",
        (status, datetime.now().isoformat(), case_id)
    )
    await db.commit()
    
    return {"message": f"Status actualizado a {status}"}
