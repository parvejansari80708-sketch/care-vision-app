# CARE-VISION AI — Complete App (START HERE)

Ye **poora app** hai — frontend + backend + database, sab kuch ek zip me. Kuch assemble nahi karna.

## Andar kya hai

```
care-vision-app/
├── src/app/            → saari screens (splash, onboarding, auth, 5 tabs, scan flows...)
├── src/components/     → UI + animations (smooth fade/spring/press effects)
├── src/lib/            → firebase, database, AI, camera helpers
├── src/i18n.tsx         → English / हिंदी / தமிழ்
├── locales/            → 180+ translated strings
├── backend/functions/  → production AI backend (Cloud Functions)
├── .env.example        → copy karke .env banao
└── firestore.rules     → database security rules
```

**Animations:** har screen par smooth fade+rise entrance, buttons par springy press, tab bar me animated purple capsule, health-score ring animate hota hai, chat messages slide-in. Sab `useNativeDriver` par — 60fps smooth.

**Responsive:** flex layouts, har screen scrollable, floating tab bar content ko kabhi cover nahi karta, SafeArea har phone par.

---

## STEP 1 — Zip nikalo + install karo (5 min)

1. Zip extract karo, `care-vision-app` folder ko VS Code me kholo
2. Terminal me (usi folder me):
```
npm install
```

## STEP 2 — Firebase project (10 min, free)

1. https://console.firebase.google.com → **Add project** → naam `care-vision-ai` → Create
2. **</> Web** icon → nickname `care-vision-web` → Register → 6 keys copy karo:
   apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
3. **Build → Authentication** → Get started → **Email/Password** Enable → **Anonymous** Enable
4. **Build → Firestore Database** → Create database → production mode → location **`asia-south1`** → Enable
5. **Rules** tab → is zip ki `firestore.rules` ka content paste karo → **Publish**

## STEP 3 — Keys dalo (2 min)

1. `.env.example` ko copy karke `.env` naam do (care-vision-app ke andar)
2. Step 2 wali 6 keys bharo:
```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## STEP 4 — AI backend deploy karo (5 min)

Computer me Node.js hona chahiye (nodejs.org → LTS).

```bash
npm install -g firebase-tools
cd care-vision-app/backend
firebase login
```
(Browser me Google account → Allow)
```bash
firebase use --add        # apna care-vision-ai project chuno
cd functions && npm install && cd ..
firebase functions:secrets:set GEMINI_API_KEY
```
→ key paste karo (https://aistudio.google.com → Get API Key, **free**)
```bash
firebase deploy --only functions
```
"Deploy complete!" = AI backend LIVE ✅ (key Google ke Secret Manager me safe hai)

## STEP 5 — Phone me chalao

```bash
npx expo start
```
Phone me **Expo Go** app → QR scan → app khul jayegi ✅

**Test karo:**
1. Signup (email/password) → Firebase Console → Authentication me user ✅
2. **Scan → Skin Scan → photo** → analyzing → **REAL AI report** ✅
3. Firebase Console → Firestore → `users/{uid}/scans` me data ✅
4. Assistant me sawal → real AI jawab ✅
5. Health → koi module → questions → risk result → save ✅

---

## Bina keys ke bhi chalega?

Haan — app khulegi, lekin login/scan me error aayega jab tak Firebase keys + deploy na ho. Demo data kahin nahi — sab real hai.

## Problems?

| Error | Fix |
|---|---|
| `auth/api-key-not-valid` | `.env` keys dobara check karo |
| `Please sign in first.` | Pehle login/signup/guest karo |
| `AI is not configured` | Step 4 dobara: secrets:set |
| `Missing or insufficient permissions` | Firestore Rules publish karo (Step 2.5) |
| QR scan par purana code | Expo Go me app band karke dobara scan karo |

Error ka screenshot bhejo — exact fix dunga.
