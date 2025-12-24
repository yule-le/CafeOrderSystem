using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Models;

namespace CafeOrderSystem.Api.Services
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(string userId);
        Task AddItemAsync(string userId, AddCartItemDto dto);
        Task<CartItemDto> UpdateItemAsync(string userId, int cartitemId, UpdateCartItemDto dto);
        Task RemoveItemAsync(string userId, int itemId);
        Task ClearCartAsync(Cart cart);
    }
}
