using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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
            return Ok(new { success = true, message = "Order placed successfully" });
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
    }
}
