# TECH TALK (T1–T5) — CafeOrderSystem

This is **spoken-style English material** you can use in technical conversations and interviews.
Everything here is based on what can be confirmed from the code in this repo.

---

## T1｜System architecture (high-level technical overview)

### What the system is made of (modules + responsibilities)

- **Web client (React + TypeScript)**
  - Renders the customer/admin UI as a single-page app.
  - Drives the user journey: browse products → manage cart → checkout → view orders.
  - Sends HTTP requests to the backend API and attaches a JWT when available.

- **Backend API (ASP.NET Core Web API)**
  - Exposes REST endpoints for auth, products, cart, orders, and payments.
  - Enforces role-based access on sensitive endpoints (admin vs customer).
  - Orchestrates business workflows via service classes.

- **Business layer (Services + a small Repository layer)**
  - Implements the “business rules” like creating an order from a cart and validating allowed status changes.
  - Uses a repository abstraction for orders, and uses the database context directly for other aggregates.

- **Data layer (EF Core + SQLite)**
  - Persists products, carts, orders, and items.
  - Uses ASP.NET Identity tables for users and roles.

- **Auth & identity (ASP.NET Identity + JWT)**
  - Manages user accounts and roles.
  - Issues JWTs that carry user identity and role claims.

- **Payments (Stripe PaymentIntent + Webhook endpoint)**
  - Creates PaymentIntents for card payments.
  - Consumes Stripe webhook events to update order payment status.

- **API boundary helpers (DTOs + validation)**
  - Uses DTOs to shape API requests/responses instead of returning domain entities directly.
  - Uses FluentValidation to validate key inbound payloads (e.g., product creation, login/register).

- **Startup seeding**
  - On startup, seeds roles, a default admin user, and initial products.

### Relationships (how the pieces talk)

- The client talks to the backend via JSON over HTTP.
- The backend reads/writes data via EF Core.
- Stripe talks to the backend via webhooks; the backend treats that as the payment “source of truth”.

### Oral explanation version

If I zoom out, this is a classic full-stack setup.
A React single-page app calls a .NET Web API.
The API is split into controllers for HTTP, services for business rules, and EF Core for persistence.
Identity + JWT handles authentication, and roles split admin flows from customer flows.
For card payments, the backend creates Stripe PaymentIntents, and then a Stripe webhook updates the order status.

---

## T2｜Core technical workflow (happy path)

### Step-by-step (one successful end-to-end run)

1. **Backend starts up**
   - It wires up database access, Identity, JWT auth, and API routing.
   - It seeds roles, a default admin user, and a starter product catalog.

2. **User authenticates**
   - A customer registers or logs in.
   - The backend returns a JWT that represents the user and their role.

3. **Customer browses products**
   - The client requests the product list.
   - The backend returns a DTO list of products.

4. **Customer builds a cart**
   - The client adds items and updates quantities.
   - The backend stores the cart and cart items tied to the user.

5. **Customer creates an order from the cart** (system-required)
   - The client submits a “create order” request that points to the cart.
   - The backend copies cart items into order items, calculates a total, saves the order, and clears the cart.

6. **Payment path splits**
   - **Cash**: the order stays in a non-final state until staff updates it.
   - **Credit card**: the client asks the backend to create a Stripe PaymentIntent for that order.

7. **Customer completes card payment** (only for credit card)
   - The client confirms payment with Stripe using the PaymentIntent client secret.

8. **Stripe webhook updates order status** (system-required for card payments)
   - Stripe calls the webhook endpoint.
   - The backend verifies the Stripe signature and updates the order to `Paid` or `Failed`.

9. **Order visibility**
   - A customer can view their own order history.
   - An admin can view all orders and update order status (e.g., `Paid` → `Completed`).

### What’s mandatory vs optional

- **Mandatory for customer checkout**: a valid customer identity + a cart + order creation.
- **Mandatory for card payment correctness**: webhook confirmation, not client-side “success”.
- **Optional at checkout**: notes and order type (dine-in / takeaway).

### Oral walkthrough version

A happy path is: user logs in, browses products, adds a few items into the cart, and then checks out.
Checkout always creates an order first.
If they pay by card, the backend creates a Stripe PaymentIntent and the client confirms it.
Then Stripe calls back via webhook, and that’s what flips the order to Paid.
After that, the user can see the order in “My Orders”, and an admin can push it to Completed.

---

## T3｜Key technical design decisions (Why, not How)

### 1) DTOs as the API boundary
- **What the decision is**: The API returns DTOs rather than exposing EF Core entities directly.
- **Why it was made**: It keeps responses stable, avoids leaking internal fields, and avoids serialization pitfalls with navigation properties.
- **What would go wrong without it**: You risk circular references, accidental over-sharing of data, and breaking the client when the domain model changes.
- **Interview-ready oral answer**: “I keep a DTO boundary so the API contract stays clean and I don’t expose persistence details.”

