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
        const extractionPrompt = `You are a clinical decision-support AI implementing WHO IMNCI (Integrated Management of Neonatal and Childhood Illness) guidelines for Lady Health Workers in rural Pakistan.
The input text below may be in Urdu, Roman Urdu, Sindhi, Pashto, Punjabi, or English (or a mixed regional dialect):
"${symptomNotes}"

Analyze the symptoms and extract all applicable WHO IMNCI clinical danger keys from this list:
- unable_to_feed: Child cannot drink or breastfeed, or refuses to suck (e.g. Urdu: "دودھ نہیں پی رہا", Pashto: "تی نه شي روئلی", Sindhi: "پير نه ٿو پئي", Punjabi: "دودھ نہیں پیندا", Roman: "doodh nahi peeta", "paani nahi peeta").
- vomiting_everything: Vomits all food, milk, or fluids (e.g. Urdu: "ہر چیز الٹی کر دیتا ہے", Pashto: "کېاسته کوي", Sindhi: "اُلٽي ٿو ڪري", Punjabi: "الٹی کردا ہے", Roman: "har cheez ulti kar deta hai").
- convulsions: History of fits, seizures, or jerking (e.g. Urdu: "جھٹکے لگتے ہیں", Pashto: "تشنج", Sindhi: "جھٽڪا ٿا لڳن", Punjabi: "جھٹکے پیندے نے", Roman: "jhatkay lagtay hain", "seizures").
- lethargy: Lethargic, unconscious, or unresponsive (e.g. Urdu: "غنوگی / بے ہوش", Pashto: "بے هوشه", Sindhi: "بي هوش / گهري ننڊ", Punjabi: "بے ہوش / ستا رہندا ہے", Roman: "sota rehta hai", "be hosh", "be jaan").
- chest_indrawing: Lower chest wall indrawing (e.g. Urdu: "پسلی دھنسنا", Pashto: "پښتۍ لوېدل", Sindhi: "پسلي هلڻ", Punjabi: "پسلیاں چلنا", Roman: "pasli chal rahi hai", "pasli dhans rahi hai").
- stiff_neck: Stiff neck or neck rigidity (e.g. Urdu: "گردن اکڑنا", Pashto: "غاړه سخته شوې", Sindhi: "ڳچي سختي", Punjabi: "دھون اکڑ گئی", Roman: "gardan akad gayi hai").
- severe_dehydration: Sunken eyes or poor skin turgor (e.g. Urdu: "آنکھیں اندر دھنس گئیں", Roman: "aankhen andar chali gayi").
- fast_breathing: Rapid breathing rate or panting (e.g. Urdu: "تیز سانسیں", Pashto: "ګړندۍ ساه", Sindhi: "تيز ساه", Punjabi: "تیز ساہ", Roman: "sans teez hai", "teez saans").
- fever_moderate: Fever / high body temperature (e.g. Urdu: "بخار", Pashto: "تبه", Sindhi: "تاپ", Punjabi: "تپ / بخار", Roman: "bukhar hai", "tap hai").
- ear_discharge: Ear pain or pus draining from ear (e.g. Urdu: "کان سے پیپ", Pashto: "له غوږ څخه چرک", Sindhi: "ڪن مان پونءِ", Punjabi: "کن چوں پیپ", Roman: "kaan se peep").

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

// IMNCI Image Processing & Vision Inference API Route
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', patientContext = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API Key not configured. AI vision inference offline.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const visionSystemPrompt = `You are a specialized diagnostic AI performing WHO IMNCI (Integrated Management of Neonatal and Childhood Illness) clinical image analysis for Lady Health Workers in Pakistan.

Analyze the uploaded clinical photo (skin rash, eyes, mouth, posture, body/limb wasting, ear discharge, or jaundice) according to WHO IMNCI diagnostic protocols.

Patient Context: ${patientContext || 'Child under 5 years old in rural clinic'}

Examine the image carefully for identifiable clinical conditions:
1. Measles (Generalized maculopapular rash, Koplik spots, conjunctivitis/red eyes, fever)
2. Severe Eye Infection / Corneal Clouding / Conjunctival Pus
3. Severe Acute Malnutrition (SAM): Visible severe wasting (marasmus), bipedal edema (kwashiorkor), loose skin folds
4. Mouth Ulcers / Oral Candidiasis (Thrush) / Stomatitis
5. Severe Skin Infections: Impetigo, bullous lesions, pustules, extensive scabies
6. Active Ear Pus Discharge / Otitis Media
7. Neonatal Jaundice (yellowing of skin/soles/eyes)
8. Severe Respiratory Distress / Visible chest wall indrawing

Map detected findings to applicable WHO IMNCI danger keys from this exact list:
- "measles_rash"
- "eye_clouding"
- "visible_wasting"
- "mouth_ulcers"
- "skin_pustules"
- "jaundice_neonatal"
- "ear_discharge"
- "chest_indrawing"

Determine Triage Level:
- "RED": Severe complicated measles, corneal clouding, SAM wasting/edema, severe jaundice, chest indrawing (Requires URGENT Hospital Referral)
- "YELLOW": Mouth ulcers, mild skin pustules, ear discharge (Requires local treatment & 2-day recheck)
- "GREEN": Normal skin / no visible danger signs

Provide IMNCI protocol step-by-step action guidelines (e.g., Vitamin A dose, antibiotic dose, eye ointment application, gentian violet, urgent referral).

Return a JSON object conforming strictly to the requested schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: visionSystemPrompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedDisease: {
              type: Type.STRING,
              description: 'Primary clinical visual finding (e.g. Measles Rash with Eye Complications)',
            },
            imnciClassification: {
              type: Type.STRING,
              description: 'IMNCI classification title',
            },
            triageColor: {
              type: Type.STRING,
              description: 'RED, YELLOW, or GREEN',
            },
            confidence: {
              type: Type.STRING,
              description: 'Confidence level e.g. High (92%)',
            },
            imnciProtocolSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Step-by-step IMNCI protocol treatment instructions',
            },
            detectedDangerKeys: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Applicable IMNCI danger sign keys',
            },
            urduDiagnosisSummary: {
              type: Type.STRING,
              description: 'Clear plain Urdu diagnosis summary for mother and health worker',
            },
            englishDiagnosisSummary: {
              type: Type.STRING,
              description: 'Clinical English note for referral slip',
            },
            differentialDiagnoses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 2-3 differential diagnoses',
            },
          },
          required: [
            'detectedDisease',
            'imnciClassification',
            'triageColor',
            'confidence',
            'imnciProtocolSteps',
            'detectedDangerKeys',
            'urduDiagnosisSummary',
            'englishDiagnosisSummary',
          ],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      res.json({
        success: true,
        ...parsed,
      });
    } else {
      res.status(500).json({ error: 'Failed to generate visual analysis' });
    }
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
