IcesoulMarket
Technical Documentation & README
Full-Stack E-Commerce Platform for Digital Call of Duty Goods
1. Project Overview
IcesoulMarket is a production-grade, full-stack e-commerce platform built to replace a legacy WordPress/WooCommerce storefront. It sells digital Call of Duty goods — premium accounts, weapon skins, UI themes, and COD Points — with instant digital delivery, manual bank-transfer payment verification, and a full administrative back office.
The platform was built as a custom application from the ground up, prioritizing performance, data integrity, and operational control that the previous WordPress installation could not reliably provide.
2. Technology Stack
2.1 Core Framework
Technology	    Purpose
Next.js 14      (App Router)	React framework — server-side rendering, routing, API routes, image       optimization
React 18	    UI component library
TypeScript	    Static typing across the entire codebase
Tailwind CSS	Utility-first styling framework
Framer Motion	Animations and page transitions

2.2 Backend & Data
Technology	                    Purpose
Supabase (PostgreSQL)	        Primary database, hosting, and backend-as-a-service
Supabase Auth	                User authentication, session management, JWT tokens
Supabase Storage	            Product image hosting (public storage bucket)
Row Level Security (RLS)	    Database-level access control enforced on every table
Postgres RPC Functions	        Controlled server-side operations (e.g. payment confirmation)

2.3 State Management & Client Libraries
Technology	                    Purpose
Zustand	                        Global client state — shopping cart, with localStorage persistence
TanStack Query (React Query)	Server-state caching and data fetching
Lucide React	                Icon library used throughout the UI

2.4 Third-Party Services
Service	                        Purpose
Vercel	                        Hosting, CI/CD, deployment, edge network
Resend	                        Transactional email delivery (order & payment notifications)
Namecheap / Cloudflare	        Domain registration and DNS management

