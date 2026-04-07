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

## Sources
[To be populated via ingest]
