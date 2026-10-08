# Care-Vision AI 🏥

An AI-powered preventive healthcare mobile app that analyzes medical reports, skin photos, and X-rays, tracks health assessments, and gives personalized health insights — built with **React Native (Expo)** and **Firebase**.

## ✨ Features

- **AI Health Scan** — Upload or capture skin photos, lab reports, and X-rays; Gemini-powered AI returns structured analysis with confidence scores
- **Demo Mode** — Runs fully offline with realistic sample data when no Firebase keys are configured (perfect for demos & interviews)
- **6 Health Risk Assessments** — Interactive questionnaires (heart, diabetes, lifestyle & more) with animated score rings; results saved to Firestore
- **Smart Reminders** — Medicine & checkup reminders with local scheduling
- **AI Health Assistant** — Chatbot with offline fallback replies
- **History & PDF Reports** — Past scans/assessments with one-tap PDF export
- **Trilingual UI** — English, Hindi, Tamil (180+ translated strings)
- **Liquid-glass UI** — Animated tab bar, springy buttons, staggered screen transitions

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native, Expo SDK 57, TypeScript, Expo Router |
| AI | Google Gemini via Firebase AI Logic (`firebase/ai`) |
| Backend | Firebase Auth, Firestore, Cloud Functions (optional scale-up path) |
| i18n | Custom EN/HI/TA locale system |
| Build | EAS Build (Android APK) |

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Add Firebase keys — or skip for Demo Mode
cp .env.example .env
# fill in your Firebase web-app keys

# 3. Run it
npx expo start
# scan the QR with the Expo Go app on your phone
```

> **Demo Mode:** with an empty `.env`, the app runs completely offline — any login button signs in a demo user, scans return labelled sample AI results, and all data is stored locally. No Firebase account needed to try it.

## 📦 Build an APK

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## 📁 Project Structure

```
src/
  app/            # Expo Router screens (splash, onboarding, auth, 5 tabs, module detail)
  components/     # Reusable UI (cards, buttons, score ring, tab bar)
  lib/            # firebase.ts, ai.ts (Gemini), store (offline-first data layer)
  i18n.tsx        # EN/HI/TA translations
  theme.ts        # Light-theme design tokens
locales/          # Raw locale files
backend/functions # Cloud Functions scale-up path (TypeScript, verified)
```

## 👤 Author

**Md Parvej Ansari** — B.E. Computer Science & Engineering (2023–2027)
- GitHub: https://github.com/parvejansari80708-sketch
- LinkedIn: https://www.linkedin.com/in/md-parvej-ansari-908a972a3

Built as a final-year-grade project: spec → interactive prototype → production Expo app with real on-device AI.