2.5 Testing
Tool	                        Purpose
Playwright	                    End-to-end browser automation testing
Jest	                        Unit testing for pure business logic (pricing, discounts)
3. Architecture
3.1 Rendering Model
•	The application uses the Next.js App Router with a mix of Server Components (data-fetching pages) and Client Components (interactive UI: cart, forms, admin dashboards).
•	Server Components fetch data directly from Supabase using a server-side client that reads the user's session from cookies, allowing Row Level Security to correctly authorize requests.
•	Client Components use a separate browser-side Supabase client for real-time interactivity (add to cart, form submissions, live admin actions).
•	Key pages (product listings, product detail, admin dashboard) are explicitly configured with force-dynamic rendering to guarantee customers and admins always see live data rather than a stale cached snapshot.
3.2 Authentication & Authorization
•	Authentication is handled entirely by Supabase Auth (email/password).
•	Next.js Middleware runs on every request to protected routes (/checkout, /account, /admin), verifying the session server-side via getUser() before allowing access.
•	Role-based access (customer vs. admin) is stored on the profiles table (is_admin boolean) and enforced both in the UI and at the database layer via RLS policies.
•	A profiles row is auto-created on first login if one does not already exist, keyed to the Supabase Auth user ID.
3.3 Data Model (Core Tables)
Table	            Purpose
profiles	        User accounts, admin flag, username, contact info
products	        Product catalog — pricing, stock, images (array), category link
categories	        Product categories (Accounts, Skins, Themes, Points)
cart_items	        Persisted per-user shopping cart, synced with local storage
orders	            Order records with lifecycle status
order_items	        Line items per order, snapshotted at time of purchase
payments	        Payment records tied 1:1 to orders, tracks verification status
promo_codes	        Partner/affiliate discount codes with commission tracking
promo_code_usages	Audit log of every promo code redemption
reviews	            Verified-purchase product reviews and star ratings
messages	        Customer contact-form submissions
bank_settings	    Admin-configurable bank transfer details shown at payment
store_settings	    Store-wide configuration (default currency)
3.4 Order & Payment Lifecycle
Orders progress through a defined state machine, enforced by database check constraints:
•	payment_pending — order placed, awaiting customer bank transfer
•	pending_verification — customer confirmed payment sent, awaiting admin review
•	payment_approved — admin verified and approved the payment
•	processing — admin is fulfilling / delivering the order
•	completed — order fully delivered
•	payment_rejected / cancelled / refunded — terminal exception states
Payments follow a parallel status set (pending → pending_verification → approved/rejected), kept in sync with the parent order via the admin Payments dashboard.
3.5 Currency System
The store uses a single active currency (EUR by default), configurable by the admin via Settings without requiring a code change. Prices are stored as plain numeric values; a shared currency formatting utility and React hook (useCurrency) apply the correct symbol store-wide. This is a display-layer system — it does not perform live exchange-rate conversion.
3.6 Promo Code / Partner Commission System
Promo codes support percentage-based customer discounts and a separate partner commission percentage, allowing the store owner to run affiliate/streamer partnerships. Codes can optionally be restricted to a single product category (e.g. Accounts-only). When applied to a mixed cart, the discount is calculated only against eligible line items; commission is calculated against the pre-discount value of those same eligible items. Every redemption is logged to promo_code_usages for admin reporting.
3.7 Cart Persistence & Sync
The shopping cart is implemented with Zustand and localStorage persistence for guest users. On login, the guest cart is merged with any previously saved cart for that account (server-side, in Supabase) using an additive merge strategy, then the authoritative merged cart is written back to both the database and local state. Cart hydration from localStorage is tracked explicitly (hasHydrated flag) to prevent race conditions between page load, login redirects, and cart state resolution.
3.8 Image Handling
Product images are uploaded directly to a public Supabase Storage bucket (product-images) from the admin panel. Each product supports up to 20 images. The customer-facing product detail page renders these in a touch-swipeable gallery built with native CSS scroll-snap, with thumbnail navigation and arrow/dot controls.
4. Key Features
4.1 Customer-Facing
•	Product browsing with category filtering, search, sorting, and pagination
•	Multi-image product galleries with swipe/thumbnail navigation
•	Persistent, account-synced shopping cart
•	Guest checkout flow with mandatory login before payment
•	Promo code application with category-restricted, partial-cart discounts
•	Bank-transfer payment flow with manual admin verification
•	Order history and real-time order status tracking
•	Verified-purchase product reviews and star ratings
•	WhatsApp click-to-chat integration (footer and product pages)
•	Contact form with database-backed message storage
•	Fully responsive design, including a dedicated mobile hero layout
4.2 Administrative
•	Dashboard with live product, order, user, and revenue statistics
•	Product management — create, edit, delete, multi-image upload, featured/active flags, stock and discount pricing
•	Order management with status progression and cancellation confirmation
•	Payment approval workflow with automated customer email notifications
•	User management — role promotion/demotion, account deletion safeguards
•	Promo code creation with partner tracking, commission and usage reporting
•	Customer message inbox
•	Bank settings and store currency configuration
•	Collapsible sidebar navigation with persisted user preference
5. Email Notifications (Resend)
Transactional emails are sent via Resend through dedicated Next.js API routes, keeping the API key server-side only. Three notification events are wired:
•	Admin notified when a customer confirms a bank transfer was sent
•	Customer notified when their payment is approved
•	Customer notified when their payment is rejected
The Resend free tier (3,000 emails/month, 100/day) is in use; no paid plan is currently required. A verified sending domain is configured for production delivery to any recipient (sandbox mode otherwise restricts delivery to the account owner's email only).
6. SEO & Discoverability
•	Dynamic per-page metadata (title, description, Open Graph, Twitter Card) for the homepage, product listing, category, and individual product pages
•	Auto-generated sitemap.xml, rebuilt from live product and category data
•	robots.txt excluding private routes (/admin, /checkout, /account, /payment, /api) from indexing
•	Custom favicon and Open Graph share image
7. Environment Variables
The following environment variables must be configured in the deployment environment (Vercel Project Settings → Environment Variables):
Variable	                            Purpose
NEXT_PUBLIC_SUPABASE_URL	            Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY	        Supabase public anon key
RESEND_API_KEY	                        Resend API key (server-side only)
RESEND_FROM_EMAIL	                    Verified sender address for outgoing emails
ADMIN_EMAIL	                            Address that receives payment-submitted notifications
8. Deployment
•	Source control: GitHub
•	Hosting: Vercel, connected directly to the GitHub repository for continuous deployment on every push to the main branch
•	Custom domain: icesoulmarket.com, routed to Vercel via DNS records configured in Cloudflare (the domain's active DNS host)
•	SSL/HTTPS: automatically provisioned and renewed by Vercel
9. Known Technical Notes
•	categories.id is stored as a text column rather than uuid for historical reasons; foreign keys referencing it (e.g. promo_codes.restricted_category_id) must also use text to match.
•	Product pages and dashboard pages are explicitly marked force-dynamic to avoid Next.js serving stale cached data after admin updates; the admin panel additionally calls a revalidation API route after create/update/delete actions as a second layer of cache invalidation.
•	Automated Playwright test files, if retained in the repository, are development tooling only and are not part of the production build.


End of Technical Documentation


## Getting Started

First, install the dependencies
```bash
npm install

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

