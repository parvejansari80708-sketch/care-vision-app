// Firestore database — everything is stored per-user under users/{uid}/...
// Collections: assessments, scans, reminders, chats
//
// DEMO MODE (no Firebase keys yet): data is stored on-device in AsyncStorage
// under `carevision:demo:<collection>` so reminders/history/etc. fully work
// while exploring the UI. Real Firestore takes over once .env keys exist.
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEMO_MODE, auth, db } from './firebase';

const demoKey = (col: string) => `carevision:demo:${col}`;

async function demoRead(col: string): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(demoKey(col));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function demoWrite(col: string, arr: any[]) {
  await AsyncStorage.setItem(demoKey(col), JSON.stringify(arr));
}

// Firestore Timestamps expose .toDate(); revive stored epoch ms the same way
// so screens like History can format dates without changes.
function revive(list: any[]) {
  return list
    .map((d: any) => ({
      ...d,
      createdAt: d.createdAt
        ? { toDate: () => new Date(d.createdAt) }
        : undefined,
    }))
    .sort((a: any, b: any) => (b._ts || 0) - (a._ts || 0));
}

function userCol(name: string) {
  const uid = auth!.currentUser?.uid;
  if (!uid) throw new Error('Not signed in yet.');
  return collection(db!, 'users', uid, name);
}

function userDoc(name: string, id: string) {
  const uid = auth!.currentUser?.uid;
  if (!uid) throw new Error('Not signed in yet.');
  return doc(db!, 'users', uid, name, id);
}

export async function saveDoc(col: string, data: DocumentData): Promise<string> {
  if (DEMO_MODE) {
    const arr = await demoRead(col);
    const id = 'demo-' + Date.now().toString(36);
    const ts = Date.now();
    arr.push({ ...data, id, createdAt: ts, _ts: ts });
    await demoWrite(col, arr);
    return id;
  }
  const ref = await addDoc(userCol(col), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function listDocs(col: string): Promise<(DocumentData & { id: string })[]> {
  if (DEMO_MODE) return revive(await demoRead(col));
  const q = query(userCol(col), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateDocById(col: string, id: string, data: DocumentData) {
  if (DEMO_MODE) {
    const arr = await demoRead(col);
    const i = arr.findIndex((d: any) => d.id === id);
    if (i >= 0) {
      arr[i] = { ...arr[i], ...data, _ts: Date.now() };
      await demoWrite(col, arr);
    }
    return;
  }
  await updateDoc(userDoc(col, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocById(col: string, id: string) {
  if (DEMO_MODE) {
    const arr = await demoRead(col);
    await demoWrite(
      col,
      arr.filter((d: any) => d.id !== id)
    );
    return;
  }
  await deleteDoc(userDoc(col, id));
}

// ---- Convenience wrappers ----

// Health risk assessments: { module, answers, risk, recommendations, lang }
export const saveAssessment = (d: DocumentData) => saveDoc('assessments', d);
export const getAssessments = () => listDocs('assessments');

// Scan results: { kind: 'skin'|'report'|'xray', result, lang }
export const saveScan = (d: DocumentData) => saveDoc('scans', d);
export const getScans = () => listDocs('scans');

// Reminders: { title, time, icon, on }
export const addReminder = (d: DocumentData) => saveDoc('reminders', d);
export const getReminders = () => listDocs('reminders');
export const toggleReminder = (id: string, on: boolean) =>
  updateDocById('reminders', id, { on });
export const deleteReminder = (id: string) => deleteDocById('reminders', id);

// AI chat sessions: { messages: [{r, x}], lang }
export const saveChatSession = (d: DocumentData) => saveDoc('chats', d);
export const getChatSessions = () => listDocs('chats');
