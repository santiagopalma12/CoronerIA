# ForensIA Backend
# Asistente de IA para Documentación Médico-Legal

## Requisitos
- Python 3.11+
- NVIDIA GPU con CUDA (para modo Edge)
- Cuentas Azure (Speech, OpenAI, Document Intelligence)

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
copy .env.example .env
# Editar .env con tus claves Azure
```

4. Ejecutar:
```bash
uvicorn main:app --reload
```

## Estructura
```
backend/
├── main.py              # Entrada FastAPI
├── routers/             # Endpoints API
├── services/            # Lógica de negocio
├── models/              # Modelos Pydantic
├── core/                # Config, DB, Auth
└── utils/               # Utilidades
```
