using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CafeOrderSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly UserManager<IdentityUser> _userManager;

        public CartController(ICartService cartService, UserManager<IdentityUser> userManager)
        {
            _cartService = cartService;
            _userManager = userManager;
        }

        private string GetUserId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var cart = await _cartService.GetCartAsync(GetUserId());
            return Ok(cart);
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem(AddCartItemDto dto)
        {
            await _cartService.AddItemAsync(GetUserId(), dto);
            return Ok();
        }

        [HttpPut("items/{id}")]
        public async Task<IActionResult> UpdateItem(int id, UpdateCartItemDto dto)
        {
            var updatedItem = await _cartService.UpdateItemAsync(GetUserId(), id, dto);
            return Ok(new
            {
                success = true,
                item = updatedItem
            });

        }

        [HttpDelete("items/{id}")]
        public async Task<IActionResult> RemoveItem(int id)
        {
            await _cartService.RemoveItemAsync(GetUserId(), id);
            return Ok();
        }
    }
}
