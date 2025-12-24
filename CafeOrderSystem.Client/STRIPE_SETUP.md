# Stripe Payment Integration Setup

## Frontend Setup

### 1. Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/register
2. Create an account or login
3. Navigate to **Developers → API keys**
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)

### 2. Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder with your actual Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

3. Restart the development server after updating `.env`

### 3. Test Credit Card Numbers

Use these test card numbers in development:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

- Use any future expiry date (e.g., `12/34`)
- Use any 3-digit CVC (e.g., `123`)
- Use any valid ZIP code

## Backend Setup (Required)

The backend needs to:

1. **Install Stripe.net package**:

   ```bash
   dotnet add package Stripe.net
   ```

2. **Update CreateOrderDto** to accept `PaymentMethodId`:

   ```csharp
   public class CreateOrderDto
   {
       public int CartId { get; set; }
       public string? Notes { get; set; }
       public OrderType Type { get; set; }
       public PaymentMethod PaymentMethod { get; set; }
       public string? PaymentMethodId { get; set; }  // Add this
   }
   ```

3. **Process payment in OrdersController**:

   ```csharp
   if (dto.PaymentMethod == PaymentMethod.CreditCard && !string.IsNullOrEmpty(dto.PaymentMethodId))
   {
       // Initialize Stripe
       StripeConfiguration.ApiKey = "sk_test_your_secret_key";

       // Create charge
       var chargeOptions = new ChargeCreateOptions
       {
           Amount = (long)(totalAmount * 100), // Amount in cents
           Currency = "usd",
           Source = dto.PaymentMethodId,
           Description = $"Order #{orderId}"
       };

       var chargeService = new ChargeService();
       var charge = await chargeService.CreateAsync(chargeOptions);

       if (charge.Status != "succeeded")
       {
           return BadRequest("Payment failed");
       }
   }
   ```

4. **Store Stripe Secret Key** in `appsettings.json`:
   ```json
   {
     "Stripe": {
       "SecretKey": "sk_test_your_secret_key_here"
     }
   }
   ```

## How It Works

1. User selects "Credit Card" as payment method
2. Stripe card input form appears
3. User enters card details
4. Frontend creates a Stripe Payment Method (without charging)
5. Payment Method ID is sent to backend with order
6. Backend processes the actual charge using Stripe API
7. Order is created if payment succeeds

## Security Notes

- ⚠️ Never commit `.env` file with real keys to Git
- ✅ Use test keys (`pk_test_` and `sk_test_`) during development
- ✅ Switch to live keys (`pk_live_` and `sk_live_`) only in production
- ✅ Secret key (`sk_`) should NEVER be exposed to frontend
