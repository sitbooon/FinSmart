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
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
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

// Generate an easy-to-share 6-character code (e.g. FAM-8492)
export function generateInviteCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `FAM-${digits}`;
}

// Fetch user profile to see active household
export async function getUserProfile(uid: string): Promise<{ activeHouseholdId?: string } | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as { activeHouseholdId?: string };
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

// Set active household for user
export async function setUserActiveHousehold(
  userOrUid: User | string,
  householdId: string,
  email?: string
): Promise<void> {
  try {
    const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid.uid;
    const userEmail = typeof userOrUid === 'string' ? email || '' : userOrUid.email || '';
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email: userEmail,
        activeHouseholdId: householdId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error updating user profile:', err);
  }
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
    console.error('Error fetching household:', err);
    return null;
  }
}

// Find any household where the user's email was invited
export async function findHouseholdForEmail(email: string): Promise<Household | null> {
  try {
    const normalized = email.trim().toLowerCase();
    const q = query(
      collection(db, 'households'),
      where('memberEmails', 'array-contains', normalized)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Household;
    }
    return null;
  } catch (err) {
    console.error('Error finding household by email:', err);
    return null;
  }
}

// Create a new household with initial application data
export async function createHousehold(
  name: string,
  userOrUid: User | string,
  email?: string
): Promise<Household> {
  const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid.uid;
  const userEmail = (typeof userOrUid === 'string' ? email || '' : userOrUid.email || '')
    .trim()
    .toLowerCase();

  const householdId = 'hh_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const inviteCode = generateInviteCode();

  const newHousehold: Household = {
    id: householdId,
    name: name.trim() || 'התקציב המשפחתי שלנו',
    createdAt: new Date().toISOString(),
    createdBy: uid,
    createdByEmail: userEmail,
    memberUids: [uid],
    memberEmails: userEmail ? [userEmail] : [],
    inviteCode,
    updatedAt: new Date().toISOString(),
  };

  // Save household metadata
  await setDoc(doc(db, 'households', householdId), newHousehold);

  // Link user profile to this household
  await setUserActiveHousehold(userOrUid, householdId, userEmail);

  return newHousehold;
}

// Join an existing household using an invite code (e.g. spouse enters code on their phone)
export async function joinHouseholdByCode(
  code: string,
  userOrUid: User | string,
  email?: string
): Promise<Household> {
  const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid.uid;
  const userEmail = (typeof userOrUid === 'string' ? email || '' : userOrUid.email || '')
    .trim()
    .toLowerCase();

  const cleaned = code.trim().toUpperCase();
  const q = query(collection(db, 'households'), where('inviteCode', '==', cleaned));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('קוד ההזמנה שגוי או שאינו קיים במערכת');
  }

  const hhDoc = snap.docs[0];
  const household = hhDoc.data() as Household;

  // Add user UID and Email to members
  const updates: Partial<Household> = {
    memberUids: Array.from(new Set([...household.memberUids, uid])),
    memberEmails: userEmail
      ? Array.from(new Set([...household.memberEmails, userEmail]))
      : household.memberEmails,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, 'households', household.id), updates);
  await setUserActiveHousehold(userOrUid, household.id, userEmail);

  return { ...household, ...updates };
}

// Invite spouse by email
export async function inviteSpouseByEmail(householdId: string, email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  await updateDoc(doc(db, 'households', householdId), {
    memberEmails: arrayUnion(normalized),
    updatedAt: new Date().toISOString(),
  });
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
      console.error('Firestore sync error:', error);
      if (onError) onError(error);
    }
  );
}

// Push local changes to Firestore shared ledger
export async function saveHouseholdLedger(
  householdId: string,
  payload: any,
  userOrUid?: User | string,
  email?: string
): Promise<void> {
  try {
    const uid = userOrUid
      ? typeof userOrUid === 'string'
        ? userOrUid
        : userOrUid.uid
      : 'anonymous';
    const userEmail = userOrUid
      ? (typeof userOrUid === 'string' ? email || '' : userOrUid.email || '')
          .trim()
          .toLowerCase()
      : '';

    const ledgerDocRef = doc(db, 'households', householdId, 'data', 'ledger');
    await setDoc(
      ledgerDocRef,
      {
        ...payload,
        householdId,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: uid,
        lastUpdatedEmail: userEmail,
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to sync changes to cloud:', err);
    throw err;
  }
}
