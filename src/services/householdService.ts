import { db } from "../lib/firebase";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";

export async function ensureUserAndHousehold(uid: string, email: string) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  // If user already has a household, return it
  if (userSnap.exists()) {
    const data = userSnap.data() as any;
    if (data.householdId) return data.householdId as string;
  }

  // Create household
  const householdRef = await addDoc(collection(db, "households"), {
    createdAt: serverTimestamp(),
    memberUids: [uid],
  });

  // Create/update user doc
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email,
      householdId: householdRef.id,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      householdId: householdRef.id,
    });
  }

  return householdRef.id;
}
