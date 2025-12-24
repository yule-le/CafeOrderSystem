using CafeOrderSystem.Api.Models;

namespace CafeOrderSystem.Api.DTOs
{
    public class CreateOrderDto
    {
        public int CartId { get; set; }
        public string? Notes { get; set; }
        public OrderType Type { get; set; } = OrderType.DineIn;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    }
}
