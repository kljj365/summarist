"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { makeStore } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import { planLoaded, signedIn, signedOut } from "@/store/userSlice";
import { firebaseAuth, firebaseConfigured } from "@/lib/firebase";
import { ensureUserDoc } from "@/lib/userData";

function AuthListener() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!firebaseConfigured) {
      dispatch(signedOut());
      return;
    }
    // One listener for the whole app, removed on unmount.
    return onAuthStateChanged(firebaseAuth(), async (user) => {
      if (!user) {
        dispatch(signedOut());
        return;
      }
      dispatch(signedIn({ uid: user.uid, email: user.email }));
      try {
        dispatch(planLoaded(await ensureUserDoc(user.uid, user.email)));
      } catch {
        dispatch(planLoaded("basic"));
      }
    });
  }, [dispatch]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // One store per browser session. The lazy initialiser runs only on the first render.
  const [store] = useState(makeStore);
  return (
    <Provider store={store}>
      <AuthListener />
      {children}
    </Provider>
  );
}
