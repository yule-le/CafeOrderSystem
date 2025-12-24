using CafeOrderSystem.Api.DTOs;

namespace CafeOrderSystem.Api.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto dto);
        Task<List<OrderDto>> GetUserOrdersAsync(string userId);
    }
}
