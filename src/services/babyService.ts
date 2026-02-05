import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function createBaby(householdId: string, name: string, dob: string) {
  const ref = await addDoc(collection(db, "babies"), {
    householdId,
    name,
    dob,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
