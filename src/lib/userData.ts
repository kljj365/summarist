"use client";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "./firebase";
import type { Book, LibraryEntry, Plan } from "./types";

// Firestore layout: users/{uid} holds the plan; users/{uid}/library/{bookId} holds one entry per
// book with `saved` and `finished` flags. Security rules only let a user touch their own tree.

export async function ensureUserDoc(uid: string, email: string | null): Promise<Plan> {
  const ref = doc(firestore(), "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { email, plan: "basic", createdAt: serverTimestamp() });
    return "basic";
  }
  return (snap.data().plan as Plan) ?? "basic";
}

export async function setPlan(uid: string, plan: Plan): Promise<void> {
  await updateDoc(doc(firestore(), "users", uid), { plan, planUpdatedAt: serverTimestamp() });
}

function entryFrom(book: Book): Omit<LibraryEntry, "saved" | "finished"> {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    subTitle: book.subTitle,
    imageLink: book.imageLink,
    audioLink: book.audioLink,
    averageRating: book.averageRating,
    subscriptionRequired: book.subscriptionRequired,
  };
}

export async function setSaved(uid: string, book: Book, saved: boolean): Promise<void> {
  await setDoc(
    doc(firestore(), "users", uid, "library", book.id),
    { ...entryFrom(book), saved, savedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function markFinished(uid: string, book: Book): Promise<void> {
  await setDoc(
    doc(firestore(), "users", uid, "library", book.id),
    { ...entryFrom(book), finished: true, finishedAt: serverTimestamp() },
    { merge: true },
  );
}

export function watchLibrary(uid: string, onChange: (entries: LibraryEntry[]) => void): Unsubscribe {
  return onSnapshot(collection(firestore(), "users", uid, "library"), (snap) => {
    onChange(
      snap.docs.map((d) => {
        const data = d.data();
        return { saved: false, finished: false, ...data, id: d.id } as LibraryEntry;
      }),
    );
  });
}

export function watchEntry(uid: string, bookId: string, onChange: (entry: LibraryEntry | null) => void): Unsubscribe {
  return onSnapshot(doc(firestore(), "users", uid, "library", bookId), (snap) => {
    onChange(snap.exists() ? ({ saved: false, finished: false, ...snap.data(), id: snap.id } as LibraryEntry) : null);
  });
}
