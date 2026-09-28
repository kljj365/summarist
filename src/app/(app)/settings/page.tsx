"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import LoginPrompt from "@/components/LoginPrompt";
import Skeleton from "@/components/Skeleton";
import type { Plan } from "@/lib/types";

const PLAN_NAMES: Record<Plan, string> = { basic: "Basic", premium: "Premium", "premium-plus": "Premium Plus" };

export default function SettingsPage() {
  const { status, email, plan, planReady } = useAppSelector((s) => s.user);
  // Signed in but the plan hasn't come back from Firestore yet: show the skeleton, not "Basic".
  const loading = status === "loading" || (status === "authenticated" && !planReady);

  return (
    <div className="row">
      <div className="container">
        <div className="section__title page__title">Settings</div>
        {loading ? (
          <>
            <Skeleton height={20} width={220} />
            <Skeleton height={20} width={120} />
            <Skeleton height={20} width={260} />
          </>
        ) : status === "signedOut" ? (
          <LoginPrompt message="Log in to your account to see your details." />
        ) : (
          <>
            <div className="setting__content">
              <div className="settings__sub--title">Your Subscription plan</div>
              <div className="settings__text">{PLAN_NAMES[plan]}</div>
              {plan === "basic" && (
                <Link href="/choose-plan" className="btn settings__upgrade--btn">
                  Upgrade to Premium
                </Link>
              )}
            </div>
            <div className="setting__content">
              <div className="settings__sub--title">Email</div>
              <div className="settings__text">{email}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
