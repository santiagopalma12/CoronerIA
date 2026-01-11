<div align="center">
  <img src="frontend/public/icon.ico" alt="CoronerIA Logo" width="120" />
  <h1>CoronerIA</h1>
  <h3>The AI-Powered Forensic Associate</h3>
  <p>
    <em>Digitizing the scientific truth to accelerate justice in Latin America.</em>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Azure_AI-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white" alt="Azure" />
    <img src="https://img.shields.io/badge/OpenAI_GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React_Edge-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

<br />

## 🚨 The Emergency
Latin America is facing a **forensic humanitarian crisis**.
- **Mexico:** Over **52,000+** unidentified bodies accumulated in morgues.
- **Peru:** A structural deficit of **15,000** forensic specialists.
- **Colombia:** **700+** municipalities lack permanent forensic coverage.

The bottleneck isn't just medical; it's administrative. Pathologists spend **40% of their time** manually transcribing notes, leading to months of delays in justice delivery and "administrative disappearances" of bodies.

## ⚡ The Solution
**CoronerIA** is a specialized AI Copilot designed for the high-stakes environment of the autopsy room.

- **Hands-Free Operation:** Real-time medicaldictation using **Azure AI Speech**.
- **Cognitive Structuring:** Automatically transforms unstructured voice into legally valid JSON protocols (Minnesota & Ibrahim Standards) using **Azure OpenAI (GPT-4)**.
- **Hybrid Architecture:** Runs 100% offline for rural connectivity (Edge Mode) with optional Cloud synchronization for heavy inference.

## 🏗️ Technical Architecture
CoronerIA implements a **Strategy Pattern** to dynamically switch between Cloud (Azure) and Edge (Local) inferencing based on resource availability.

| Component | Tech Stack | Role |
|-----------|------------|------|
| **Core AI** | `Azure OpenAI Service` | Named Entity Recognition (NER) & Legal Structuring |
| **Voice** | `Azure AI Speech` / `Whisper v3` | High-fidelity medical transcription in Spanish |
| **Backend** | `Python FastAPI` | Async orchestration and Protocol mapping |
| **Frontend** | `React + Vite + Electron` | Cyber-security aesthetic & Local hardware access |
| **Persistence** | `SQLite / PostgreSQL` | Encrypted local storage with FHIR compatibility |

## 🚀 Quick Start (Docker)
The entire system is containerized for immediate deployment on forensic workstations.

```bash
# 1. Clone the repository
git clone https://github.com/santiagopalma12/CoronerIA.git
cd CoronerIA

# 2. Configure Environment (Add your Azure Keys)
cp .env.example .env

# 3. Launch the System
docker-compose up --build
```

## 🔒 Security & Compliance
- **Data Sovereignty:** No patient data leaves the local network in Edge Mode.
- **Chain of Custody:** Immutable logs for every transcription event.
- **ISO Standards:** Aligned with **ISO 27001** for information security.

---

<div align="center">
  <sub><strong>Imagine Cup 2026 Submission</strong> • Team CoronerIA</sub>
</div>
