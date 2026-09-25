import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
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
 * Seed initial baseline demo accounts into Firestore if empty or prune old demo records
 */
export async function seedInitialFirestorePatientsIfEmpty() {
  try {
    const existing = await getAllPatientsFromFirestore();
    const oldDemoIds = ["DNA-8924-9012", "DNA-4402-1920", "DNA-7718-9031", "DNA-TEST-26-99999"];

    // Delete previous demo accounts if present
    for (const oldId of oldDemoIds) {
      if (existing[oldId]) {
        try {
          await deleteDoc(doc(db, PATIENTS_COLLECTION, oldId));
          console.log(`[Firebase] Pruned old demo record ${oldId}`);
        } catch (delErr) {
          console.warn(`[Firebase] Could not delete old demo ${oldId}:`, delErr);
        }
      }
    }

    // Ensure Haris Amin (DNA-1629-3931) is seeded
    const harisRecord = INITIAL_PATIENTS_DATABASE["DNA-1629-3931"];
    if (harisRecord && !existing["DNA-1629-3931"]) {
      console.log("[Firebase] Seeding Haris Amin demo profile to Firestore...");
      await savePatientToFirestore(harisRecord);
    }
  } catch (err) {
    console.warn("[Firebase] Seed check note:", err);
  }
}
