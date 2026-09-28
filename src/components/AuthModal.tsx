"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AiOutlineClose } from "react-icons/ai";
import { BsPersonFill } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeModal, setView } from "@/store/modalSlice";
import {
  authErrorMessage,
  loginAsGuest,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  resetPassword,
} from "@/lib/auth";

export default function AuthModal() {
  const { isOpen, view } = useAppSelector((s) => s.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // Old errors shouldn't follow the user to another view or a re-opened modal.
  const screen = `${isOpen}:${view}`;
  const [lastScreen, setLastScreen] = useState(screen);
  if (screen !== lastScreen) {
    setLastScreen(screen);
    setError("");
    setNotice("");
  }

  // Escape closes the modal and the page behind it can't scroll while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dispatch(closeModal());
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      dispatch(closeModal());
      setPassword("");
      if (pathname === "/") router.push("/for-you");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (view === "login") run(() => loginWithEmail(email, password));
    else if (view === "register") run(() => registerWithEmail(email, password));
  }

  async function submitReset(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await resetPassword(email);
      setNotice("Check your inbox for a reset link.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const title =
    view === "login" ? "Log in to Summarist" : view === "register" ? "Sign up to Summarist" : "Reset your password";

  return (
    <div className="auth__wrapper" onMouseDown={() => dispatch(closeModal())}>
      <div className="auth" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="auth__content">
          <div className="auth__title">{title}</div>
          {error && <div className="auth__error">{error}</div>}
          {notice && <div className="auth__success">{notice}</div>}

          {view === "forgot" ? (
            <form className="auth__main--form" onSubmit={submitReset}>
              <input
                className="auth__main--input"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn" type="submit" disabled={busy}>
                <span>Send reset password link</span>
              </button>
            </form>
          ) : (
            <>
              {view === "login" && (
                <>
                  <button className="btn guest__btn--wrapper" disabled={busy} onClick={() => run(loginAsGuest)}>
                    <figure className="google__icon--mask guest__icon--mask">
                      <BsPersonFill />
                    </figure>
                    <div>Login as a Guest</div>
                  </button>
                  <div className="auth__separator">
                    <span className="auth__separator--text">or</span>
                  </div>
                </>
              )}
              <button className="btn google__btn--wrapper" disabled={busy} onClick={() => run(loginWithGoogle)}>
                <figure className="google__icon--mask">
                  <FcGoogle />
                </figure>
                <div>{view === "login" ? "Login with Google" : "Sign up with Google"}</div>
              </button>
              <div className="auth__separator">
                <span className="auth__separator--text">or</span>
              </div>
              <form className="auth__main--form" onSubmit={submit} noValidate>
                <input
                  className="auth__main--input"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="auth__main--input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn" type="submit" disabled={busy}>
                  <span>{busy ? "Please wait…" : view === "login" ? "Login" : "Sign up"}</span>
                </button>
              </form>
            </>
          )}
        </div>

        {view === "login" && (
          <button className="auth__forgot--password" onClick={() => dispatch(setView("forgot"))}>
            Forgot your password?
          </button>
        )}
        <button
          className="auth__switch--btn"
          onClick={() => dispatch(setView(view === "login" ? "register" : "login"))}
        >
          {view === "login" ? "Don't have an account?" : view === "register" ? "Already have an account?" : "Go to login"}
        </button>
        <button className="auth__close--btn" aria-label="Close" onClick={() => dispatch(closeModal())}>
          <AiOutlineClose />
        </button>
      </div>
    </div>
  );
}
