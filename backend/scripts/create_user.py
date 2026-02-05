import asyncio
import sys
import os
import bcrypt
import secrets

# Configurar path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import get_db

async def create_default_user():
    username = "doctor.legista"
    password = "demo123"
    full_name = "Dr. Santiago Palma"
    
    print(f"Creating user: {username}")
    
    password_hash = bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    ).decode()
    
    user_id = secrets.token_hex(16)
    
    try:
        async for db in get_db():
            # Check if exists
            cursor = await db.execute("SELECT id FROM users WHERE username = ?", (username,))
            if await cursor.fetchone():
                print(f"[INFO] User {username} already exists.")
                # Update password just in case
                await db.execute(
                    "UPDATE users SET password_hash = ? WHERE username = ?",
                    (password_hash, username)
                )
                await db.commit()
                print(f"[OK] Password updated for {username}")
                return

            await db.execute(
                """INSERT INTO users (id, username, password_hash, full_name, role)
                   VALUES (?, ?, ?, ?, ?)""",
                (user_id, username, password_hash, full_name, "medico")
            )
            await db.commit()
            print(f"[SUCCESS] User created: {username} / {password}")
            break
            
    except Exception as e:
        print(f"[ERROR] {e}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(create_default_user())
