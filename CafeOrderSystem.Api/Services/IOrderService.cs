using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Models;

namespace CafeOrderSystem.Api.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto dto);
        Task<List<OrderDto>> GetUserOrdersAsync(string userId);
        Task<OrderDto?> UpdateOrderStatusAsync(int orderId, OrderStatus status);
        Task<List<OrderDto>> GetAllOrdersAsync();
    }
}
