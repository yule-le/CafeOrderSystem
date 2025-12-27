using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Models;
using CafeOrderSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe.Climate;

namespace CafeOrderSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _service;
        private readonly UserManager<IdentityUser> _userManager;

        public OrdersController(IOrderService service, UserManager<IdentityUser> userManager)
        {
            _service = service;
            _userManager = userManager;
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
        {
            var userId = _userManager.GetUserId(User)!;
            var order = await _service.CreateOrderAsync(userId, dto);
            if (order == null)
                return NotFound(new { message = $"Cart with ID {dto.CartId} not found" });
            return Ok(new 
            { 
                success = true, 
                message = "Order placed successfully",
                order = order
            });
        }

        // GET: api/orders
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _service.GetAllOrdersAsync();
            if (orders == null)
                return NotFound(new { message = $"Can not found any orders" });
            return Ok(new { success = true, orders });
        }

        [HttpGet("my-orders")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = _userManager.GetUserId(User);
            var orders = await _service.GetUserOrdersAsync(userId!);
            if (orders == null)
                return NotFound(new { message = $"Can not found any orders" });
            return Ok(new { success = true, orders });

        }

        [HttpPatch("{orderId}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] string newStatus)
        {
            if (!Enum.TryParse<OrderStatus>(newStatus, true, out var status))
                return BadRequest(new { message = "Invalid status" });

            try
            {
                var order = await _service.UpdateOrderStatusAsync(orderId, status);
                if (order == null) return NotFound(new { message = "Order not found" });

                return Ok(new { success = true, order });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
