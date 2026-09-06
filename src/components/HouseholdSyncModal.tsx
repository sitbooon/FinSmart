import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  RefreshCw,
  Users,
  Smartphone,
  Laptop,
  Copy,
  Check,
  Share2,
  Mail,
  Lock,
  LogIn,
  LogOut,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Code2,
} from 'lucide-react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, firebaseConfig } from '../firebase/config';
import {
  Household,
  createHousehold,
  joinHouseholdByCode,
  inviteSpouseByEmail,
  SharedLedgerPayload,
} from '../firebase/householdService';

interface HouseholdSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  currentHousehold: Household | null;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  onManualSync: () => Promise<void>;
  onCreateHousehold: (name: string) => Promise<void>;
  onJoinHousehold: (code: string) => Promise<void>;
  onInviteSpouse: (email: string) => Promise<void>;
  prefilledInviteCode?: string;
}

export const HouseholdSyncModal: React.FC<HouseholdSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentHousehold,
  isSyncing,
  lastSyncedAt,
  onManualSync,
  onCreateHousehold,
  onJoinHousehold,
  onInviteSpouse,
  prefilledInviteCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'vercel'>('sync');

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Household actions state
  const [householdName, setHouseholdName] = useState('התקציב המשפחתי שלנו');
  const [inviteCodeInput, setInviteCodeInput] = useState(prefilledInviteCode);
  const [spouseEmailInput, setSpouseEmailInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (prefilledInviteCode) {
      setInviteCodeInput(prefilledInviteCode);
    }
  }, [prefilledInviteCode]);

  if (!isOpen) return null;

  // Google sign in
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setAuthError('unauthorized-domain');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'שגיאה בהתחברות באמצעות גוגל');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Email / Password sign in or register
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        setAuthError('unauthorized-domain');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('אימייל או סיסמה שגויים');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('כתובת אימייל זו כבר רשומה במערכת. אנא התחבר.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('הסיסמה צריכה להכיל לפחות 6 תווים.');
      } else {
        setAuthError(err.message || 'שגיאה בהתחברות');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActionSuccess('התנתקת בהצלחה');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Create household
  const handleCreate = async () => {
    setActionLoading(true);
    setActionSuccess(null);
    setAuthError(null);
    try {
      await onCreateHousehold(householdName);
      setActionSuccess('המרחב המשפחתי נוצר בהצלחה וסונכרן לענן!');
    } catch (err: any) {
      setAuthError(err.message || 'שגיאה ביצירת המרחב');
    } finally {
      setActionLoading(false);
    }
  };

  // Join household by code
  const handleJoin = async () => {
    if (!inviteCodeInput.trim()) return;
    setActionLoading(true);
    setActionSuccess(null);
    setAuthError(null);
    try {
      await onJoinHousehold(inviteCodeInput.trim());
      setActionSuccess('הצטרפת בהצלחה למרחב המשפחתי המשותף!');
    } catch (err: any) {
      setAuthError(err.message || 'שגיאה בהצטרפות למרחב');
    } finally {
      setActionLoading(false);
    }
  };

  // Invite spouse by email
  const handleInviteSpouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spouseEmailInput.trim()) return;
    setActionLoading(true);
    setActionSuccess(null);
    try {
      await onInviteSpouse(spouseEmailInput.trim());
      setActionSuccess(`האימייל ${spouseEmailInput} נוסף כחבר מורשה במרחב!`);
      setSpouseEmailInput('');
    } catch (err: any) {
      setAuthError(err.message || 'שגיאה בהוספת חבר');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!currentHousehold) return;
    navigator.clipboard.writeText(currentHousehold.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleShareWhatsapp = () => {
    if (!currentHousehold) return;
    const url = window.location.origin + window.location.pathname + `?join=${currentHousehold.inviteCode}`;
    const text = `היי, הצטרף/י אליי למעקב התקציב והתזרים המשותף שלנו באפליקציה! היכנס/י לקישור והזן/י את קוד ההזמנה: ${currentHousehold.inviteCode}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const vercelEnvSnippet = `# משתני סביבה ל-Vercel (העתק להגדרות Settings > Environment Variables ב-Vercel)
VITE_FIREBASE_API_KEY="${firebaseConfig.apiKey}"
VITE_FIREBASE_AUTH_DOMAIN="${firebaseConfig.authDomain}"
VITE_FIREBASE_PROJECT_ID="${firebaseConfig.projectId}"
VITE_FIREBASE_STORAGE_BUCKET="${firebaseConfig.storageBucket}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${firebaseConfig.messagingSenderId}"
VITE_FIREBASE_APP_ID="${firebaseConfig.appId}"
VITE_FIREBASE_DATABASE_ID="${firebaseConfig.firestoreDatabaseId || ''}"`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(vercelEnvSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <div className="bg-white dark:bg-[#1E2425] rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-[#191D1E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                סנכרון ענן ומרחב זוגי משותף
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                סנכרון בזמן אמת בין הטלפון למחשב, עבור שני חשבונות מייל נפרדים
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>סנכרון ומרחב משפחתי</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'vercel'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>הנחיות ל-Vercel</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Notifications */}
          {authError === 'unauthorized-domain' ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-sm text-amber-950 dark:text-amber-100">
                    דומיין האתר טרם אושר ב-Firebase Authentication
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    מנגנון האבטחה של Firebase דורש להגדיר פעם אחת בלבד את הדומיין שממנו מתחברים.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">הדומיין הנוכחי שלך:</span>
                    <span className="font-mono bg-white/80 dark:bg-black/40 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-bold select-all">
                      {typeof window !== 'undefined' ? window.location.hostname : 'your-app.vercel.app'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 space-y-2">
                <div className="font-semibold text-xs">איך מאשרים את הדומיין ב-2 קליקים?</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-amber-850 dark:text-amber-300 pr-1">
                  <li>לחץ על הכפתור למטה כדי לפתוח ישירות את הגדרות הפרויקט ב-Firebase Console.</li>
                  <li>גלול למטה לחלק <strong>"Authorized domains" (דומיינים מורשים)</strong>.</li>
                  <li>לחץ על <strong>"Add domain" (הוסף דומיין)</strong>.</li>
                  <li>הזן <code className="bg-amber-200/80 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">vercel.app</code> (מאשר את כל הכתובות ב-Vercel) או את הכתובת המדויקת של האתר שלך, ולחץ <strong>Save</strong>.</li>
                </ol>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href="https://console.firebase.google.com/project/zippy-palace-g6rpq/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>פתח את הגדרות הדומיינים ב-Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setAuthError(null)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 transition-colors"
                  >
                    סגור
                  </button>
                </div>
              </div>
            </div>
          ) : authError ? (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {authError}
            </div>
          ) : null}
          {actionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {activeTab === 'sync' ? (
            <>
              {/* STAGE 1: NOT LOGGED IN */}
              {!currentUser ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                    <p className="font-bold mb-1">
                      📱 למה כדאי להתחבר?
                    </p>
                    <p>
                      כדי שהפעולות שתעשה במחשב יסונכרנו אוטומטית לטלפון, ושגם אשתך תוכל להתחבר מהמכשיר שלה ולראות את אותו התזרים בדיוק!
                    </p>
                  </div>

                  {/* Google 1-Click Login */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-gray-700 dark:text-gray-200 transition-all shadow-2xs hover:shadow-xs active:scale-99"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>התחבר בלחיצה אחת עם Google</span>
                  </button>

                  <div className="flex items-center gap-3 my-3">
                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                    <span className="text-xs text-gray-400">או עם אימייל וסיסמה</span>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1" />
                  </div>

                  {/* Email & Password Form */}
                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        אימייל
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                        <input
                          type="email"
                          required
                          dir="ltr"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="sitbooon@gmail.com"
                          className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252D2E] text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        סיסמה
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                        <input
                          type="password"
                          required
                          dir="ltr"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="לפחות 6 תווים"
                          className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252D2E] text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : authMode === 'login' ? (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>התחבר לחשבון</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>צור חשבון חדש</span>
                        </>
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode(authMode === 'login' ? 'signup' : 'login');
                          setAuthError(null);
                        }}
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        {authMode === 'login'
                          ? 'אין לך חשבון עדיין? לחץ כאן להרשמה מהירה'
                          : 'כבר רשום? לחץ כאן להתחברות'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : !currentHousehold ? (
                /* STAGE 2: LOGGED IN, BUT NO HOUSEHOLD YET */
                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          מחובר: {currentUser.email}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          בחר כיצד להמשיך להגדרת המרחב הזוגי
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>התנתק</span>
                    </button>
                  </div>

                  {/* Option A: Create New Household */}
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#252D2E]/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#00B894] text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        צור מרחב משפחתי חדש (והעלה את הנתונים הקיימים)
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      כל התנועות, החשבונות והתקציבים שכבר יצרת יעלו לענן בצורה מאובטחת, ותקבל קוד הזמנה מיידי לאשתך.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={householdName}
                        onChange={(e) => setHouseholdName(e.target.value)}
                        placeholder="שם המרחב (לדוגמה: התקציב המשפחתי שלנו)"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E2425] text-xs"
                      />
                      <button
                        onClick={handleCreate}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-[#00B894] hover:bg-[#00A383] text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Cloud className="w-4 h-4" />
                            <span>צור מרחב בענן</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Option B: Join Existing Household */}
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-[#252D2E]/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                        או הצטרף למרחב של בן/בת הזוג עם קוד הזמנה
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      אם בן/בת הזוג כבר פתח/ה את המרחב, הזן כאן את קוד ההזמנה שקיבלת ממנו/ה (למשל: FAM-8492):
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        dir="ltr"
                        value={inviteCodeInput}
                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                        placeholder="FAM-XXXX"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E2425] text-xs font-mono tracking-widest text-center"
                      />
                      <button
                        onClick={handleJoin}
                        disabled={actionLoading || !inviteCodeInput.trim()}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Users className="w-4 h-4" />
                            <span>הצטרף למרחב</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* STAGE 3: LOGGED IN & ACTIVE HOUSEHOLD (COUPLE SYNC ACTIVE) */
                <div className="space-y-4">
                  {/* Active Status Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          סנכרון ענן פעיל בזמן אמת
                        </span>
                      </div>
                      <button
                        onClick={onManualSync}
                        disabled={isSyncing}
                        className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 font-semibold"
                        title="סנכרן עכשיו"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
                        <span>{isSyncing ? 'מסנכרן...' : 'סנכרן עכשיו'}</span>
                      </button>
                    </div>

                    <div>
                      <div className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                        {currentHousehold.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {lastSyncedAt
                          ? `סנכרון אחרון: ${lastSyncedAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                          : 'מסונכרן עם מסד הנתונים בענן'}
                      </div>
                    </div>

                    {/* Member Avatars */}
                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/40">
                      <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>חברי המרחב המשותף:</span>
                      </div>
                      <div className="space-y-1">
                        {currentHousehold.memberEmails && currentHousehold.memberEmails.length > 0 ? (
                          currentHousehold.memberEmails.map((em) => (
                            <div
                              key={em}
                              className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2 font-mono"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{em}</span>
                              {em.toLowerCase() === currentUser.email?.toLowerCase() && (
                                <span className="text-[10px] font-sans font-semibold text-emerald-600 dark:text-emerald-400">
                                  (אתה)
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                            {currentUser.email} (אתה)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Share & Invite Section for Spouse */}
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252D2E] space-y-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        איך לחבר את הטלפון ואת בת/בן הזוג?
                      </h4>
                    </div>

                    {/* Quick Code Box */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 dark:bg-[#1E2425] border border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          קוד ההזמנה של המרחב:
                        </div>
                        <div className="text-lg font-mono font-black text-gray-900 dark:text-white tracking-widest mt-0.5">
                          {currentHousehold.inviteCode}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleCopyCode}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#2A3334] border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-2xs"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>הועתק!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>העתק קוד</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleShareWhatsapp}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-2xs"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>שלח בוואטסאפ</span>
                        </button>
                      </div>
                    </div>

                    {/* Direct Email Invite */}
                    <form onSubmit={handleInviteSpouse} className="space-y-2 pt-1">
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        או הוסף ישירות את כתובת המייל של בן/בת הזוג:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          dir="ltr"
                          value={spouseEmailInput}
                          onChange={(e) => setSpouseEmailInput(e.target.value)}
                          placeholder="wife@example.com"
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E2425] text-xs"
                        />
                        <button
                          type="submit"
                          disabled={actionLoading || !spouseEmailInput.trim()}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
                        >
                          הוסף חבר/ה
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        ברגע שבן/בת הזוג יתחברו עם כתובת המייל הזו (גם בטלפון), המערכת תחבר אותם מיד לאותו התזרים בדיוק.
                      </p>
                    </form>
                  </div>

                  {/* Device Sync Info Box */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#252D2E] border border-gray-200 dark:border-gray-700">
                      <Laptop className="w-5 h-5 mx-auto text-gray-500 dark:text-gray-400 mb-1" />
                      <div className="font-bold text-gray-900 dark:text-white">במחשב</div>
                      <div className="text-[10px] text-gray-500">תצוגת מסך מלאה וניתוחים</div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#252D2E] border border-gray-200 dark:border-gray-700">
                      <Smartphone className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                      <div className="font-bold text-gray-900 dark:text-white">בטלפון</div>
                      <div className="text-[10px] text-gray-500">הזנת קניות מהירה בסופר</div>
                    </div>
                  </div>

                  {/* User Account / Logout */}
                  <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>מחובר בתור: {currentUser.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>התנתק</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* TAB 2: VERCEL DEPLOYMENT INSTRUCTIONS */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-950 dark:text-blue-200 text-xs leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <span>הוראות להגדרת סנכרון הענן ב-Vercel</span>
                </div>
                <p>
                  אם אתה מעלה או פורס את האפליקציה ב-Vercel, עליך להגדיר את משתני הסביבה (Environment Variables) בלוח הבקרה של הפרויקט ב-Vercel כדי שהסנכרון בין הטלפונים יעבוד בכל מקום.
                </p>
              </div>

              {/* 3 Step Guide */}
              <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    היכנס ל-<strong>Vercel Dashboard</strong> ⟵ פתח את הפרויקט שלך ⟵ עבור ללשונית <strong>Settings</strong> ⟵ ובחר ב-<strong>Environment Variables</strong>.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    העתק את המשתנים להלן בלחיצה על הכפתור, והדבק אותם ב-Vercel (או הזן כל משתנה בנפרד):
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    בצע <strong>Redeploy</strong> לפרויקט ב-Vercel.
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    4
                  </div>
                  <div className="space-y-1">
                    <div>
                      <strong>אישור הדומיין ב-Firebase (מונע שגיאת unauthorized-domain):</strong>
                    </div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      היכנס ל-
                      <a
                        href="https://console.firebase.google.com/project/zippy-palace-g6rpq/authentication/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold inline-flex items-center gap-0.5 mx-1"
                      >
                        <span>הגדרות Firebase Console</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                      ⟵ גלול אל <strong>"Authorized domains"</strong> ⟵ לחץ <strong>"Add domain"</strong> ⟵ והוסף <code className="bg-amber-200/70 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold">vercel.app</code>.
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    משתני הסביבה להעתקה:
                  </span>
                  <button
                    onClick={handleCopyEnv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>הועתק ללוח!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>העתק את כל המשתנים</span>
                      </>
                    )}
                  </button>
                </div>
                <pre
                  dir="ltr"
                  className="p-3.5 rounded-xl bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-gray-800"
                >
                  {vercelEnvSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-[#191D1E] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-bold text-xs transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
