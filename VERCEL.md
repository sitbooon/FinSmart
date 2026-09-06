# מדריך פריסה ל-Vercel (Vercel Deployment Guide)

פרויקט **FinOS** מוכן ותואם ב-100% לפריסה מיידית ב-**Vercel**!

הפרויקט כולל:
- קובץ הגדרות `vercel.json` מותאם ל-Vite (כולל הגדרת SPA Routing ופונקציות Serverless).
- נקודת קצה של Serverless Function בתיקיית `/api/index.ts` עבור כל קריאות ה-API (`/api/ai/chat`, `/api/ai/insights`, `/api/csv/parse`, `/api/health`).
- גיבוי מקומי מלא ב-LocalStorage + ייצוא/ייבוא קובץ JSON (כך שהמערכת עובדת מושלם גם אם השרת לא זמין).

---

## שיטת פריסה 1: חיבור ישיר מ-GitHub (השיטה המומלצת ביותר)

1. **העלה את הפרויקט ל-GitHub:**
   - צור Repository חדש ב-GitHub.
   - העלה אליו את כל קבצי הפרויקט:
     ```bash
     git init
     git add .
     git commit -m "Initial commit for Vercel"
     git branch -M main
     git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
     git push -u origin main
     ```

2. **ייבוא ל-Vercel:**
   - היכנס ל-[vercel.com](https://vercel.com) והתחבר עם חשבון ה-GitHub שלך.
   - לחץ על **"Add New..."** -> **"Project"**.
   - בחר את ה-Repository שיצרת ולחץ על **"Import"**.

3. **הגדרות הפרויקט (Project Settings):**
   - **Framework Preset**: בחר `Vite` (ברירת מחדל).
   - **Root Directory**: `./` (שורש הפרויקט).
   - **Build Command**: `vite build` (מוגדר אוטומטית ב-`vercel.json`).
   - **Output Directory**: `dist` (מוגדר אוטומטית).

4. **משתני סביבה (Environment Variables):**
   - תחת **Environment Variables** ב-Vercel, הוסף את משתני הסביבה הבאים:
     - `GEMINI_API_KEY`: המפתח שלך מ-Google AI Studio (אם אין לך כרגע, האפליקציה תפעל במצב Smart Deterministic Engine ללא שגיאות).
     
     **משתני סנכרון ענן (Firebase Cloud Sync עבור סנכרון בין טלפונים ומחשבים לשני בני הזוג):**
     - `VITE_FIREBASE_API_KEY`: `AIzaSyCcoFL2evuiuJw2itX0v-o34koxMQbjr_0`
     - `VITE_FIREBASE_AUTH_DOMAIN`: `zippy-palace-g6rpq.firebaseapp.com`
     - `VITE_FIREBASE_PROJECT_ID`: `zippy-palace-g6rpq`
     - `VITE_FIREBASE_STORAGE_BUCKET`: `zippy-palace-g6rpq.firebasestorage.app`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `210870018294`
     - `VITE_FIREBASE_APP_ID`: `1:210870018294:web:7462337bef098ecd864cd7`
     - `VITE_FIREBASE_DATABASE_ID`: `ai-studio-5b167304-2025-400f-8dde-e2e438bb0a2b`
   
5. **שלב חובה למניעת שגיאת auth/unauthorized-domain בהתחברות:**
   - ב-Firebase יש הגנת אבטחה שמאפשרת התחברות רק מדומיינים שאושרו מראש.
   - היכנס לקישור הבא לפרויקט שלך:
     [הגדרות Firebase Console - דומיינים מורשים](https://console.firebase.google.com/project/zippy-palace-g6rpq/authentication/settings)
   - גלול אל **"Authorized domains" (דומיינים מורשים)**.
   - לחץ על **"Add domain" (הוסף דומיין)**.
   - הוסף את `vercel.app` (מאשר את כל הכתובות תחת vercel) או את הדומיין המדויק של האתר שלך (למשל `my-finance.vercel.app`).
   - לחץ **Save**. השינוי חל מיידית ללא צורך בפריסה חוזרת!

6. **פריסה:**
   - לחץ על **"Deploy"**!
   - תוך כ-45 שניות תקבל כתובת חיה ומאובטחת (למשל: `https://finos-app.vercel.app`) עם תעודת SSL חינם.

---

## שיטת פריסה 2: פריסה מהירה באמצעות Vercel CLI

אם מותקן אצלך Node.js בטרמינל:

```bash
# 1. התקנת Vercel CLI (אם טרם הותקן)
npm i -g vercel

# 2. הרצת פקודת הפריסה בתיקיית הפרויקט
vercel

# 3. לפריסה ישירה לסביבת Production:
vercel --prod
```

---

## מבנה הקבצים הייעודיים ל-Vercel שנבנו בפרויקט:

1. **`vercel.json`** - מגדיר ל-Vercel לנתב את קריאות ה-`/api/*` ל-Serverless Function ב-`api/index.ts`, ואת כל שאר הנתיבים ל-`dist/index.html` (SPA routing).
2. **`api/index.ts`** - נקודת הכניסה של Vercel Node Serverless Function המפעילה את ה-Express App וה-AI.
3. **`src/server/app.ts`** - מודול השרת המשותף המכיל את כל ה-API endpoints.
4. **`server.ts`** - נשאר פעיל לריצה מקומית ולסביבת הפיתוח ללא כל התנגשות.
