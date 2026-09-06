import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import {
  Account,
  CreditCard,
  Transaction,
  FixedExpense,
  ExpectedIncome,
  Category,
  Budget,
  SavingGoal,
  Debt,
  Investment,
  DeletedTransaction,
} from '../types';

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  createdByEmail: string;
  memberUids: string[];
  memberEmails: string[];
  inviteCode: string;
  updatedAt: string;
}

export interface SharedLedgerPayload {
  householdId: string;
  accounts: Account[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  expectedIncomes: ExpectedIncome[];
  categories: Category[];
  budgets: Budget[];
  savingGoals: SavingGoal[];
  debts: Debt[];
  investments: Investment[];
  merchantRules: Record<string, string>;
  deletedTransactions: DeletedTransaction[];
  updatedAt: string;
  lastUpdatedBy?: string;
  lastUpdatedEmail?: string;
}

export const DEFAULT_MASTER_LEDGER_ID = 'finsmart_master_db';

export const DEFAULT_MASTER_HOUSEHOLD: Household = {
  id: DEFAULT_MASTER_LEDGER_ID,
  name: 'המסד הפיננסי המשותף',
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'master',
  createdByEmail: '',
  memberUids: ['all_platforms'],
  memberEmails: [],
  inviteCode: 'MASTER',
  updatedAt: new Date().toISOString(),
};

// Generate an easy-to-share 6-character code (e.g. FAM-8492)
export function generateInviteCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `FAM-${digits}`;
}

// Fetch a household by ID
export async function getHousehold(householdId: string): Promise<Household | null> {
  try {
    const snap = await getDoc(doc(db, 'households', householdId));
    if (snap.exists()) {
      return snap.data() as Household;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching household:', err);
    return null;
  }
}

// Fetch ledger data once
export async function getHouseholdLedger(householdId: string): Promise<SharedLedgerPayload | null> {
  try {
    const snap = await getDoc(doc(db, 'households', householdId, 'data', 'ledger'));
    if (snap.exists()) {
      return snap.data() as SharedLedgerPayload;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching ledger:', err);
    return null;
  }
}

// Create a new household or ledger workspace (no auth required)
export async function createHousehold(
  name: string,
  customId?: string
): Promise<Household> {
  const householdId = customId || 'hh_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const inviteCode = generateInviteCode();

  const newHousehold: Household = {
    id: householdId,
    name: name.trim() || 'התקציב המשפחתי שלנו',
    createdAt: new Date().toISOString(),
    createdBy: 'user',
    createdByEmail: '',
    memberUids: ['all'],
    memberEmails: [],
    inviteCode,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'households', householdId), newHousehold);
  return newHousehold;
}

// Join an existing household using an invite code
export async function joinHouseholdByCode(code: string): Promise<Household> {
  const cleaned = code.trim().toUpperCase();
  if (cleaned === 'MASTER' || cleaned === DEFAULT_MASTER_LEDGER_ID) {
    return DEFAULT_MASTER_HOUSEHOLD;
  }

  const q = query(collection(db, 'households'), where('inviteCode', '==', cleaned));
  const snap = await getDocs(q);

  if (snap.empty) {
    // Check if user entered the householdId directly
    const directDoc = await getDoc(doc(db, 'households', code.trim()));
    if (directDoc.exists()) {
      return directDoc.data() as Household;
    }
    throw new Error('קוד הסנכרון שגוי או שלא נמצא מסד נתונים מתאים');
  }

  return snap.docs[0].data() as Household;
}

// Real-time synchronization listener for the shared ledger
export function subscribeToHouseholdLedger(
  householdId: string,
  onData: (data: SharedLedgerPayload) => void,
  onError?: (err: Error) => void
): () => void {
  const ledgerDocRef = doc(db, 'households', householdId, 'data', 'ledger');

  return onSnapshot(
    ledgerDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SharedLedgerPayload;
        onData(data);
      }
    },
    (error) => {
      console.warn('Firestore sync error:', error);
      if (onError) onError(error);
    }
  );
}

// Push local changes to Firestore shared ledger (instant, cross-browser, cross-device)
export async function saveHouseholdLedger(
  householdId: string,
  payload: any,
  deviceTag: string = 'device'
): Promise<void> {
  try {
    const ledgerDocRef = doc(db, 'households', householdId, 'data', 'ledger');
    await setDoc(
      ledgerDocRef,
      {
        ...payload,
        householdId,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: deviceTag,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to sync changes to cloud:', err);
    throw err;
  }
}
