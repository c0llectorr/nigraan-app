# Nigraan (نگران) — Offline AI Clinical Decision-Support Companion

> **Build with Gemma: GDG Cloud Lahore — Hackathon Submission**
>
> An offline-first, AI-powered clinical decision-support tool for Lady Health Workers (LHWs) conducting maternal and child health field assessments in low-connectivity rural areas of Pakistan.

---

## 🌟 Problem & Overview

In rural Pakistan, Lady Health Workers (LHWs) perform home visits to assess young children for acute illnesses using the **WHO IMNCI (Integrated Management of Neonatal and Childhood Illness)** guidelines. However:
- **Zero or Low Internet Access**: Rural Union Councils lack reliable mobile data, rendering cloud-only AI tools useless at the point of care.
- **Paper Trail Gaps**: Referred children often lack structured documentation, leading to lost follow-ups at Basic Health Units (BHUs) and Rural Health Centers (RHCs).
- **Time Pressure**: LHWs manage high case volumes and need rapid, reliable, and auditable triage support.

**Nigraan** ("guardian / one who watches over") addresses these challenges with a **100% On-Device, Hybrid Safe AI Architecture**:
1. **Gemma 4 (`gemma4:e4b`)**: Processes natural speech (Urdu/English) or written descriptions to extract structured IMNCI danger signs and generate empathetic plain-Urdu explanations for caregivers.
2. **Deterministic IMNCI Rules Engine**: Evaluates clinical vitals and extracted danger signs against official WHO cutoff algorithms to assign a **Red / Yellow / Green** triage classification.
3. **Printable / Downloadable Referral Slips**: Automatically generates structured PDF referral slips for Red and Yellow cases with unique tracking codes.
4. **Mandatory Recheck Tracker**: Maintains a local "Due Today" follow-up list for Yellow-classified cases (e.g., early pneumonia, prolonged fever) requiring 2-day rechecks.

---

## 🛡️ Clinical Safety & Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NIGRAAN HYBRID ENGINE                            │
├───────────────────────────────────┬─────────────────────────────────────────┤
│    AI Extraction & Explanation    │    Deterministic Triage Engine          │
│   (Gemma 4 / gemma4:e4b / Gemini) │    (src/utils/imnciEngine.ts)           │
├───────────────────────────────────┼─────────────────────────────────────────┤
│ • Natural speech / text input     │ • Temperature & Fever duration          │
│ • Urdu speech recognition         │ • Respiratory rate (age-based cutoffs)  │
│ • Structured danger sign parsing  │ • Hardcoded WHO IMNCI algorithm          │
│ • Caregiver Urdu explanation      │ • Auditable Red / Yellow / Green triage │
└───────────────────────────────────┴─────────────────────────────────────────┘
```

> **Crucial Safety Rule**: The AI model is strictly bounded to natural language extraction and explanation generation. The final triage classification is always computed deterministically in code by the WHO IMNCI engine.

---

## 🚀 Key Features

- **🎙️ Urdu Voice Input**: Speech-to-text recognition allowing LHWs to speak symptoms naturally while examining a child.
- **🔊 Plain Urdu Text-to-Speech**: Audio playback of explanations for low-literacy caregivers.
- **📄 Instant PDF Referral Slips**: Printable A4 referral documentation with patient demographics, vitals, detected danger signs, target BHU facility name, and receiving officer signature lines.
- **⏱️ Recheck Due Tracker**: Automatically computes and highlights 2-day follow-up dates for Yellow cases so no child drops out of care.
- **📋 Clinical History & Database**: Local storage of all assessed visits and child profiles.
- **📖 Embedded IMNCI Guide**: Quick reference modal showing age-based respiratory cutoffs (e.g., ≥50 bpm for infants 2–11m, ≥40 bpm for children 12–59m) and general danger signs.

---

## 📁 Repository File Structure

```
├── server.ts                       # Express backend server with Ollama/Gemini integration
├── SETUP_GEMMA_LOCAL.md            # Detailed instructions for local Gemma 4 (gemma4:e4b) setup
├── README.md                       # Main project documentation
├── package.json                    # Dependencies & build scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build tool configuration
└── src/
    ├── App.tsx                     # Main application layout & state router
    ├── types.ts                    # TypeScript interface definitions (Child, Visit, Vitals, DangerSign)
    ├── components/
    │   ├── Header.tsx              # Application header & navigation
    │   ├── Dashboard.tsx           # Home dashboard with statistics & visit table
    │   ├── NewVisitForm.tsx        # Assessment entry form (voice, vitals, checklist)
    │   ├── AssessmentResultModal.tsx # Triage result display, Urdu explanation, TTS audio
    │   ├── ReferralSlipModal.tsx   # Visual referral slip preview
    │   ├── RecheckList.tsx         # Recheck tracker for 2-day follow-ups
    │   ├── PatientRecords.tsx      # Searchable patient history database
    │   └── IMNCIGuideModal.tsx     # WHO IMNCI clinical reference modal
    ├── data/
    │   ├── imnciRules.ts           # WHO danger signs catalog & cutoff constants
    │   └── mockVisits.ts           # Pre-seeded test records (Ali Hassan, Zainab Bibi, Ayesha Noor)
    └── utils/
        ├── imnciEngine.ts          # Deterministic WHO IMNCI triage engine
        └── pdfGenerator.ts         # jsPDF-based referral slip PDF renderer
```

---

## 🔧 Local Installation & Running

### Prerequisites
- Node.js (v18 or higher)
- npm
- [Ollama](https://ollama.com/) (for running `gemma4:e4b` locally)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/nigraan-app.git
   cd nigraan-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local Gemma 4 model via Ollama**:
   ```bash
   ollama pull gemma4:e4b
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:3000` to interact with Nigraan!

---

## 📜 License & Acknowledgments

- **License**: Apache 2.0
- **Built for**: Build with Gemma — GDG Cloud Lahore Hackathon
- **Clinical Protocol**: World Health Organization (WHO) & UNICEF Integrated Management of Neonatal and Childhood Illness (IMNCI) guidelines.
