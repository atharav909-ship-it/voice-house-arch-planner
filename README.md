# 🏛️ Voice-Driven Architectural House Layout Planner

A full-stack, voice-enabled bioclimatic architectural planning web application powered by **FastAPI**, **Tailwind CSS**, and **Sarvam AI APIs** (`saaras:v4` Speech-to-Text & `sarvam-105b-conversations` LLM).

---

## ✨ Features

- **🎙️ Voice-to-Architecture Input**:
  - Live in-browser microphone recording via the `MediaRecorder` API.
  - Automatic Indian regional language transcription and English translation powered by **Sarvam AI Saaras v4** (`mode: "translate"`).
  - Handles speech in Hindi, Marathi, Gujarati, Kannada, Tamil, Telugu, and English.
  - Audio file upload fallback (`.wav`, `.mp3`, `.webm`, `.m4a`).
  - Pre-configured architectural voice scenario presets (Pune, Ahmedabad, Bengaluru).

- **🧠 Bioclimatic Architectural Engine**:
  - Automatically identifies **City & Microclimate** (e.g., Hot & Dry, Semi-Arid, Warm & Humid, Temperate).
  - Extracts **Plot Dimensions, Facing / Cardinal Orientation, Floors (Ground, G+1, Duplex), and Budget Tier**.
  - Detects requested custom fixtures (e.g., L-shaped sectional couch, 6-seater dining table, TV console, ottoman, pooja room, walk-in closet).
  - Computes:
    - **Solar Path & Heat Gain Mitigation Strategy** (orientation, glare-free light, deep shading).
    - **Natural Wind & Stack Ventilation** (courtyards, double-height light wells, operable apertures).
    - **Fenestration & Shading** (window sizing, 3.3 ft cantilever RCC chajjas, cavity walls).
    - **Floor-by-Floor Master Schedule Table** (dimensions in ft/m, usable carpet area in sq.ft, orientation aspect, ventilation specifications).
    - **Furniture & Fixture Layout** (exact wall anchoring, viewing distances, and strict 3-foot minimum circulation corridors).

- **📐 Dual-Mode 2D Floor Plan Viewer**:
  - **Vector Blueprint (SVG)**: Crisp architectural CAD-style vector diagram with color-coded rooms, dimensions, door swings, and furniture footprints.
  - **Monospace ASCII Plan**: Clean 2D ASCII schematic blueprint with a 1-click copy button.

- **📄 Export & Print**:
  - Instant JSON export for architectural CAD workflows.
  - Formatted print / PDF generation report.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Requests, Python-Multipart, Python-Dotenv, Sarvam AI SDK (`sarvamai`).
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Tailwind CSS (CDN), Lucide Icons.
- **AI Services**:
  - Speech Recognition & Translation: [Sarvam AI Saaras v4](https://docs.sarvam.ai/api/getting-started/welcome)
  - Layout & Bioclimatic Reasoning: [Sarvam 105B Conversations](https://docs.sarvam.ai/api/getting-started/welcome)

---

## 🚀 Local Quickstart

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd voice-arch-house-planner
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure API Key
Create a `.env` file in the root directory:
```env
SARVAM_API_KEY=your_sarvam_api_key_here
```

### 4. Run the Server
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Open **`http://localhost:8000`** in your browser.

---

## ☁️ Deployment on Render

This repository includes a [`render.yaml`](render.yaml) file for instant **Render Blueprint** deployment:

1. Push this repository to **GitHub**.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Select your GitHub repository.
5. In the environment configuration, set your `SARVAM_API_KEY`.
6. Click **Apply** — Render will automatically build the service and deploy it with a live public HTTPS URL!
