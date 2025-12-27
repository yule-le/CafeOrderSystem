using CafeOrderSystem.Api.Data;
using CafeOrderSystem.Api.Models;
using Stripe;

namespace CafeOrderSystem.Api.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;

        public PaymentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> CreatePaymentIntentAsync(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null || order.Status != OrderStatus.Pending)
                throw new Exception("Order not found or not payable.");

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(order.TotalAmount * 100), // cents
                Currency = "nzd",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true
                },
                Metadata = new Dictionary<string, string>
            {
                { "orderId", order.Id.ToString() }
            }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            return paymentIntent.ClientSecret;
        }
    }
}