### 2) Role-based access with JWT + Identity
- **What the decision is**: Authentication is JWT-based, and authorization is role-based (Admin vs Customer).
- **Why it was made**: It cleanly splits admin operations (manage products/orders) from customer operations (place/view orders).
- **What would go wrong without it**: Any client could call admin endpoints, or the server would need messy per-endpoint custom checks.
- **Interview-ready oral answer**: “JWT gives me a simple stateless auth story, and roles let me separate admin and customer workflows.”

### 3) Order creation is transactional and clears the cart
- **What the decision is**: Creating an order and clearing the cart happens together inside a database transaction.
- **Why it was made**: It prevents partial states like “order created but cart still full” when something fails mid-way.
- **What would go wrong without it**: Customers could accidentally place duplicate orders or end up with inconsistent cart/order states.
- **Interview-ready oral answer**: “I wrap ‘create order + clear cart’ in one transaction to keep the user’s state consistent.”

### 4) Payments are confirmed by Stripe webhooks
- **What the decision is**: The backend updates payment status based on webhook events, not based on what the client claims.
- **Why it was made**: The client is not a trusted source, and payments can succeed/fail asynchronously.
- **What would go wrong without it**: You can mark orders as paid when they’re not, or miss failures and have mismatched accounting.
- **Interview-ready oral answer**: “I treat Stripe webhooks as the source of truth, so payment status can’t be spoofed by the client.”

### 5) Snapshot pricing into `OrderItem.UnitPrice`
- **What the decision is**: Each order item stores the unit price at order time.
- **Why it was made**: Product prices can change, but old orders should keep their historical totals.
- **What would go wrong without it**: Past orders would ‘drift’ when product prices change, and totals become untrustworthy.
- **Interview-ready oral answer**: “I snapshot unit price into the order item so historical orders stay correct even if the catalog changes.”

---

## T4｜Data model & invariants

### Core data objects (conceptual)

- **User**
  - Represents an authenticated account.
  - Carries a role that controls what endpoints they can call.

- **Product**
  - A catalog item with name, category, price, and image.

- **Cart / CartItem**
  - A per-user working set.
  - Each cart item points to a product and a quantity.

- **Order / OrderItem**
  - A placed order with a status lifecycle.
  - Each order item stores product reference, quantity, and the unit price at the time of ordering.

- **Stripe PaymentIntent link**
  - Stripe metadata carries the order id.
  - The order can store a Stripe PaymentIntent id after successful payment.

### Invariants the system relies on

1. **A cart belongs to exactly one user**
   - If this is violated… one user could see or mutate another user’s cart, which is a security and correctness break.

2. **`Order.TotalAmount` matches the sum of its items**
   - The system calculates total from item price × quantity.
   - If this is violated… you charge the wrong amount and payment reconciliation becomes unreliable.

3. **Order items keep historical pricing**
   - `OrderItem.UnitPrice` is captured when the order is created.
   - If this is violated… old orders change when the product catalog changes, and refunds/receipts become incorrect.

4. **Only payable orders can create a PaymentIntent**
   - Card payment is only allowed when an order is in `Pending` and has a positive total.
   - If this is violated… you can create duplicate or invalid charges and break the order lifecycle.

### Oral explanation version

I think of the data model as three big areas: catalog, cart, and orders.
Products are the catalog.
Cart is the temporary working set tied to a single user.
Order is the durable record, and order items snapshot the price so history doesn’t change.
And for payments, an order is only payable in a specific state, and Stripe webhooks are what finalize that state.

---

## T5｜Implementation & extensibility

### How it’s implemented today (in practical terms)

- **Backend**
  - REST controllers for auth/products/cart/orders/payments.
  - Services for core business rules (cart logic, order creation, auth token issuing).
  - EF Core + SQLite for persistence.
  - Identity + JWT for authentication and role-based authorization.
  - Stripe PaymentIntent creation + webhook handler for payment results.

- **Frontend**
  - React Router pages for customer and admin flows.
  - Axios API layer; a request interceptor attaches the JWT from `localStorage`.
  - Stripe Elements UI for card payment entry.

### Replaceable / extensible parts

- **Database**: EF Core makes it straightforward to swap SQLite for a server database.
- **Payment logic**: the Stripe integration is already separated into “create intent” + “handle webhook”, so adding refunds or more event types is a natural extension.
- **Business rules**: services and interfaces provide seams for testing and for adding more workflows.

### Natural evolution paths

- **If requirements change and we need real-time status updates…**
  - Cannot be confirmed from code: the README mentions SignalR as “planned”, but there is no SignalR implementation in the current code.

- **If requirements change and we need stronger payment bookkeeping…**
  - Store and validate PaymentIntent ids consistently at creation time, add idempotency protection, and expand webhook handling beyond success/failure.

- **If requirements change and we need stricter security on cart endpoints…**
  - Enforce authentication at the cart API boundary consistently, since cart operations rely on a user identity claim.

### Oral explanation version

Implementation-wise, it’s a pretty straightforward split: React on the front, .NET Web API on the back.
I keep business rules in services so controllers stay thin.
EF Core handles persistence, and Identity + JWT handles who you are and what you’re allowed to do.
If the requirements grow, I’d first harden payments and state transitions, then add real-time updates, and finally swap SQLite for a production-grade database.
