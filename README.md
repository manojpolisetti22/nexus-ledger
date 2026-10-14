# NEXUS // Quantum Expense Ledger (PWA)

A futuristic, mobile-first Progressive Web App (PWA) engineered specifically for on-the-go business owners. Log expenses hands-free via natural voice dictation or plain English text, and review or edit any historical entry on a holographic ledger.

---

## ⚡ Core Features

1. **Natural Language Voice & Text Capture**:
   - Speak or type: `"Paid 150 for office supplies"` or `"Gas $48 at Chevron yesterday"`.
   - **Dual-Engine Architecture**:
     - **Offline Quantum Engine**: High-performance local heuristic NLP parser that extracts amounts, dates (today, yesterday, last week), payees, and categories with zero network latency.
     - **Gemini 2.5 Flash AI Engine**: Optional Google AI connection for deep reasoning, itemization, and complex queries.
2. **Dedicated Mobile Home Screen App (PWA)**:
   - Full Progressive Web App with `manifest.json`, Service Worker offline caching, and viewport-fit coverage.
   - Installable with 1 tap on Android or via Safari "Add to Home Screen" on iOS for a fullscreen experience without browser bars.
3. **Holographic Inspector // Inline Editing**:
   - Tap any logged expense to open an ergonomic bottom drawer / modal.
   - Edit amount, merchant/payee, date, category (8 visual cybernetic pills), payment method, and notes.
4. **Ergonomic Floating Action Bar**:
   - Large thumb-accessible microphone button with animated sound-wave visualizer and live interim transcription stream.
   - Quick suggestion preset chips for one-tap common expense logging.
   - Micro-confetti animations, haptic phone vibration, and subtle futuristic Web Audio synthesis sound effects.
5. **HUD Telemetry & Analytics**:
   - Live spending telemetry for Today, 7 Days, This Month, and Average transaction size.
   - Category distribution charts.
   - One-tap CSV export for Excel or Google Sheets.
   - Full JSON backup and restore.

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```
To access it on your mobile phone on the same Wi-Fi network:
```bash
npm run dev -- --host
```
Open the `http://<YOUR-LOCAL-IP>:5173` URL on your phone's browser (Safari or Chrome).

### 2. Build for Production
```bash
npm run build
```

---

## 📱 How to Add to Your Phone's Home Screen

### iPhone / iPad (Safari)
1. Open the app URL in **Safari**.
2. Tap the **Share** button (box with upward arrow) in the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right.
5. The **Nexus** icon will appear on your home screen and launch fullscreen like a native app!

### Android (Chrome / Brave / Edge)
1. Open the app URL in **Chrome**.
2. Tap the **three dots menu (⋮)** or the **"App"** install button in the top bar.
3. Tap **"Install app"** or **"Add to Home screen"**.

---

## 🤖 Optional: Adding Your Gemini API Key
The app works **100% offline** out of the box with built-in heuristic parsing. To enable Gemini 2.5 Flash:
1. Tap the **Settings** gear icon in the top header.
2. Paste your free Google AI Studio API key in the **Gemini API Key** field.
3. Tap **"Test"** to verify connection.
