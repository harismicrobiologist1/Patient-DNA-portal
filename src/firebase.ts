import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  getDocFromServer,
  Firestore,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { PatientFullRecord } from "./types";
import { INITIAL_PATIENTS_DATABASE } from "./data/mockDatabase";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured, or default
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test per skill instructions
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("[Firebase] Successfully connected to live Firestore database.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("[Firebase] Offline note:", error.message);
    }
  }
}

const PATIENTS_COLLECTION = "patients";

/**
 * Save or update a patient record in Firestore
 */
export async function savePatientToFirestore(record: PatientFullRecord): Promise<void> {
  const dnaId = record.patient.dnaId;
  const patientDocRef = doc(db, PATIENTS_COLLECTION, dnaId);
  await setDoc(patientDocRef, {
    ...record,
    dnaId,
    fullName: record.patient.fullName,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Fetch a single patient by DNA ID directly from Firestore (supports millions of records globally)
 */
export async function getPatientFromFirestore(dnaId: string): Promise<PatientFullRecord | null> {
  try {
    const cleanId = (dnaId || "").trim();
    if (!cleanId) return null;
    const docSnap = await getDoc(doc(db, PATIENTS_COLLECTION, cleanId));
    if (docSnap.exists()) {
      return docSnap.data() as PatientFullRecord;
    }
  } catch (err) {
    console.warn(`[Firebase] Could not fetch patient ${dnaId}:`, err);
  }
  return null;
}

/**
 * Fetch all patients from Firestore
 */
export async function getAllPatientsFromFirestore(): Promise<Record<string, PatientFullRecord>> {
  const querySnapshot = await getDocs(collection(db, PATIENTS_COLLECTION));
  const result: Record<string, PatientFullRecord> = {};
  
  querySnapshot.forEach((document) => {
    const data = document.data() as PatientFullRecord;
    if (data && data.patient && data.patient.dnaId) {
      result[data.patient.dnaId] = data;
    }
  });

  return result;
}

/**
 * Subscribe to real-time updates of all patients across all devices
 */
export function subscribeToPatientsDirectory(
  onUpdate: (patients: Record<string, PatientFullRecord>) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PATIENTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const records: Record<string, PatientFullRecord> = {};
      snapshot.forEach((document) => {
        const data = document.data() as PatientFullRecord;
        if (data && data.patient && data.patient.dnaId) {
          records[data.patient.dnaId] = data;
        }
      });
      onUpdate(records);
    },
    (err) => {
      console.error("[Firebase] Firestore directory subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Seed initial baseline demo account into Firestore if empty
 */
export async function seedInitialFirestorePatientsIfEmpty() {
  try {
    // Check if primary account exists
    const harisSnap = await getDoc(doc(db, PATIENTS_COLLECTION, "DNA-PK-26-10025"));
    if (!harisSnap.exists()) {
      const harisRecord = INITIAL_PATIENTS_DATABASE["DNA-PK-26-10025"];
      if (harisRecord) {
        console.log("[Firebase] Seeding baseline profile to Firestore...");
        await savePatientToFirestore(harisRecord);
      }
    }
  } catch (err) {
    console.warn("[Firebase] Seed check note:", err);
  }
}

