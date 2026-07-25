# Nigraan (نگران) — Offline AI Clinical Decision-Support & Multilingual Vision Companion

> **Build with Gemma / GDG Cloud Lahore Hackathon Project**
> **GitHub Repository:** [c0llectorr/nigraan-app](https://github.com/c0llectorr) | **Author:** [@c0llectorr](https://github.com/c0llectorr)
>
> An offline-first, AI-powered clinical decision-support & vision platform for Lady Health Workers (LHWs) conducting maternal and child health field assessments in low-connectivity rural areas of Pakistan.

---

## 🌟 Problem & Executive Overview

In rural Pakistan, over 100,000 Lady Health Workers (LHWs) perform home visits to assess young children (ages 0–59 months) for acute life-threatening illnesses using the **WHO IMNCI (Integrated Management of Neonatal and Childhood Illness)** guidelines. However, field workers encounter critical bottlenecks:

1. **Zero or Low Internet Access**: Rural Union Councils in Punjab, Sindh, Khyber Pakhtunkhwa, and Balochistan lack reliable mobile internet, rendering cloud-dependent medical tools ineffective at the point of care.
2. **Dialect & Literacy Barriers**: Caregivers communicate symptoms in regional languages and dialects (Urdu, Roman Urdu, Punjabi, Sindhi, Pashto) or cannot read complex medical charts.
3. **Visual Diagnostic Challenges**: Identifying subtle early signs of Measles, Corneal Clouding, Severe Acute Malnutrition (SAM wasting), Oral Thrush, and Bullous Pustules requires trained clinical vision.
4. **Paper Trail & Referral Dropouts**: Referred children often lack structured documentation, leading to lost follow-ups at Basic Health Units (BHUs) and Rural Health Centers (RHCs).

**Nigraan** ("نگران" — *guardian / vigilant observer*) solves these challenges with a **100% On-Device & Hybrid Safe AI Architecture**:
- **Pakistani Regional Language Audio Engine**: Speech-to-text with auto-dialect normalization for Urdu, Punjabi, Sindhi, Pashto, Roman Urdu, and English.
- **IMNCI AI Vision Inference Module**: Analyzes clinical photos (skin rashes, eyes, mouth, posture, wasting, jaundice) to detect visual danger signs and prescribe WHO protocol steps.
- **Deterministic WHO IMNCI Triage Rules Engine**: Evaluates vitals and AI-extracted danger signs against official WHO cutoff algorithms to assign an unalterable **Red / Yellow / Green** triage.
- **Caregiver Audio Explanations**: Converts complex clinical diagnoses into empathetic plain Urdu text and speech (TTS) for mothers.
- **On-Device PDF Referral Slips & Recheck Tracker**: Generates printable A4 referral slips with facility routing and tracks mandatory 2-day follow-ups for Yellow cases.

---

## 🛡️ Hybrid Clinical Safety Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                NIGRAAN HYBRID CLINICAL ENGINE                           │
├─────────────────────────────────────────┬───────────────────────────────────────────────┤
│     AI Perception & Extraction Layer    │    Deterministic Clinical Rules Engine        │
│     (Gemma 4 / Gemini Vision)           │    (src/utils/imnciEngine.ts)                  │
├─────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • Regional Speech NLP (Urdu, Pashto...) │ • Age-based respiratory rate cutoffs          │
│ • Clinical Image Vision Inference       │ • Temperature & Fever duration thresholds     │
│ • Structured Danger Sign Key Parsing    │ • Hardcoded WHO IMNCI classification logic    │
│ • Empathetic Plain-Urdu Caregiver Note  │ • Auditable RED / YELLOW / GREEN Triage Badge │
└─────────────────────────────────────────┴───────────────────────────────────────────────┘
```

> **Crucial Medical Safety Rule**: AI models in Nigraan are strictly constrained to perception, language extraction, visual feature detection, and explanation generation. The **final triage severity level** is always calculated deterministically in TypeScript according to official WHO IMNCI algorithm cutoffs.

---

## 🚀 Key Features & Capabilities

### 1. 🎙️ Multilingual Regional Speech Engine
- Real-time speech-to-text recording with language support for **Urdu (اردو)**, **Punjabi (پنجابی)**, **Sindhi (سنڌي)**, **Pashto (پښتو)**, **Roman Urdu**, and **English**.
- Smart fallback handling that defaults smoothly to Urdu models when regional voice models are not preloaded on the LHW's mobile device.
- Natural Language Extraction prompt that parses dialectical phrasing (e.g. Pashto *"تی نه شي روئلی"*, Sindhi *"پير نه ٿو پئي"*, Punjabi *"دودھ نہیں پیندا"*, Roman *"pasli dhans rahi hai"*) directly into structured WHO IMNCI keys.

### 2. 📷 IMNCI Clinical Image Inference & Vision Module
- Camera capture or gallery upload for clinical visual examination.
- Detects key conditions:
  - **Measles Rash** (Generalized maculopapular lesions)
  - **Severe Eye Infection / Corneal Clouding**
  - **Severe Acute Malnutrition (SAM)** (Visible muscle wasting / marasmus / kwashiorkor edema)
  - **Mouth Ulcers & Oral Thrush**
  - **Impetigo & Bullous Skin Pustules**
  - **Neonatal Jaundice & Ear Pus Discharge**
- Returns structured JSON containing detected disease, confidence level, triage tier, step-by-step WHO protocol actions (e.g., *Vitamin A 200,000 IU*, *Tetracycline 1% Eye Ointment*, *First dose oral/IV antibiotic*), and plain Urdu explanations.
- Includes pre-loaded **Clinical Sample Presets** for LHW field training and offline demonstration.

### 3. ⏱️ Deterministic Triage Engine & Vitals Assessment
- Evaluates age-specific cutoffs:
  - **Fast Breathing**: ≥50 bpm for infants 2–11m, ≥40 bpm for children 12–59m.
  - **Fever & Temperature**: High fever (≥37.5°C) and prolonged duration (≥14 days).
  - **General Danger Signs**: Inability to feed, vomiting everything, convulsions, lethargy/unconsciousness, chest indrawing, stiff neck.

### 4. 📄 Printable PDF Referral Slips & Recheck Tracker
- **A4 PDF Referral Slips**: Generated on-device using `jspdf`. Contains child demographics, vitals summary, identified danger signs, target BHU/RHC facility, and receiving officer sign-off lines.
- **Mandatory 2-Day Recheck List**: Keeps a "Due Today" follow-up roster for Yellow-classified cases (e.g., early pneumonia, prolonged fever, acute otitis media).

### 5. 🔊 Caregiver Audio Explanations (TTS)
- One-click Text-To-Speech playback in plain Urdu to help mothers understand why their child needs urgent hospital referral or home care.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion.
- **Backend / API Proxy**: Express.js running on Node.js / Bun.
- **AI Models**:
  - **Gemma 4 (`gemma4:e4b`) / Gemini 3.6 Flash**: Multilingual symptom extraction and caregiver text generation.
  - **Gemini 3.6 Flash Vision**: Clinical image analysis with JSON response schema enforcement.
- **PDF Generation**: `jspdf` for client-side offline document rendering.
- **State Management**: LocalStorage persistence with seeded clinical test profiles.

---

## 📁 Repository Structure

```
├── server.ts                         # Express backend API server with Gemma/Gemini proxy
├── README.md                         # Project documentation & writeup
├── package.json                      # Dependencies & build scripts
├── vite.config.ts                    # Vite build configuration
└── src/
    ├── App.tsx                       # Main layout & view router
    ├── types.ts                      # TypeScript models (Child, Visit, Vitals, DangerSign)
    ├── components/
    │   ├── Header.tsx                # Top bar with status badges & guide toggle
    │   ├── Dashboard.tsx             # Overview stats, recent visits, quick actions
    │   ├── NewVisitForm.tsx          # Visit entry form (Voice, Camera Vision, Vitals, Checklist)
    │   ├── AssessmentResultModal.tsx # Triage result badge, Urdu summary, TTS playback
    │   ├── ReferralSlipModal.tsx     # Printable A4 referral slip preview
    │   ├── RecheckList.tsx           # 2-day follow-up roster for Yellow cases
    │   ├── PatientRecords.tsx        # Searchable patient directory
    │   └── IMNCIGuideModal.tsx       # WHO IMNCI clinical guidelines reference
    ├── data/
    │   ├── imnciRules.ts             # Master catalog of IMNCI danger signs & cutoffs
    │   └── mockVisits.ts             # Pre-seeded test patient records
    └── utils/
        ├── imnciEngine.ts            # Deterministic WHO IMNCI triage classification engine
        └── pdfGenerator.ts           # Client-side PDF referral slip renderer
```

---

## 🔧 Installation & Setup Guide

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/c0llectorr/nigraan-app.git
   cd nigraan-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` or set in environment:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` in your browser.

---

## 👤 Author & Maintainer

- **GitHub**: [@c0llectorr](https://github.com/c0llectorr)
- **Project**: Nigraan (نگران) — Clinical AI Companion for Lady Health Workers
- **Hackathon**: Build with Gemma — GDG Cloud Lahore

---

## 📜 License & Clinical Acknowledgments

- **License**: Apache 2.0
- **Clinical Protocol**: Based on the World Health Organization (WHO) and UNICEF *Integrated Management of Neonatal and Childhood Illness (IMNCI)* guidelines adapted for Lady Health Workers in Pakistan.
