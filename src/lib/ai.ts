// AI client — Firebase AI Logic (Gemini Developer API, free Spark plan)
// The Gemini key never leaves Google's infrastructure: the console's AI Logic
// workflow stores it server-side and the app only uses the Firebase web config.
// Works in Expo Go + production APK. No API keys in the app bundle.
//
// DEMO MODE (no Firebase keys in .env yet): analyzeImage returns a clearly
// labelled sample result, chatReply falls through to the Assistant screen's
// own offline demo replies. Real AI takes over automatically once .env keys
// exist AND Firebase AI Logic is enabled in the console.
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { DEMO_MODE, app } from './firebase';

const MODEL = 'gemini-3.5-flash-lite';

export type ScanKind = 'skin' | 'report' | 'xray';

const SAFETY = `You are Care-Vision AI, a health-information assistant inside a preventive-healthcare app.
STRICT RULES:
- NEVER give a definitive medical diagnosis. Use "possible", "may suggest", "commonly associated with".
- NEVER prescribe medicines, dosages, or treatment plans.
- ALWAYS include a clear note: this is educational information, not medical advice — consult a qualified doctor.
- Be warm, simple, clear. Avoid heavy jargon.`;

const LANGS: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (Hindi script)',
  ta: 'Tamil (Tamil script)',
};

const PROMPTS: Record<string, (lang: string) => string> = {
  skin: (lang) => `Look at this skin photo and give a careful, general skin observation.
Respond ONLY with valid JSON (no markdown fences, no extra text) in this exact shape:
{"observations":["..."],"possibleFindings":[{"label":"...","notes":"..."}],"severity":"low|moderate|high","guidance":["..."],"seeDoctorWhen":["..."],"disclaimer":"..."}
Keep observations factual (color, texture, area). possibleFindings are possibilities, NOT diagnoses. Write every text value in ${LANGS[lang] || 'English'}.`,
  report: (lang) => `This is a photo/scan of a medical lab report. Read every test parameter you can see.
Respond ONLY with valid JSON (no markdown fences, no extra text) in this exact shape:
{"values":[{"param":"...","value":"...","unit":"...","refRange":"...","status":"low|normal|high|unknown"}],"summary":"...","guidance":["..."],"disclaimer":"..."}
Compare each value against the report's own reference range for the status. If unreadable, use "unknown". Write every text value in ${LANGS[lang] || 'English'}.`,
  xray: (lang) => `This is a medical X-ray image. Give an EDUCATIONAL description only — you are not a radiologist and this is not a diagnosis.
Respond ONLY with valid JSON (no markdown fences, no extra text) in this exact shape:
{"observations":["..."],"whatItMeans":"...","impression":"...","guidance":["..."],"disclaimer":"..."}
Describe what is visible in plain words, what such findings can commonly mean, and stress that a qualified radiologist/doctor must interpret the image. Write every text value in ${LANGS[lang] || 'English'}.`,
};

function asJson(text: string): { data: any | null; raw: string } {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (m ? m[1] : text).trim();
  try {
    return { data: JSON.parse(raw), raw };
  } catch {
    return { data: null, raw };
  }
}

function imgPart(dataUrl: string): any | null {
  const m = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!m) return null;
  return { inlineData: { mimeType: m[1], data: m[2] } };
}

function errMsg(e: any): Error {
  const msg = String(e?.message || '');
  if (/api-key|API key/i.test(msg))
    return new Error('AI is not enabled for this Firebase project yet. Enable Firebase AI Logic in the console.');
  if (/permission|403/i.test(msg))
    return new Error('AI request was blocked. Check Firebase AI Logic setup.');
  return new Error(msg || 'AI request failed.');
}

let _model: any = null;
function genModel() {
  if (!_model) {
    const ai = getAI(app!, { backend: new GoogleAIBackend() });
    _model = getGenerativeModel(ai, { model: MODEL });
  }
  return _model;
}

// ---------- Demo results (no Firebase keys yet) ----------

