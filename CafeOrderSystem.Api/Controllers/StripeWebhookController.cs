using CafeOrderSystem.Api.Data;
using CafeOrderSystem.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace CafeOrderSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeWebhookController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public StripeWebhookController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> Index()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];
            var webhookSecret = _configuration["Stripe:WebhookSecret"];

            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);
            }
            catch (Exception e)
            {
                return BadRequest($"Webhook error: {e.Message}");
            }

            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;

            if (paymentIntent != null && paymentIntent.Metadata.TryGetValue("OrderId", out var orderIdStr))
            {
                if (int.TryParse(orderIdStr, out var orderId))
                {
                    var order = await _context.Orders.FindAsync(orderId);
                    if (order != null)
                    {
                        if (stripeEvent.Type == "payment_intent.succeeded")
                        {
                            order.Status = OrderStatus.Paid;
                            order.FailureReason = null;
                        }
                        else if (stripeEvent.Type == "payment_intent.payment_failed")
                        {
                            order.Status = OrderStatus.Failed;
                            order.FailureReason = paymentIntent.LastPaymentError?.Message;
                        }

                        await _context.SaveChangesAsync();
                    }
                }
            }

            return Ok();
        }
    }
}
