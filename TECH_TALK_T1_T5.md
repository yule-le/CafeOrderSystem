# T1｜System architecture (high-level technical overview)
- **Modules**: ASP.NET Core API (controllers for auth, products, cart, orders, payments), service layer for business rules, repository for orders, EF Core/SQLite data layer with Identity, Stripe integration for payments, React + TypeScript client for UI and API calls.
- **Responsibilities**: Controllers handle HTTP and authorization, services orchestrate cart/order/payment logic, repository wraps order persistence, DbContext tracks entities, Stripe webhook reconciles payments, client handles browsing, checkout, and admin views.
- **Relations**: API exposes `/api/*` endpoints; services depend on DbContext/repository; authentication flows through JWT/Identity; Stripe webhooks call back into API to flip order states; client talks to API via axios with token interceptor.
- **Oral explanation version**: “We split it into a .NET API with controllers up front, services in the middle, EF Core plus Identity at the bottom, and a React client. Controllers gate requests with JWT roles, services talk to the DbContext and an order repository, Stripe sends webhooks back to mark payments, and the React app just calls those `/api` routes with a token.”

# T2｜Core technical workflow (happy path)
1. User registers or logs in; API issues a JWT that the client stores.
2. Client pulls the product list and product details to show the menu.
3. Authenticated customer adds items to their cart; cart is saved per user.
4. At checkout, client posts the cart and order preferences; service creates an order from cart items and clears the cart.
5. If paying by card, API creates a Stripe PaymentIntent; Stripe Elements collects the payment method.
6. Stripe processes payment and calls the webhook; API flips order status to Paid or Failed.
7. Customer views “My Orders”; admins can list all orders and adjust status (e.g., Completed).
- **Oral walkthrough version**: “Login to get a token, pull products, add to a user-scoped cart, post the cart to create an order, optionally get a PaymentIntent for card, let Stripe confirm, webhook updates the order, then customers see their orders and admins can close them out.”

# T3｜Key technical design decisions (Why, not How)
1. **Decision**: Use ASP.NET Identity plus JWT roles for auth gating.  
   **Why**: Built-in password management and role checks give secure separation between customers and admins at the controller level.  
   **Without it**: Any user could hit admin endpoints or fake roles by tweaking payloads.  
   **Interview-ready line**: “We leaned on Identity + JWT so role checks are enforced before business logic ever runs.”
2. **Decision**: Map entities to DTOs instead of returning EF models.  
   **Why**: Prevents navigation loops, hides internal fields, and keeps responses stable for the client.  
   **Without it**: You risk circular JSON, over-sharing Identity fields, and brittle client contracts.  
   **Interview-ready line**: “Every controller shapes a DTO so we don’t leak EF tracking state or Identity data.”
3. **Decision**: Wrap order creation and cart clearing in a single transaction.  
   **Why**: Ensures the cart-to-order conversion and total calculation commit together.  
   **Without it**: You could charge a customer and still leave items in the cart or lose part of the order.  
   **Interview-ready line**: “Order creation is transactional, so either we move items and clear the cart together, or nothing changes.”
4. **Decision**: Trust Stripe webhooks to finalize payment state.  
   **Why**: Payment success is confirmed server-to-server, avoiding client spoofing and timing issues.  
   **Without it**: Orders might stay Pending forever or be marked Paid without real funds captured.  
   **Interview-ready line**: “We wait for Stripe’s webhook to flip orders to Paid so the client can’t lie about payment.”

# T4｜Data model & invariants
- **Core objects**: Product (menu item with price/category), Cart and CartItem (user-scoped selections), Order and OrderItem (snapshot of products, quantities, unit prices), IdentityUser (authentication/roles), OrderStatus/OrderType/PaymentMethod enums.
- **Invariants**:  
  1) Cart operations are filtered by current user ID. If violated, one user could mutate another’s cart.  
  2) Order totals equal the sum of order item unit prices × quantities computed at creation time. If violated, payments and revenue reports diverge.  
  3) Payment actions only run when an order is Pending and amount > 0. If violated, you’d create intents for already processed or zero-value orders.  
  4) Webhook updates must match an order ID in PaymentIntent metadata. If violated, payments wouldn’t reconcile to orders.
- **Oral explanation version**: “Products are simple menu rows; carts are tied to a user; orders snapshot items and prices. We enforce user-scoped cart access, total equals item sums, only Pending orders can spawn payments, and Stripe metadata has to match an order so webhooks can flip the right record.”

# T5｜Implementation & extensibility
- **Current implementation**: ASP.NET Core controllers + services over EF Core/SQLite; Identity + JWT for auth; Stripe PaymentIntent + webhook for card flows; React + TypeScript front end calling axios with a token interceptor.
- **Extensible pieces**: Swap SQLite for PostgreSQL; add more repositories around services; plug in SignalR for live order status; expand payment providers by adding service abstractions.
- **If requirements change…**: If we need multi-tenant cafés, factor user/tenant filters into queries; if we add loyalty/discounts, extend the order builder to apply pricing rules before total calculation; if we need refunds, store Stripe intent IDs (already present) and add a refund service path.
- **Oral explanation version**: “It’s a standard ASP.NET/React stack today. We can swap the database, add real-time updates, or layer new pricing and refund rules because services already sit between controllers and EF. Stripe IDs are saved, so adding refunds or new payment rails is a natural next step.”
