using CafeOrderSystem.Api.Data;
using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace CafeOrderSystem.Api.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-intent")]
        public async Task<IActionResult> CreatePaymentIntent(
        [FromBody] CreatePaymentIntentRequest request)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == request.OrderId);

            if (order == null)
            {
                return NotFound("Order not found.");
            }

            if (order.Status != OrderStatus.Pending)
            {
                return BadRequest("Order is not payable.");
            }

            if (order.TotalAmount <= 0)
            {
                return BadRequest("Invalid order amount.");
            }

            var amountInCents = (long)(order.TotalAmount * 100);

            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "nzd",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true
                },
                Metadata = new Dictionary<string, string>
            {
                { "OrderId", order.Id.ToString() }
            }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            var response = new CreatePaymentIntentResponse
            {
                ClientSecret = paymentIntent.ClientSecret,
                PaymentIntentId = paymentIntent.Id
            };

            return Ok(response);
        }
    }
}
