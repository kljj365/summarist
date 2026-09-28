"use client";

import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { openModal } from "@/store/modalSlice";

export default function LoginPrompt({ message }: { message: string }) {
  const dispatch = useAppDispatch();
  return (
    <div className="settings__login--wrapper">
      <Image src="/assets/login.png" alt="Login" width={1033} height={712} className="settings__login--img" priority />
      <div className="settings__login--text">{message}</div>
      <button className="btn settings__login--btn" onClick={() => dispatch(openModal("login"))}>
        Login
      </button>
    </div>
  );
}
