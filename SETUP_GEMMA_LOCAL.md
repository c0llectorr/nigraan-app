# Nigraan — Local Setup & Gemma 4 (`gemma4:e4b`) Integration Guide

This guide provides step-by-step instructions for cloning, running, and setting up **Nigraan** locally on your machine, along with full instructions on how to integrate **Gemma 4 (`gemma4:e4b`)** running on **Ollama** for 100% offline local inference.

---

## 1. Core Architecture & Safety Philosophy

Nigraan is designed for Lady Health Workers (LHWs) operating in low/zero-connectivity rural areas. To ensure 100% clinical safety and auditability, Nigraan uses a **Hybrid Safe AI Architecture**:

1. **Gemma 4 (`gemma4:e4b` via Ollama)**: Processes natural speech/text (Urdu or English) to extract structured clinical danger signs (e.g., `chest_indrawing`, `unable_to_feed`, `lethargy`) and generates empathetic, plain-language caregiver explanations in Urdu.
2. **Deterministic WHO IMNCI Engine (`src/utils/imnciEngine.ts`)**: Applies hardcoded, auditable WHO IMNCI rules to vitals (temperature, weight, respiratory rate) and extracted danger signs to calculate the final **Red / Yellow / Green** triage status. *The AI never makes the final classification decision directly.*

---

## 2. Prerequisites

Ensure your system has the following installed:

- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Git**: For cloning the repository
- **Ollama**: Local AI runner ([Download Ollama](https://ollama.com/))

---

## 3. Quick Local Setup

### Step 1: Clone the Repository & Install Dependencies
```bash
git clone https://github.com/your-username/nigraan-app.git
cd nigraan-app
npm install
```

### Step 2: Download & Run Gemma 4 (`gemma4:e4b`) locally via Ollama
Open a new terminal window and run:

```bash
# Verify Ollama is installed and running
ollama --version

# Pull the 4-bit quantized Gemma 4 model
ollama pull gemma4:e4b

# Run a test query to verify local execution
ollama run gemma4:e4b "Hello Gemma, confirm you are running locally."
```

By default, Ollama serves its REST API on `http://localhost:11434`.

---

## 4. Environment Configuration

Create or update the `.env` file in the project root:

```env
# .env
PORT=3000
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="gemma4:e4b"
```

---

## 5. File-by-File Guide for `gemma4:e4b` Local Integration

Here are the specific files in the codebase that govern AI extraction, clinical rules, and UI presentation:

### File 1: `server.ts` (Backend API & Local Ollama Request Handler)
This server endpoint receives the user's symptom notes, calls Ollama's local REST API to process them with `gemma4:e4b`, and feeds the output into the deterministic IMNCI engine.

Replace or update the extraction block in `server.ts` to invoke Ollama directly:

```typescript
// server.ts snippet for Ollama Gemma 4 integration
import express from 'express';
import dotenv from 'dotenv';
import { evaluateIMNCITriage } from './src/utils/imnciEngine';

dotenv.config();

const app = express();
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const GEMMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e4b';

app.post('/api/visits/assess', async (req, res) => {
  try {
    const { ageMonths, vitals, selectedSignKeys = [], symptomNotes = '', childName = 'Child' } = req.body;

    let extractedSignKeys: string[] = [];

    // Call Local Ollama Gemma 4 Model
    try {
      const ollamaPrompt = `You are an offline clinical assistant implementing WHO IMNCI protocols for Lady Health Workers in Pakistan.
Extract structured danger sign keys from this patient description: "${symptomNotes}"

Valid keys to detect:
- unable_to_feed
- vomiting_everything
- convulsions
- lethargy
- chest_indrawing
- stiff_neck
- severe_dehydration
- fast_breathing
- fever_moderate
- ear_discharge

Respond ONLY with a valid JSON array of string keys found, e.g.: ["chest_indrawing", "unable_to_feed"]`;

      const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GEMMA_MODEL,
          prompt: ollamaPrompt,
          stream: false,
          format: 'json',
        }),
      });

      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json();
        const parsed = JSON.parse(ollamaData.response);
        if (Array.isArray(parsed)) {
          extractedSignKeys = parsed;
        }
      }
    } catch (ollamaErr) {
      console.warn('Ollama Gemma 4 offline fallback active:', ollamaErr);
    }

    // Run Deterministic IMNCI Rules Engine with extracted keys
    const result = evaluateIMNCITriage(
      ageMonths,
      vitals,
      selectedSignKeys,
      extractedSignKeys,
      symptomNotes
    );

    res.json({ success: true, assessment: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### File 2: `src/utils/imnciEngine.ts` (Deterministic WHO IMNCI Triage Logic)
This file computes the Red/Yellow/Green classification based on WHO clinical cutoffs:
- **Red Triage**: General danger signs (e.g., chest indrawing, unable to feed, lethargy, fever > 7 days).
- **Yellow Triage**: Fast breathing threshold (≥50 bpm for <12m, ≥40 bpm for 12-59m) indicating early pneumonia, or fever 2–7 days. Requires mandatory 2-day follow-up.
- **Green Triage**: No danger signs detected. Standard home guidance provided.

---

### File 3: `src/components/NewVisitForm.tsx` (Speech & Symptom Input)
Handles input capture via Web Speech API (`ur-PK` Urdu recognition) and manual checkboxes for quick danger sign validation.

---

### File 4: `src/components/AssessmentResultModal.tsx` (Results & Voice Guidance)
Displays the calculated Red/Yellow/Green badge, plain Urdu explanation, detected danger signs list, and Web Speech API text-to-speech audio playback for low-literacy caregivers.

---

### File 5: `src/utils/pdfGenerator.ts` (Printable Referral Slip Generator)
Generates downloadable, printable A4 referral slip PDFs formatted for hospital medical officers (BHU/RHC/DHQ) using `jspdf`.

---

## 6. Running the Application

1. Start the local server:
   ```bash
   npm run dev
   ```
2. Open your browser at:
   `http://localhost:3000`

3. Disconnect your Wi-Fi or internet connection to test 100% offline triage execution!

---

## 7. Summary of Files & Purpose

| File Path | Description / Role |
| flex | --- |
| `server.ts` | Node/Express backend that proxies requests to local `Ollama` (`gemma4:e4b`) |
| `src/utils/imnciEngine.ts` | Deterministic WHO IMNCI triage engine (Red/Yellow/Green calculation) |
| `src/data/imnciRules.ts` | WHO IMNCI danger sign catalog & age-based respiratory cutoffs |
| `src/components/NewVisitForm.tsx` | Voice & text patient assessment entry screen |
| `src/components/AssessmentResultModal.tsx` | Triage results, plain-Urdu explanation & TTS audio |
| `src/components/ReferralSlipModal.tsx` | Visual referral slip preview |
| `src/utils/pdfGenerator.ts` | Generates official PDF referral slips |
| `src/components/RecheckList.tsx` | Mandatory 2-day follow-up tracker for Yellow cases |
| `src/components/PatientRecords.tsx` | Local searchable visit history database |
