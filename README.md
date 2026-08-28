# 🪑 Anita Furniture

A modern, Gen-Z-friendly furniture e-commerce platform. Customers can browse a
catalogue **or** place **custom orders** by uploading photos and describing what
they want **by voice in Hindi, English, or any Indian language**. Admins review
requests, set prices, negotiate with customers, and manage the store.

Built with **Next.js 14**, **MongoDB**, **Google OAuth**, **Razorpay**, and
**freeimage.host**.

---

## ✨ Features

- **Google sign-in** (NextAuth) — first login with `ADMIN_EMAIL` becomes admin
- **Catalogue** — browse and instantly order ready-made pieces
- **Custom orders** — upload 2–3 photos + describe by **voice** (Web Speech API,
  8 Indian languages) or type
- **Price negotiation workflow**:
  1. Customer submits → `pending`
  2. Admin approves & sets a price → `price_set`
  3. Customer **accepts** (→ pay) or **counters** with their own price
  4. Admin responds to the counter → customer pays
- **Razorpay checkout** with server-side signature verification
- **Admin panel** — dashboard stats, order management, user roles, catalogue CRUD
- **Warm earthy design** with Framer Motion animations, glassmorphism, and
  micro-interactions

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client |
| `ADMIN_EMAIL` | Your Google email (auto-promoted to admin) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) → API Keys (use `rzp_test_` for testing) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` |
| `FREEIMAGE_HOST_API_KEY` | [freeimage.host/page/api](https://freeimage.host/page/api) |

**Google OAuth redirect URI** to add in the console:
`http://localhost:PORT/api/auth/callback/google` (replace PORT with your dev port, usually 3000)

### 3. Seed sample catalogue (optional)

```bash
npm run seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:PORT](http://localhost:PORT) (default port 3000).

---

## 🧭 Routes

| Route | Description |
|---|---|
| `/` | Home / hero |
| `/catalogue` · `/catalogue/[id]` | Browse & order catalogue |
| `/custom-order` | Multi-step custom request (images + voice) |
| `/orders` · `/orders/[id]` | Customer orders & price negotiation |
| `/admin` | Dashboard (admin only) |
| `/admin/orders` · `/admin/orders/[id]` | Review, approve, price orders |
| `/admin/catalogue` | Catalogue CRUD |
| `/admin/users` | Manage user roles & access |

---

## 🧪 Testing the full flow

1. Sign in with your `ADMIN_EMAIL` account → you're an admin.
2. Add catalogue items in `/admin/catalogue` (or run `npm run seed`).
3. Sign in as a **different** Google account (customer) in another browser.
4. Place a **custom order**: upload 2 images, tap **Speak** (try Hindi), submit.
5. As admin, open `/admin/orders`, approve, and set a price.
6. As customer, open the order → **counter** with a lower price.
7. As admin, respond with a final price.
8. As customer, **accept & pay** with a Razorpay test card
   (`4111 1111 1111 1111`, any future expiry, any CVV).
9. Watch status flip to **Paid**; admin can mark **In Production** → **Completed**.

---

## 📦 Deploying to Vercel

1. Push to GitHub and import into [Vercel](https://vercel.com).
2. Add all env vars from `.env.local` in Project Settings.
3. Set `NEXTAUTH_URL` to your production URL and add the matching Google OAuth
   redirect URI (`https://yourdomain.com/api/auth/callback/google`).
4. Images are hosted on freeimage.host, so no filesystem config is needed.

---

## 🗂️ Tech Stack

Next.js 14 · React 18 · MongoDB + Mongoose · NextAuth (Google) · Razorpay ·
freeimage.host · Tailwind CSS · Framer Motion · Web Speech API · Sonner · Zod

---

Made with 🤎 for Anita Furniture.
