"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { IoDocumentTextSharp } from "react-icons/io5";
import { RiPlantFill } from "react-icons/ri";
import { FaHandshake } from "react-icons/fa";
import { BiChevronDown } from "react-icons/bi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openModal } from "@/store/modalSlice";
import { planLoaded } from "@/store/userSlice";
import { setPlan } from "@/lib/userData";
import type { Plan } from "@/lib/types";
import Footer from "@/components/Footer";

type Choice = "yearly" | "monthly";
const PLAN_FOR: Record<Choice, Plan> = { yearly: "premium-plus", monthly: "premium" };
const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

const FAQ = [
  {
    q: "How does the free 7-day trial work?",
    a: "Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation to continue your subscription, and you will only be billed when the trial period expires. With Premium access, you can learn at your own pace and as frequently as you desire, and you may terminate your subscription prior to the conclusion of the 7-day free trial.",
  },
  {
    q: "Can I switch subscriptions from monthly to yearly, or yearly to monthly?",
    a: "While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the current month ends, transitioning from a monthly plan to an annual plan is an option.",
  },
  {
    q: "What's included in the Premium plan?",
    a: "Premium membership provides you with the ultimate Summarist experience, including unrestricted entry to many best-selling books high-quality audio, the ability to download titles for offline reading, and the option to send your reads to your Kindle.",
  },
  {
    q: "Can I cancel during my trial or subscription?",
    a: "You will not be charged if you cancel your trial before its conclusion. While you will not have complete access to the entire Summarist library, you can still expand your knowledge with one curated book per day.",
  },
];

function ChoosePlan() {
  const [choice, setChoice] = useState<Choice>("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useSearchParams();
  const { status, uid, email } = useAppSelector((s) => s.user);

  // Returning from Stripe Checkout: confirm the session server-side, then record the plan.
  const sessionId = params.get("session_id");
  useEffect(() => {
    if (!sessionId || status !== "authenticated" || !uid) return;
    (async () => {
      setBusy(true);
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
        const body = await res.json();
        if (!res.ok || !body.ok || body.uid !== uid) throw new Error(body.error || "Payment could not be confirmed");
        await setPlan(uid, body.plan as Plan);
        dispatch(planLoaded(body.plan as Plan));
        router.replace("/for-you");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment could not be confirmed");
        setBusy(false);
      }
    })();
  }, [sessionId, status, uid, dispatch, router]);

  async function subscribe() {
    if (status !== "authenticated" || !uid) {
      dispatch(openModal("login"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (STRIPE_ENABLED) {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ choice, uid, email }),
        });
        const body = await res.json();
        if (!res.ok || !body.url) throw new Error(body.error || "Checkout is unavailable");
        window.location.assign(body.url);
        return;
      }
      // Without Stripe keys the upgrade is recorded directly (test mode).
      await setPlan(uid, PLAN_FOR[choice]);
      dispatch(planLoaded(PLAN_FOR[choice]));
      router.push("/for-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="wrapper wrapper__full">
      <div className="sidebar__overlay sidebar__overlay--hidden" />
      <div className="plan">
        <div className="plan__header--wrapper">
          <div className="plan__header">
            <div className="plan__title">Get unlimited access to many amazing books to read</div>
            <div className="plan__sub--title">Turn ordinary moments into amazing learning opportunities</div>
            <figure className="plan__img--mask">
              <Image src="/assets/pricing-top.png" alt="Pricing" width={860} height={722} priority />
            </figure>
          </div>
        </div>
        <div className="row">
          <div className="container">
            <div className="plan__features--wrapper">
              <div className="plan__features">
                <figure className="plan__features--icon">
                  <IoDocumentTextSharp />
                </figure>
                <div className="plan__features--text">
                  <b>Key ideas in few min</b> with many books to read
                </div>
              </div>
              <div className="plan__features">
                <figure className="plan__features--icon">
                  <RiPlantFill />
                </figure>
                <div className="plan__features--text">
                  <b>3 million</b> people growing with Summarist everyday
                </div>
              </div>
              <div className="plan__features">
                <figure className="plan__features--icon">
                  <FaHandshake />
                </figure>
                <div className="plan__features--text">
                  <b>Precise recommendations</b> collections curated by experts
                </div>
              </div>
            </div>

            <div className="section__title">Choose the plan that fits you</div>
            <button
              type="button"
              className={`plan__card ${choice === "yearly" ? "plan__card--active" : ""}`}
              onClick={() => setChoice("yearly")}
            >
              <div className="plan__card--circle">{choice === "yearly" && <div className="plan__card--dot" />}</div>
              <div className="plan__card--content">
                <div className="plan__card--title">Premium Plus Yearly</div>
                <div className="plan__card--price">$99.99/year</div>
                <div className="plan__card--text">7-day free trial included</div>
              </div>
            </button>
            <div className="plan__card--separator">
              <div className="plan__separator">or</div>
            </div>
            <button
              type="button"
              className={`plan__card ${choice === "monthly" ? "plan__card--active" : ""}`}
              onClick={() => setChoice("monthly")}
            >
              <div className="plan__card--circle">{choice === "monthly" && <div className="plan__card--dot" />}</div>
              <div className="plan__card--content">
                <div className="plan__card--title">Premium Monthly</div>
                <div className="plan__card--price">$9.99/month</div>
                <div className="plan__card--text">No trial included</div>
              </div>
            </button>

            <div className="plan__card--cta">
              <span className="btn--wrapper">
                <button className="btn plan__cta--btn" onClick={subscribe} disabled={busy}>
                  <span>
                    {busy ? "Please wait…" : choice === "yearly" ? "Start your free 7-day trial" : "Start your first month"}
                  </span>
                </button>
              </span>
              {error && <div className="plan__error">{error}</div>}
              <div className="plan__disclaimer">
                {choice === "yearly"
                  ? "Cancel your trial at any time before it ends, and you won’t be charged."
                  : "30-day money back guarantee, no questions asked."}
              </div>
            </div>

            <div className="faq__wrapper">
              {FAQ.map((item, i) => (
                <div className="accordion__card" key={item.q}>
                  <button
                    type="button"
                    className="accordion__header"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <div className="accordion__title">{item.q}</div>
                    <BiChevronDown className={`accordion__icon ${openFaq === i ? "accordion__icon--rotate" : ""}`} />
                  </button>
                  <div className={`collapse ${openFaq === i ? "show" : ""}`}>
                    <div className="accordion__body">
                      <div className="accordion__body-text">{item.a}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function ChoosePlanPage() {
  return (
    <Suspense>
      <ChoosePlan />
    </Suspense>
  );
}
