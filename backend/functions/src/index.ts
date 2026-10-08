// ============================================================
// Care-Vision AI — production backend (Firebase Cloud Functions)
// Region: asia-south1 | Runtime: Node 20 | Auth required
//
// Secret needed:  GEMINI_API_KEY
//   set with: firebase functions:secrets:set GEMINI_API_KEY
// Deploy with:  firebase deploy --only functions
// ============================================================
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';

const GEMINI_KEY = defineSecret('GEMINI_API_KEY');
const MODEL = 'gemini-2.0-flash';
const REGION = 'asia-south1';
const GURL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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

function asJson(text: string): { data: any | null; raw: string } {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (m ? m[1] : text).trim();
  try {
    return { data: JSON.parse(raw), raw };
  } catch {
    return { data: null, raw };
  }
}

async function callGemini(contents: any[], systemText: string): Promise<string> {
  const key = GEMINI_KEY.value();
  if (!key) {
    throw new HttpsError('failed-precondition', 'AI key not configured on the server.');
  }
  const body = {
    contents,
    systemInstruction: { parts: [{ text: systemText }] },
    generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 100000);
  try {
    const r = await fetch(GURL + '?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const j: any = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new HttpsError('internal', j?.error?.message || `AI service error (${r.status})`);
    }
    const text = (j?.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p.text || '')
      .join('')
      .trim();
    if (!text) throw new HttpsError('internal', 'Empty AI response.');
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function imgPart(dataUrl: string): any | null {
  const m = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!m) return null;
  return { inlineData: { mimeType: m[1], data: m[2] } };
}

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

function needAuth(req: any) {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Please sign in first.');
}

const FN_OPTS = {
  region: REGION,
  secrets: [GEMINI_KEY],
  timeoutSeconds: 120,
  minInstances: 0,
  maxInstances: 20,
};

// ---- Image analysis: { kind: 'skin'|'report'|'xray', image: 'data:image/...;base64,...', lang } ----
export const analyzeScan = onCall(FN_OPTS, async (req) => {
  needAuth(req);
  const { kind, image, lang } = req.data || {};
  if (!['skin', 'report', 'xray'].includes(kind)) {
    throw new HttpsError('invalid-argument', 'Invalid scan kind.');
  }
  const part = imgPart(image || '');
  if (!part) throw new HttpsError('invalid-argument', 'No image received.');
  const text = await callGemini(
    [{ parts: [{ text: PROMPTS[kind](lang) }, part] }],
    SAFETY
  );
  const parsed = asJson(text);
  logger.info('analyzeScan ok', { kind, uid: req.auth!.uid });
  return {
    result: parsed.data || {
      raw: parsed.raw,
      disclaimer: 'Educational information only — please consult a doctor.',
    },
  };
});

// ---- Assistant chat: { message, lang, history: [{r:'u'|'a', x}] } ----
export const chatWithAI = onCall(FN_OPTS, async (req) => {
  needAuth(req);
  const { message, lang, history } = req.data || {};
  if (!message || !String(message).trim()) {
    throw new HttpsError('invalid-argument', 'Empty message.');
  }
  const contents: any[] = [];
  for (const m of history || []) {
    if (m && (m.r === 'u' || m.r === 'a') && m.x) {
      contents.push({
        role: m.r === 'u' ? 'user' : 'model',
        parts: [{ text: String(m.x).slice(0, 1000) }],
      });
    }
  }
  contents.push({ role: 'user', parts: [{ text: String(message).slice(0, 1000) }] });
  const reply = await callGemini(
    contents,
    SAFETY +
      ` Reply in ${LANGS[lang] || 'English'}. Keep replies short and helpful (under 120 words unless asked for more).`
  );
  return { reply };
});

// ---- Lightweight status check ----
export const aiStatus = onCall(
  { region: REGION, secrets: [GEMINI_KEY] },
  async () => ({ ok: true, ai: !!GEMINI_KEY.value() })
);
