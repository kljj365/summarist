import Stripe from "stripe";

// Confirms a finished Checkout session so the client can record the plan it paid for.
export async function GET(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return Response.json({ ok: false, error: "Payments aren't configured yet" }, { status: 503 });
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ ok: false, error: "Missing session" }, { status: 400 });
  try {
    const session = await new Stripe(secret).checkout.sessions.retrieve(sessionId);
    const complete = session.status === "complete";
    return Response.json(
      { ok: complete, uid: session.client_reference_id, plan: session.metadata?.plan ?? null },
      { status: complete ? 200 : 402 },
    );
  } catch {
    return Response.json({ ok: false, error: "Payment could not be confirmed" }, { status: 404 });
  }
}
