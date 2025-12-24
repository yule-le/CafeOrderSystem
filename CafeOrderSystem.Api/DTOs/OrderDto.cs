using CafeOrderSystem.Api.Models;

namespace CafeOrderSystem.Api.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public string? Notes { get; set; }
        public OrderType Type { get; set; } = OrderType.DineIn;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    }
}
