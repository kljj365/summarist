import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Plan } from "@/lib/types";

// `loading` means Firebase hasn't answered yet — it must not be treated as "signed out",
// or protected pages would flash their logged-out state on every refresh.
export type AuthStatus = "loading" | "signedOut" | "authenticated";

interface UserState {
  status: AuthStatus;
  uid: string | null;
  email: string | null;
  plan: Plan;
  // The plan arrives from Firestore a moment after sign-in; gates wait for it.
  planReady: boolean;
}

const initialState: UserState = { status: "loading", uid: null, email: null, plan: "basic", planReady: false };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signedIn(state, action: PayloadAction<{ uid: string; email: string | null }>) {
      state.status = "authenticated";
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.planReady = false;
    },
    signedOut(state) {
      state.status = "signedOut";
      state.uid = null;
      state.email = null;
      state.plan = "basic";
      state.planReady = true;
    },
    planLoaded(state, action: PayloadAction<Plan>) {
      state.plan = action.payload;
      state.planReady = true;
    },
  },
});

export const { signedIn, signedOut, planLoaded } = userSlice.actions;
export default userSlice.reducer;
