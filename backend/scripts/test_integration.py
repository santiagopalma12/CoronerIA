import asyncio
import sys
import os
import json
from pathlib import Path

# Setup path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings
from services.ner_service import NERService
from services.document_service import DocumentService

async def test_integration():
    print("[TEST] Iniciando prueba de integracion Hibrida")
    print(f"   Modo Cloud Backup: {settings.ENABLE_CLOUD_BACKUP}")
    print(f"   Modo Diccionario: {settings.ENABLE_MEDICAL_DICTIONARY}")

    # 1. Prueba de NER + Validacion
    print("\n--- 1. Probando NER + Validacion ---")
    ner_service = NERService()
    
    # Texto simulado con error biologico intencional (higado 5g)
    dummy_text = """
    Paciente masculino de 45 anios.
    Examen interno: Higado de color pardo con peso de 5 gramos. 
    Corazon de 350 gramos.
    Causa de muerte: Infarto agudo.
    """
    
    # Simular extraccion (usando modo local o mock si no hay API key)
    # Para asegurar validacion, inyectamos un resultado simulado si no hay API
    mock_result = {
        "entities": [],
        "mapped_fields": {
            "datos_generales.fallecido.sexo": "M", # Campo requerido
            "examen_interno_abdomen.higado.peso": 5, # ERROR !!!
            "examen_interno_torax.corazon.peso": 350 # Normal
        }
    }
    
    # Validamos manualmente para probar el servicio
    print("   Validando datos simulados...")
    validation_service = ner_service._validation_service
    warnings = validation_service.validate_case(mock_result)
    
    if warnings:
        print(f"[OK] Validacion funciono. Advertencias detectadas ({len(warnings)}):")
        for w in warnings:
            print(f"   [!] {w}")
    else:
        print("[FAIL] No se detectaron advertencias en dato erroneo.")

    # 2. Prueba de Generacion PDF + Backup Simulado
    print("\n--- 2. Probando PDF + Backup ---")
    doc_service = DocumentService()
    
    # Datos minimos para PDF
    case_data = {
        "datos_administrativos": {"protocolo_numero": "TEST-INT-001", "nombre_fallecido": "Juan Test"},
        "fenomenos_cadavericos": {},
        "examen_externo": {},
        "examen_interno": {"campo_72_higado": "Higado de prueba", "peso_higado": 5},
        "conclusiones": {"causa_final": "Prueba de Integracion"}
    }
    
    try:
        pdf_path = await doc_service.generate_pdf("case_test_123", case_data)
        print(f"[OK] PDF Generado: {pdf_path}")
        print("   (Revisar logs anteriores para confirmar 'SIMULACION' de subida)")
    except Exception as e:
        print(f"[FAIL] Error generando PDF/Backup: {e}")

    print("\n[TEST] Prueba de integracion completada.")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_integration())
