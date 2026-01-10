"""
Router de exportación - PDF, FHIR, CSV
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any
import json
import aiosqlite

from core.database import get_db
from services.document_service import DocumentService

router = APIRouter(prefix="/api/export", tags=["export"])

document_service = DocumentService()


class ExportRequest(BaseModel):
    case_id: str


@router.post("/pdf")
async def export_pdf(
    request: ExportRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Exporta caso a PDF formato IMLCF."""
    
    # Obtener datos del caso
    cursor = await db.execute(
        """SELECT datos_administrativos, fenomenos_cadavericos, examen_externo,
                  examen_interno, lesiones_traumaticas, conclusiones
           FROM cases WHERE id = ?""",
        (request.case_id,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    case_data = {
        "datos_administrativos": json.loads(row[0]) if row[0] else {},
        "fenomenos_cadavericos": json.loads(row[1]) if row[1] else {},
        "examen_externo": json.loads(row[2]) if row[2] else {},
        "examen_interno": json.loads(row[3]) if row[3] else {},
        "lesiones_traumaticas": json.loads(row[4]) if row[4] else {},
        "conclusiones": json.loads(row[5]) if row[5] else {},
    }
    
    # Generar PDF
    pdf_path = await document_service.generate_pdf(request.case_id, case_data)
    
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"protocolo_{request.case_id[:8]}.pdf"
    )


@router.post("/fhir")
async def export_fhir(
    request: ExportRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Exporta caso a FHIR DiagnosticReport."""
    
    cursor = await db.execute(
        """SELECT datos_administrativos, fenomenos_cadavericos, examen_externo,
                  examen_interno, lesiones_traumaticas, conclusiones
           FROM cases WHERE id = ?""",
        (request.case_id,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    case_data = {
        "datos_administrativos": json.loads(row[0]) if row[0] else {},
        "conclusiones": json.loads(row[5]) if row[5] else {},
    }
    
    fhir_document = await document_service.generate_fhir(request.case_id, case_data)
    
    return fhir_document


@router.post("/csv")
async def export_csv(
    request: ExportRequest,
    db: aiosqlite.Connection = Depends(get_db)
):
    """Exporta caso a CSV para Forensys."""
    
    cursor = await db.execute(
        """SELECT datos_administrativos, examen_externo, conclusiones
           FROM cases WHERE id = ?""",
        (request.case_id,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    case_data = {
        "datos_administrativos": json.loads(row[0]) if row[0] else {},
        "examen_externo": json.loads(row[1]) if row[1] else {},
        "conclusiones": json.loads(row[2]) if row[2] else {},
    }
    
    csv_path = await document_service.generate_csv(request.case_id, case_data)
    
    return FileResponse(
        csv_path,
        media_type="text/csv",
        filename=f"protocolo_{request.case_id[:8]}.csv"
    )
