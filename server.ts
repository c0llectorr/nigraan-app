import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { evaluateIMNCITriage } from './src/utils/imnciEngine.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize GoogleGenAI lazily with telemetry
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  const ai = getGenAIClient();
  res.json({
    status: 'ok',
    aiAvailable: !!ai,
    timestamp: new Date().toISOString(),
    environment: 'Nigraan On-Device Triage Engine (Offline + Gemini Fallback)',
  });
});

// Primary Assessment API Route: AI Extraction + Deterministic Triage
app.post('/api/visits/assess', async (req, res) => {
  try {
    const { ageMonths, vitals, selectedSignKeys = [], symptomNotes = '', childName = 'Child' } = req.body;

    let extractedSignKeys: string[] = [];
    let aiUrduExplanation = '';
    let aiEnglishExplanation = '';

    const ai = getGenAIClient();

    if (ai) {
      try {
        // Step 1: Extract structured clinical signs using Gemini 3.6 Flash
        const extractionPrompt = `You are a clinical decision-support AI implementing WHO IMNCI (Integrated Management of Neonatal and Childhood Illness) guidelines for Lady Health Workers in Pakistan.
Extract structured clinical signs from the following spoken or written Urdu/English symptom description:
"${symptomNotes}"

Check if any of these specific WHO IMNCI danger keys are present or strongly implied:
- unable_to_feed (child cannot drink or breastfeed)
- vomiting_everything (vomits all food and fluid)
- convulsions (history of fits/seizures during this illness)
- lethargy (unconscious, abnormally sleepy or unresponsive)
- chest_indrawing (lower chest wall moves in on inhalation)
- stiff_neck (inability to flex neck forward)
- severe_dehydration (sunken eyes, skin pinch > 2s)
- fast_breathing (rapid breathing rate)
- fever_moderate (fever for 2-7 days)
- ear_discharge (pus or pain from ear)

Return a JSON object matching the requested schema.`;

        const extractionResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: extractionPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedKeys: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of detected IMNCI danger sign keys',
                },
                chiefComplaintSummary: {
                  type: Type.STRING,
                  description: 'Short English summary of complaint',
                },
              },
              required: ['detectedKeys'],
            },
          },
        });

        if (extractionResponse.text) {
          const parsed = JSON.parse(extractionResponse.text.trim());
          if (Array.isArray(parsed.detectedKeys)) {
            extractedSignKeys = parsed.detectedKeys;
          }
        }
      } catch (aiErr) {
        console.warn('AI Extraction error, falling back to local engine:', aiErr);
      }
    }

    // Step 2: Run deterministic IMNCI engine with vitals + danger sign keys
    const result = evaluateIMNCITriage(
      ageMonths,
      vitals,
      selectedSignKeys,
      extractedSignKeys,
      symptomNotes
    );

    // Step 3: Optional AI Plain Urdu Explanation Refinement
    if (ai) {
      try {
        const explanationPrompt = `You are an empathetic medical advisor assisting Lady Health Worker Amina in Pakistan.
The deterministic IMNCI engine has classified child ${childName} (Age: ${ageMonths} months) as ${result.classification}.
Vitals: Temp ${vitals.temperatureC}°C, Respiratory Rate ${vitals.respiratoryRateBpm} bpm, Fever ${vitals.feverDays} days.
Detected Danger Signs: ${result.dangerSigns.map(d => d.nameEn).join(', ') || 'None'}.

Provide:
1. A clear, plain-Urdu explanation ("سادہ اردو وضاحت") for the mother (2 short sentences).
2. A brief English summary for the referral note.`;

        const expResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: explanationPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                urduExplanation: { type: Type.STRING },
                englishExplanation: { type: Type.STRING },
              },
              required: ['urduExplanation', 'englishExplanation'],
            },
          },
        });

        if (expResponse.text) {
          const expParsed = JSON.parse(expResponse.text.trim());
          if (expParsed.urduExplanation) result.explanationUrdu = expParsed.urduExplanation;
          if (expParsed.englishExplanation) result.explanationEnglish = expParsed.englishExplanation;
        }
      } catch (e) {
        // Fallback explanations already set by engine
      }
    }

    res.json({
      success: true,
      assessment: result,
    });
  } catch (error: any) {
    console.error('Assessment API error:', error);
    res.status(500).json({ error: error?.message || 'Assessment engine error' });
  }
});

// Image Analysis Stretch Goal (Growth Chart or Rash Photo)
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'Analyze this clinical photo (growth chart or visible symptom) for Lady Health Worker assessment.' } = req.body;

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API Key not configured. Using local offline mode.' });
    }

    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          imagePart,
          { text: `${prompt} Provide clinical observations, possible IMNCI danger signs, and plain Urdu summary for the mother.` },
        ],
      },
    });

    res.json({
      success: true,
      analysisText: response.text || 'Photo analyzed successfully.',
    });
  } catch (err: any) {
    console.error('Image analysis error:', err);
    res.status(500).json({ error: err?.message || 'Image analysis failed' });
  }
});

// Text-to-Speech API (Urdu Voice Output)
app.post('/api/tts', async (req, res) => {
  try {
    const { text = 'بچے کو درمیانہ بخار ہے' } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.status(503).json({ error: 'TTS unavailable in offline mode' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say clearly in Urdu: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ success: true, audioBase64: base64Audio });
    } else {
      res.status(500).json({ error: 'Failed to generate audio stream' });
    }
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: err?.message || 'TTS generation failed' });
  }
});

// Vite Middleware & Production Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nigraan Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
