# Summarist

Book summaries you can read or listen to. Built for the Frontend Simplified Advanced Virtual Internship: the brief was to rebuild the Summarist app from a live reference design and a books API.

**Live:** https://summarist-kljj365.vercel.app

## What it does

- **Home page:** the landing page with a login modal. The statistics headings take turns lighting up.
- **Auth modal:** email and password login and sign-up, Google sign-in, guest login (a documented demo account), and a password-reset email. The three errors the brief names show inline: invalid email, short password, and user not found. Escape or a click outside closes it. The page behind can't scroll while it's open. A successful login from the home page goes to `/for-you`.
- **For You:** the selected book plus recommended and suggested rows. Skeletons show while loading. Premium books carry a "Premium" pill until you subscribe.
- **Search:** debounced by 300 ms, so the API is called once you stop typing, not on every key. Results appear in a dropdown and each one links to its book page.
- **Book page:** stats, tags, the description and the author bio. Read and Listen follow three rules:
  - Signed out: the login modal opens.
  - A premium book on the Basic plan: you go to `/choose-plan`.
  - Otherwise: you go to the player.
- **Player:** the summary text with four text sizes. The audio player has play/pause, ±10 seconds, a seek bar and mm:ss times. When the audio ends, the book moves to Finished. The paywall is checked here too, so typing a premium book's player URL doesn't get around it.
- **My Library:** saved and finished books, stored in Firestore and updated live.
- **Settings:** your plan and email, with an upgrade button on Basic.
- **Choose plan:**
  - Premium Plus Yearly ($99.99, 7-day trial) or Premium Monthly ($9.99).
  - Checkout uses Stripe in test mode. Without Stripe keys, the upgrade is recorded straight away.
  - An FAQ accordion.
- **Responsive:** below 768px the sidebar becomes a drawer behind a hamburger, and the audio bar stacks.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| State | Redux Toolkit: slices for the modal, user and UI, plus **RTK Query** for the books API |
| Auth & data | Firebase Authentication and Cloud Firestore |
| Payments | Stripe Checkout (test mode) through Next.js route handlers |
| Icons | react-icons |
| Hosting | Vercel |

## How it's put together

```
src/
  app/
    page.tsx                 home (outside the app shell)
    choose-plan/page.tsx     pricing (outside the app shell)
    (app)/layout.tsx         route group: sidebar + search bar around every app page
    (app)/for-you, book/[id], player/[id], library, settings
    api/checkout/            Stripe session create + verify
  components/                AuthModal, Sidebar, SearchBar, AudioPlayer, BookCard, ...
  store/                     Redux store, slices, RTK Query api, typed hooks
  lib/                       firebase init, auth helpers, Firestore helpers, audio helpers
```

**Route group.** The home page and `/choose-plan` sit outside `(app)`, so they don't get the sidebar. Every other page shares one layout.

**Redux.** `modalSlice` tracks which modal view is open. `userSlice` holds the auth status, uid, email and plan. `uiSlice` holds the text size and the drawer state.

**Auth status has three values:** `loading`, `signedOut` and `authenticated`. "Still asking Firebase" and "definitely signed out" look the same if you only store the user, and a page would flash the wrong state.

**RTK Query.** The books endpoints are cached, so going back to For You doesn't refetch. The API's `status=selected` endpoint returns an array of one even though the docs say it returns an object, and `booksApi` handles both.

**One auth listener.** It lives in `Providers.tsx`: a single `onAuthStateChanged` inside the Redux `<Provider>`, removed on unmount. When a user signs in, it creates their Firestore profile if it's missing and loads the plan.

**Paywall.** Pages wait for `planReady` before making a paywall decision, so a subscriber never gets bounced to `/choose-plan` while their plan is still loading.

**Durations.** Durations aren't in the API. Each book's MP3 metadata is read once and cached per URL (`lib/audio.ts`).

### Firestore data

```
users/{uid}                    { email, plan: "basic" | "premium" | "premium-plus", createdAt }
users/{uid}/library/{bookId}   { title, author, imageLink, ..., saved, finished }
```

The rules in `firestore.rules` let each signed-in user read and write only their own documents.

## Running it locally

```bash
npm install
cp .env.example .env.local   # add the Firebase web config (and Stripe keys if you want checkout)
npm run dev
```

In the Firebase console, enable **Email/Password** and **Google** under Authentication → Sign-in method. Add your deployed domain under Authentication → Settings → Authorized domains, or Google sign-in won't work there.

The guest button signs in as `guest@gmail.com` / `guest123`. If that account doesn't exist yet, it's created on first use.

### Testing without the real Firebase project

The Firebase Emulator Suite runs auth and Firestore locally:

```bash
npx firebase-tools emulators:start --project demo-summarist
NEXT_PUBLIC_FIREBASE_EMULATORS=true npm run dev
```

All of these were tested this way:

- sign-up and login errors
- guest and Google login
- saving and finishing books
- the paywall, both from the book page and a typed player URL
- the upgrade
- logout

### Stripe (optional)

In the Stripe dashboard (test mode):

1. Create two recurring prices: $99.99/year and $9.99/month.
2. Add these environment variables:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_YEARLY=price_...
STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_ENABLED=true
```

To pay, use the test card `4242 4242 4242 4242` with any future date and any CVC.

## Known limits and what I'd do next

- **The plan is written from the browser.** After Stripe confirms the session, the client writes the plan to the user's profile. That's fine for a test-mode project. In production, a Stripe webhook would set the plan with the Firebase Admin SDK, and the security rules would block client writes to `plan`.
- **Highlights, Search (sidebar) and Help & Support are placeholders.** The reference build leaves them inactive too.

## Credits

The design, copy and books API (`us-central1-summaristt.cloudfunctions.net`) are by [Frontend Simplified](https://frontendsimplified.com). The styling deliberately matches the reference design, with the same class names and measurements. The components, state and data code are a new implementation.
