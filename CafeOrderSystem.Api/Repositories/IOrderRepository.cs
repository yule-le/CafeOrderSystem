using CafeOrderSystem.Api.Models;

namespace CafeOrderSystem.Api.Repositories
{
    public interface IOrderRepository
    {
        Task<Order> AddAsync(Order order);
        Task<List<Order>> GetOrdersByUserAsync(string userId);
        Task SaveChangesAsync();
        Task<Order?> GetByIdAsync(int orderId);
        Task<List<Order>> GetAllAsync();
    }
}
