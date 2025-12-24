using CafeOrderSystem.Api.Data;
using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Models;
using CafeOrderSystem.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CafeOrderSystem.Api.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _repo;
        private readonly ICartService _cartService;
        private readonly AppDbContext _context;

        public OrderService(IOrderRepository repo, ICartService cartService, AppDbContext context)
        {
            _repo = repo;
            _cartService = cartService;
            _context = context;
        }

        public async Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto dto)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.Id == dto.CartId);

            if (cart == null)
                return null!;

            var order = new Order
            {
                UserId = userId,
                Notes = dto.Notes,
                Type = dto.Type,
                PaymentMethod = dto.PaymentMethod,
                Items = cart.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity,
                    UnitPrice = i.Product.Price
                }).ToList()
            };

            decimal totalAmount = 0;
            foreach (var item in order.Items)
            {
                totalAmount += item.UnitPrice * item.Quantity;
            }
            order.TotalAmount = totalAmount;

            await _repo.AddAsync(order);
            await _cartService.ClearCartAsync(cart);
            await tx.CommitAsync();

            return new OrderDto
            {
                Id = order.Id,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                Notes = order.Notes,
                Type = order.Type,
                PaymentMethod = order.PaymentMethod,
                Items = order.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity
                }).ToList()
            };
        }

        public async Task<List<OrderDto>> GetUserOrdersAsync(string userId)
        {
            var orders = await _repo.GetOrdersByUserAsync(userId);
            if (orders == null)
                return null!;
            return orders.Select(o => new OrderDto
            {
                Id = o.Id,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                CreatedAt = o.CreatedAt,
                Notes = o.Notes,
                Type = o.Type,
                PaymentMethod = o.PaymentMethod,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                }).ToList()
            }).ToList();
        }
    }
}