const DEMO_DISCLAIMER =
  'Demo preview — educational information only, not a medical diagnosis. Please consult a doctor for real advice.';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function demoScanResult(kind: ScanKind) {
  if (kind === 'skin') {
    return {
      severity: 'moderate',
      possibleFindings: [
        {
          label: 'Demo finding (sample)',
          notes: 'Preview only — the real AI analysis appears after Firebase setup.',
        },
      ],
      observations: ['Demo observation: the scanned area is shown here as a sample.'],
      guidance: [
        'Keep the area clean and moisturised.',
        'Avoid scratching or picking at it.',
        'Note any changes over the next few days.',
      ],
      seeDoctorWhen: [
        'It spreads, darkens, or becomes painful.',
        'You notice bleeding, oozing, or rapid change.',
      ],
      disclaimer: DEMO_DISCLAIMER,
    };
  }
  if (kind === 'xray') {
    return {
      observations: ['Demo observation: a real reading needs Firebase setup.'],
      whatItMeans: 'This section explains the X-ray in simple words. Demo preview only.',
      impression: 'Demo impression — educational preview, not a medical opinion.',
      guidance: [
        'Keep your X-ray films and reports safely.',
        'Discuss the images with your doctor.',
      ],
      disclaimer: DEMO_DISCLAIMER,
    };
  }
  // report
  return {
    values: [
      { param: 'Haemoglobin', value: '13.2', unit: 'g/dL', refRange: '12–16', status: 'normal' },
      { param: 'Blood Sugar (Fasting)', value: '118', unit: 'mg/dL', refRange: '70–100', status: 'high' },
    ],
    summary: 'Demo summary — sample values shown. Real report analysis needs Firebase setup.',
    guidance: [
      'Share the full report with your doctor.',
      'Repeat tests only as your doctor advises.',
    ],
    disclaimer: DEMO_DISCLAIMER,
  };
}

// ---------- Public API ----------

// imageDataUrl: 'data:image/jpeg;base64,...'  lang: 'en' | 'hi' | 'ta'
export async function analyzeImage(kind: ScanKind, imageDataUrl: string, lang: string) {
  if (DEMO_MODE) {
    await sleep(1200);
    return demoScanResult(kind);
  }
  try {
    const part = imgPart(imageDataUrl);
    if (!part) throw new Error('No image received.');
    const res = await genModel().generateContent({
      contents: [{ role: 'user', parts: [{ text: PROMPTS[kind](lang) }, part] }],
      systemInstruction: SAFETY,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1000 },
    });
    const text = String(res?.response?.text?.() || '').trim();
    if (!text) throw new Error('Empty AI response.');
    const parsed = asJson(text);
    return (
      parsed.data || {
        raw: parsed.raw,
        disclaimer: 'Educational information only — please consult a doctor.',
      }
    );
  } catch (e) {
    throw errMsg(e);
  }
}

export async function chatReply(
  message: string,
  lang: string,
  history: { r: string; x: string }[]
) {
  if (DEMO_MODE) {
    // Let the Assistant screen's built-in offline demo replies handle this.
    throw new Error('DEMO_MODE');
  }
  try {
    const contents: any[] = [];
    for (const m of history.slice(-8)) {
      if (m && (m.r === 'u' || m.r === 'a') && m.x) {
        contents.push({
          role: m.r === 'u' ? 'user' : 'model',
          parts: [{ text: String(m.x).slice(0, 1000) }],
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: String(message).slice(0, 1000) }] });
    const res = await genModel().generateContent({
      contents,
      systemInstruction:
        SAFETY +
        ` Reply in ${LANGS[lang] || 'English'}. Keep replies short and helpful (under 120 words unless asked for more).`,
      generationConfig: { temperature: 0.5, maxOutputTokens: 500 },
    });
    const text = String(res?.response?.text?.() || '').trim();
    if (!text) throw new Error('Empty AI response.');
    return text;
  } catch (e) {
    throw errMsg(e);
  }
}

// true when signed in AND the AI backend answers
export async function aiOnline(): Promise<boolean> {
  if (DEMO_MODE) return false;
  try {
    await genModel().generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Reply with: ok' }] }],
      generationConfig: { maxOutputTokens: 8 },
    });
    return true;
  } catch {
    return false;
  }
}
