"""
Servicio de generación de documentos.
Genera PDF (formato IMLCF), FHIR DiagnosticReport, y CSV.
"""

import os
import json
import csv
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
from uuid import uuid4

from core.config import settings
from services.storage_service import StorageService

# Crear directorio de exports
EXPORTS_DIR = Path(settings.CORONERIA_EXPORTS)
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)


class DocumentService:
    """Servicio de generación de documentos."""
    
    def __init__(self):
        self.storage_service = StorageService()
    
    async def generate_pdf(self, case_id: str, case_data: Dict[str, Any]) -> str:
        """Genera PDF en formato IMLCF."""
        
        html_content = self._build_html(case_data)
        
        # Usar WeasyPrint
        from weasyprint import HTML
        
        filename = f"protocolo_{case_id[:8]}_{datetime.now().strftime('%Y%m%d')}.pdf"
        pdf_path = EXPORTS_DIR / filename
        
        HTML(string=html_content).write_pdf(str(pdf_path))
        
        # --- FASE 2: BACKUP AUTOMÁTICO (Simulado o Real) ---
        # Subir el PDF generado al bucket de "informes-finales"
        cloud_url = await self.storage_service.upload_file(
            file_path=str(pdf_path),
            container_name="informes-finales",
            blob_name=filename
        )
        
        return str(pdf_path)
    
    def _build_html(self, data: Dict) -> str:
        """Construye HTML del protocolo IMLCF."""
        
        admin = data.get('datos_administrativos', {})
        signs = data.get('fenomenos_cadavericos', {})
        external = data.get('examen_externo', {})
        internal = data.get('examen_interno', {})
        lesions = data.get('lesiones_traumaticas', {})
        concl = data.get('conclusiones', {})
        
        return f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{ size: A4; margin: 2cm; }}
                body {{ font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; }}
                .header {{ text-align: center; margin-bottom: 20px; }}
                .header h1 {{ font-size: 14pt; margin: 0; }}
                .header h2 {{ font-size: 12pt; font-weight: normal; margin: 5px 0; }}
                .section {{ margin-bottom: 15px; }}
                .section-title {{ font-weight: bold; font-size: 12pt; border-bottom: 1px solid #000; margin-bottom: 10px; }}
                .field {{ margin-bottom: 8px; }}
                .field-label {{ font-weight: bold; }}
                table {{ width: 100%; border-collapse: collapse; margin: 10px 0; }}
                td, th {{ border: 1px solid #000; padding: 5px; text-align: left; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MINISTERIO PÚBLICO</h1>
                <h2>INSTITUTO DE MEDICINA LEGAL Y CIENCIAS FORENSES</h2>
                <h1>PROTOCOLO DE NECROPSIA Nº {admin.get('protocolo_numero', '')}</h1>
            </div>

            <div class="section">
                <div class="section-title">I. DATOS ADMINISTRATIVOS</div>
                <table>
                    <tr>
                        <td><strong>Nombre:</strong> {admin.get('nombre_fallecido', 'NN')}</td>
                        <td><strong>Edad:</strong> {admin.get('edad', '')}</td>
                        <td><strong>Sexo:</strong> {admin.get('sexo', '')}</td>
                    </tr>
                    <tr>
                        <td colspan="3"><strong>Fecha:</strong> {admin.get('fecha_necropsia', '')}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">II. FENÓMENOS CADAVÉRICOS</div>
                <div class="field">
                    <span class="field-label">Livideces:</span> {signs.get('campo_25_livideces', '')}
                </div>
                <div class="field">
                    <span class="field-label">Rigidez:</span> {signs.get('campo_26_rigidez', '')}
                </div>
                <div class="field">
                    <span class="field-label">Tiempo Aprox. Muerte:</span> {signs.get('campo_33_tiempo_muerte', '')}
                </div>
            </div>

            <div class="section">
                <div class="section-title">III. EXAMEN EXTERNO</div>
                <table>
                    <tr>
                        <td><strong>Talla:</strong> {external.get('campo_36_talla', '')} cm</td>
                        <td><strong>Peso:</strong> {external.get('campo_37_peso', '')} kg</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">IV. EXAMEN INTERNO</div>
                <div class="field">
                    <span class="field-label">Pulmón Derecho:</span> 
                    {internal.get('campo_60_pulmon_derecho', '')}
                    (Peso: {internal.get('peso_pulmon_derecho', '')}g)
                </div>
                <div class="field">
                    <span class="field-label">Pulmón Izquierdo:</span> 
                    {internal.get('campo_61_pulmon_izquierdo', '')}
                    (Peso: {internal.get('peso_pulmon_izquierdo', '')}g)
                </div>
                <div class="field">
                    <span class="field-label">Corazón:</span> 
                    {internal.get('campo_63_corazon', '')}
                    (Peso: {internal.get('peso_corazon', '')}g)
                </div>
                <div class="field">
                    <span class="field-label">Hígado:</span> 
                    {internal.get('campo_72_higado', '')}
                    (Peso: {internal.get('peso_higado', '')}g)
                </div>
            </div>

            <div class="section">
                <div class="section-title">V. CONCLUSIONES</div>
                <div class="field">
                    <span class="field-label">Causa de Muerte:</span>
                    {concl.get('causa_final', '')}
                </div>
                <div class="field">
                    <span class="field-label">Código CIE-10:</span>
                    {concl.get('codigo_cie10', '')}
                </div>
            </div>

            <div style="margin-top: 50px; text-align: center;">
                <div style="width: 200px; border-top: 1px solid #000; margin: 0 auto; padding-top: 5px;">
                    Firma del Médico Legista
                </div>
            </div>
        </body>
        </html>
        """
    
    async def generate_fhir(self, case_id: str, case_data: Dict[str, Any]) -> Dict:
        """Genera FHIR DiagnosticReport R4."""
        
        admin = case_data.get('datos_administrativos', {})
        concl = case_data.get('conclusiones', {})
        
        return {
            "resourceType": "DiagnosticReport",
            "id": case_id,
            "meta": {
                "profile": ["http://hl7.org/fhir/StructureDefinition/DiagnosticReport"]
            },
            "status": "final",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0074",
                    "code": "PAT",
                    "display": "Pathology"
                }]
            }],
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "18743-5",
                    "display": "Autopsy report"
                }],
                "text": "Protocolo de Necropsia"
            },
            "subject": {
                "display": admin.get('nombre_fallecido', 'NN')
            },
            "effectiveDateTime": admin.get('fecha_necropsia', datetime.now().isoformat()),
            "issued": datetime.now().isoformat(),
            "conclusion": concl.get('causa_final', ''),
            "conclusionCode": [{
                "coding": [{
                    "system": "http://hl7.org/fhir/sid/icd-10",
                    "code": concl.get('codigo_cie10', '')
                }]
            }] if concl.get('codigo_cie10') else []
        }
    
    async def generate_csv(self, case_id: str, case_data: Dict[str, Any]) -> str:
        """Genera CSV para importación a Forensys."""
        
        admin = case_data.get('datos_administrativos', {})
        external = case_data.get('examen_externo', {})
        concl = case_data.get('conclusiones', {})
        
        filename = f"protocolo_{case_id[:8]}_{datetime.now().strftime('%Y%m%d')}.csv"
        csv_path = EXPORTS_DIR / filename
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Headers
            writer.writerow([
                'protocolo_numero',
                'fecha_necropsia',
                'nombre_fallecido',
                'edad',
                'sexo',
                'talla',
                'peso',
                'causa_final',
                'causa_basica',
                'codigo_cie10'
            ])
            
            # Data
            writer.writerow([
                admin.get('protocolo_numero', ''),
                admin.get('fecha_necropsia', ''),
                admin.get('nombre_fallecido', 'NN'),
                admin.get('edad', ''),
                admin.get('sexo', ''),
                external.get('campo_36_talla', ''),
                external.get('campo_37_peso', ''),
                concl.get('causa_final', ''),
                concl.get('causa_basica', ''),
                concl.get('codigo_cie10', '')
            ])
        
        return str(csv_path)
