# Payments

## Decision Tree
- Web subscriptions? → Stripe Checkout + Billing
- Web one-time payments? → Stripe Payment Links / Checkout
- Web3 native tokens? → Direct contract via wagmi/viem
- Web3 + fiat hybrid? → Stripe for fiat + on-chain for crypto
- Mobile in-app purchases? → Expo IAP (required by App Store / Play Store)

## Why
- Stripe is the default for fiat — best DX, best docs, handles tax/compliance
- Payment Links let you skip building a checkout UI entirely for simple cases
- Stripe Billing handles subscription lifecycle (trials, upgrades, cancellations, invoices)
- Mobile stores require their own IAP — you cannot use Stripe for digital goods on iOS/Android
- For Web3, keep fiat and crypto paths separate — don't try to unify them into one flow

## Patterns

### Stripe Webhook Handler (TypeScript)

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Provision access for session.customer
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // Update subscription status in your DB
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // Notify customer, handle grace period
      break;
    }
    default:
      // Unhandled event type — log and move on
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
```

## Rules
- Always verify webhook signatures — never trust raw POST bodies
- Use `req.text()` not `req.json()` for webhook body — Stripe needs the raw string
- Store Stripe customer ID in your user table — don't look it up by email
- Idempotency: webhook handlers must be safe to run multiple times for the same event
- Never put Stripe secret keys in client code — server-side only
- **Sanitize redirect URLs before passing to Stripe.** `success_url`, `cancel_url`, and `return_url` must be normalized via `new URL(envVar).origin` — never raw-concatenate an env var into the URL. Stripe rejects URLs with whitespace, trailing newlines, or unusual characters with `code: url_invalid`.
- **Surface Stripe error details in logs.** When catching a `StripeError`, log `error.code`, `error.param`, `error.type`, and `error.message` — not just `error`. Generic 500 responses are fine for the client, but the server log must contain enough to diagnose without re-running.
- **Stripe objects are mode-scoped.** Customer IDs, price IDs, and subscription IDs created with test keys do not exist under live keys (and vice-versa). When switching modes, treat the stored IDs as invalidated. Always confirm a stored `stripe_customer_id` resolves under the active key before reusing it.

## Gotchas (production-learned)

### `NEXT_PUBLIC_*` vars are inlined at build time
On Vercel (and any Next.js bundler), `NEXT_PUBLIC_*` env vars are substituted into the JS bundle at build time, not read at runtime. Changing the value in the dashboard without redeploying does nothing — the old value is still baked into the served bundle. Any fix to a `NEXT_PUBLIC_*` var requires a fresh deployment.

### `vercel env add` will silently store trailing newlines
If you pipe a value into `vercel env add` via `echo "value" | vercel env add NAME prod`, `echo` appends a `\n` and Vercel stores it. The newline survives into `process.env.NEXT_PUBLIC_APP_URL`, gets concatenated into `success_url`, and Stripe rejects the URL with `url_invalid`. The endpoint returns 500 in prod while the local dev server (with a clean `.env.local`) works perfectly.

**Defenses:**
- Use `printf "%s" "value" | vercel env add NAME prod` (no trailing newline) — or pipe from a file written without a final newline.
- After adding any env var, immediately `vercel env pull` and inspect the file. Note that `vercel env pull` escapes embedded newlines as the two characters `\n` inside double quotes — to detect this, look for `"...\\n"` at the end of a value line.
- Defend in code: wrap env-var URL reads in a `getAppUrl()` helper that does `new URL(candidate.trim()).origin`. This both trims and validates, and centralizes the fallback. See NewsBreef's `web/lib/app-url.ts` (May 2026 incident).

### Differential diagnostic signal: local works, prod fails
When the same code path passes locally and 500s in production, suspect **env-value corruption first** — before suspecting library version skew, framework behavior, or platform differences. The local `.env.local` is hand-edited and clean; the production env was probably set via a shell command and may contain whitespace or newlines you didn't intend. A two-minute `vercel env pull && cat -A .env.prod` catches most of these.

### Don't trust your own repro until it matches prod
While debugging the NewsBreef incident, an SDK replay using the same env var passed locally — because the harness's `clean()` helper trimmed the value before sending it. The production code path did not trim. When your reproduction script disagrees with prod, suspect the **reproduction**, not the platform. Strip any "helpful" sanitization out of the repro until it fails the same way prod does.

## Sources
- NewsBreef production incident, 2026-05-31 — trailing newline in `NEXT_PUBLIC_APP_URL` corrupted Stripe `success_url`; fix committed in `6616ae6` on `wswarren12/NewsBreef`.
