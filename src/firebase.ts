import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc,
  getDocFromServer
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
    reports.push(docSnap.data() as StructuredReport);
  });
  return reports;
}

// Save/Update report to Firestore
export async function saveReportToFirestore(report: StructuredReport): Promise<void> {
  const docRef = doc(db, "reports", report.id);
  await setDoc(docRef, report, { merge: true });
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
