import Stripe from "stripe";

// Creates a Stripe Checkout session in test mode. Needs STRIPE_SECRET_KEY plus the two price IDs
// (STRIPE_PRICE_YEARLY with a 7-day trial, STRIPE_PRICE_MONTHLY) in the environment.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const prices = { yearly: process.env.STRIPE_PRICE_YEARLY, monthly: process.env.STRIPE_PRICE_MONTHLY };
  if (!secret || !prices.yearly || !prices.monthly) {
    return Response.json({ error: "Payments aren't configured yet" }, { status: 503 });
  }
  const { choice, uid, email } = (await request.json()) as { choice?: string; uid?: string; email?: string };
  if ((choice !== "yearly" && choice !== "monthly") || !uid) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const stripe = new Stripe(secret);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  const plan = choice === "yearly" ? "premium-plus" : "premium";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: prices[choice], quantity: 1 }],
      subscription_data:
        choice === "yearly" ? { trial_period_days: 7, metadata: { uid, plan } } : { metadata: { uid, plan } },
      client_reference_id: uid,
      customer_email: email || undefined,
      metadata: { uid, plan },
      success_url: `${origin}/choose-plan?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/choose-plan`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
