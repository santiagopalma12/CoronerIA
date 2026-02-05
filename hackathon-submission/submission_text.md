# CoronerIA: Forensic AI Assistant Powered by Gemini 3

**CoronerIA** is a specialized AI assistant designed to accelerate forensic autopsies and democratize access to high-quality legal medicine in resource-constrained regions. By combining real-time voice dictation with advanced clinical reasoning, we reduce the time from "body on table" to "final report" by up to 70%.

## How we use Gemini 3
We implemented a **Hybrid AI Architecture** to balance speed and depth:
1.  **Speed (Gemini 2.0 Flash-Lite):** Handles high-frequency, low-latency tasks like real-time audio transcription and basic entity extraction (filling forms from voice).
2.  **Reasoning (Gemini 3 Flash-Preview):** Acts as a "Senior Medical Examiner". It analyzes the entire case context—traumatic injuries, organ damage, and histology—to deductively reason the distinct **Final, Intermediate, and Basic Causes of Death**.

This approach allows us to offer a tool that is both incredibly fast for data entry and clinically profound for diagnosis, solving the critical shortage of forensic experts in developing nations.

**Tech Stack:** Python (FastAPI), React, Docker, Google Gemini API.
