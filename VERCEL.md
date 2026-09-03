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
   - תחת **Environment Variables**, תוכל להוסיף את מפתח ה-AI:
     - `GEMINI_API_KEY`: המפתח שלך מ-Google AI Studio (אם אין לך כרגע, האפליקציה תפעל במצב Smart Deterministic Engine ללא שגיאות).
   
5. **פריסה:**
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
