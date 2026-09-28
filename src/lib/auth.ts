"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { firebaseAuth } from "./firebase";

// The guest login uses one shared, documented demo account (as the Summarist brief specifies).
// If it doesn't exist yet in this Firebase project, the first guest login creates it.
export const GUEST_EMAIL = "guest@gmail.com";
const GUEST_PASSWORD = "guest123";

export async function loginWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(firebaseAuth(), email, password);
}

export async function registerWithEmail(email: string, password: string) {
  await createUserWithEmailAndPassword(firebaseAuth(), email, password);
}

export async function loginAsGuest() {
  const auth = firebaseAuth();
  try {
    await signInWithEmailAndPassword(auth, GUEST_EMAIL, GUEST_PASSWORD);
  } catch (error) {
    const code = error instanceof FirebaseError ? error.code : "";
    if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
      await createUserWithEmailAndPassword(auth, GUEST_EMAIL, GUEST_PASSWORD);
      return;
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(firebaseAuth(), email);
}

export async function logout() {
  await signOut(firebaseAuth());
}

// The brief names three messages: invalid email, short password, and user not found.
export function authErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : "";
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email";
    case "auth/weak-password":
    case "auth/missing-password":
      return "Password should be at least 6 characters";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "User not found";
    case "auth/email-already-in-use":
      return "Email already in use";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in window was closed";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled yet";
    case "auth/unauthorized-domain":
      return "This site isn't authorised for Google sign-in yet";
    case "auth/too-many-requests":
      return "Too many attempts — try again in a minute";
    default:
      return error instanceof Error ? error.message : "Something went wrong";
  }
}
