import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc,
  getDocFromServer,
  onSnapshot
} from "firebase/firestore";
import { StructuredReport } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyDUgDFApA1KaWflthS5ZgNPmHGT_-75dzA",
  authDomain: "gen-lang-client-0800311157.firebaseapp.com",
  projectId: "gen-lang-client-0800311157",
  storageBucket: "gen-lang-client-0800311157.firebasestorage.app",
  messagingSenderId: "39002113693",
  appId: "1:39002113693:web:7c78792d20a3e1c5f77674"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-investmentmemo-492e14ad-df26-4964-a576-fe89800cf58d");

export { db };

// Fetch all reports from Firestore
export async function getReportsFromFirestore(): Promise<StructuredReport[]> {
  const querySnapshot = await getDocs(collection(db, "reports"));
  const reports: StructuredReport[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    reports.push(deserializeReportFromFirestore(data));
  });
  return reports;
}

// Helper to recursively strip out any nested arrays from any object/array before writing to Firestore
function recursivelySanitize(val: any): any {
  if (val === null || val === undefined) return val;
  
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (Array.isArray(item)) {
        // Nested array found! Firestore doesn't support this. Convert to JSON string so it is flat.
        return JSON.stringify(item);
      }
      return recursivelySanitize(item);
    });
  }
  
  if (typeof val === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(val)) {
      cleaned[key] = recursivelySanitize(val[key]);
    }
    return cleaned;
  }
  
  return val;
}

// Helper to serialize nested arrays for Firestore (nested arrays are not supported natively)
function serializeReportForFirestore(report: StructuredReport): any {
  const serialized = JSON.parse(JSON.stringify(report));
  if (serialized.sections && Array.isArray(serialized.sections)) {
    serialized.sections = serialized.sections.map((section: any) => {
      if (!section) return { id: `sec-fallback-${Date.now()}`, title: "Untitled Section", content: "" };
      if (section.table && section.table.rows) {
        section.table.rowsJson = JSON.stringify(section.table.rows);
        delete section.table.rows;
      }
      return section;
    });
  }
  return recursivelySanitize(serialized);
}

// Helper to deserialize nested arrays back from Firestore
function deserializeReportFromFirestore(data: any): StructuredReport {
  const deserialized = { ...data };
  if (deserialized.sections && Array.isArray(deserialized.sections)) {
    deserialized.sections = deserialized.sections.map((section: any) => {
      if (!section) return { id: `sec-fallback-${Date.now()}`, title: "Untitled Section", content: "" };
      if (section.table && section.table.rowsJson) {
        try {
          section.table.rows = JSON.parse(section.table.rowsJson);
          delete section.table.rowsJson;
        } catch (e) {
          console.error("Failed to parse table rows JSON", e);
          section.table.rows = [];
        }
      }
      return section;
    });
  }
  return deserialized as StructuredReport;
}

// Save/Update report to Firestore
export async function saveReportToFirestore(report: StructuredReport): Promise<void> {
  const docRef = doc(db, "reports", report.id);
  const serialized = serializeReportForFirestore(report);
  await setDoc(docRef, serialized, { merge: true });
}

// Delete report from Firestore
export async function deleteReportFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, "reports", id);
  await deleteDoc(docRef);
}

// Validate connection to Firestore on boot
export async function validateConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test_connection", "ping"));
    return true;
  } catch (error) {
    console.warn("Firestore connection check info:", error);
    return false;
  }
}

// Subscribe to real-time updates from Firestore
export function subscribeReports(
  onUpdate: (reports: StructuredReport[]) => void,
  onError: (err: Error) => void
) {
  return onSnapshot(
    collection(db, "reports"),
    (querySnapshot) => {
      const reports: StructuredReport[] = [];
      querySnapshot.forEach((docSnap) => {
        reports.push(deserializeReportFromFirestore(docSnap.data()));
      });
      // Sort reports by updatedAt descending
      reports.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onUpdate(reports);
    },
    (error) => {
      onError(error);
    }
  );
}
