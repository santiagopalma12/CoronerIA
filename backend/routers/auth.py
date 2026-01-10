"""
Router de autenticación.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import bcrypt
import secrets
from datetime import datetime, timedelta
import aiosqlite

from core.database import get_db
from core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user_id: str
    username: str
    full_name: str
    role: str
    expires_at: str


class CreateUserRequest(BaseModel):
    username: str
    password: str
    full_name: str
    role: str = "medico"


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    """Autenticar usuario."""
    
    cursor = await db.execute(
        "SELECT id, password_hash, full_name, role FROM users WHERE username = ?",
        (request.username,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    user_id, password_hash, full_name, role = row
    
    if not bcrypt.checkpw(request.password.encode(), password_hash.encode()):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Crear sesión
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    await db.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_at.isoformat())
    )
    await db.execute(
        "UPDATE users SET last_login = ? WHERE id = ?",
        (datetime.now().isoformat(), user_id)
    )
    await db.commit()
    
    return LoginResponse(
        token=token,
        user_id=user_id,
        username=request.username,
        full_name=full_name or "",
        role=role,
        expires_at=expires_at.isoformat()
    )


@router.post("/register")
async def register(request: CreateUserRequest, db: aiosqlite.Connection = Depends(get_db)):
    """Registrar nuevo usuario (para desarrollo)."""
    
    # Verificar si existe
    cursor = await db.execute(
        "SELECT id FROM users WHERE username = ?",
        (request.username,)
    )
    if await cursor.fetchone():
        raise HTTPException(status_code=400, detail="Usuario ya existe")
    
    # Crear usuario
    password_hash = bcrypt.hashpw(
        request.password.encode(),
        bcrypt.gensalt()
    ).decode()
    
    user_id = secrets.token_hex(16)
    
    await db.execute(
        """INSERT INTO users (id, username, password_hash, full_name, role)
           VALUES (?, ?, ?, ?, ?)""",
        (user_id, request.username, password_hash, request.full_name, request.role)
    )
    await db.commit()
    
    return {"user_id": user_id, "message": "Usuario creado exitosamente"}


@router.get("/me")
async def get_current_user(token: str, db: aiosqlite.Connection = Depends(get_db)):
    """Obtener usuario actual por token."""
    
    cursor = await db.execute(
        """SELECT s.user_id, s.expires_at, u.username, u.full_name, u.role
           FROM sessions s
           JOIN users u ON s.user_id = u.id
           WHERE s.token = ?""",
        (token,)
    )
    row = await cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user_id, expires_at, username, full_name, role = row
    
    if datetime.fromisoformat(expires_at) < datetime.now():
        raise HTTPException(status_code=401, detail="Token expirado")
    
    return {
        "user_id": user_id,
        "username": username,
        "full_name": full_name,
        "role": role
    }


@router.post("/logout")
async def logout(token: str, db: aiosqlite.Connection = Depends(get_db)):
    """Cerrar sesión."""
    
    await db.execute("DELETE FROM sessions WHERE token = ?", (token,))
    await db.commit()
    
    return {"message": "Sesión cerrada"}
