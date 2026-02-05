import asyncio
import sys
import os
from pathlib import Path

# Agregar el directorio padre al path para poder importar core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import init_db, get_db
from core.config import settings

async def test_database():
    print(f"[INFO] Probando conexion a BD en: {settings.CORONERIA_DATA}")
    
    # 1. Probar inicialización
    try:
        await init_db()
        print("[OK] init_db() ejecutado correctamente")
    except Exception as e:
        print(f"[ERROR] en init_db(): {e}")
        return

    # 2. Probar escritura
    try:
        async for db in get_db():
            # Crear un caso de prueba
            case_id = "test_case_diag_" + os.urandom(4).hex()
            print(f"[INFO] Intentando crear caso de prueba: {case_id}")
            
            await db.execute(
                "INSERT INTO cases (id, protocol_number, status, datos_generales) VALUES (?, ?, ?, ?)",
                (case_id, "TEST-001", "borrador", '{"test": true}')
            )
            await db.commit()
            print("[OK] Caso insertado correctamente")
            
            # 3. Probar lectura
            cursor = await db.execute("SELECT id, protocol_number FROM cases WHERE id = ?", (case_id,))
            row = await cursor.fetchone()
            
            if row:
                print(f"[OK] Caso recuperado: ID={row[0]}, Protocolo={row[1]}")
            else:
                print("[ERROR] No se pudo recuperar el caso insertado")
                
            # Limpieza (opcional, para no ensuciar)
            await db.execute("DELETE FROM cases WHERE id = ?", (case_id,))
            await db.commit()
            print("[OK] Caso de prueba eliminado")
            break
            
    except Exception as e:
        print(f"[ERROR] durante operaciones CRUD: {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_database())
