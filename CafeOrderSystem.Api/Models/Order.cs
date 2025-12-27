using Microsoft.AspNetCore.Identity;

namespace CafeOrderSystem.Api.Models
{
    public enum OrderStatus
    {
        Pending,
        Paid,
        Failed,
        Completed,
        Cancelled
    }
    public enum OrderType
    {
        DineIn,
        TakeAway
    }

    public enum PaymentMethod
    {
        Cash,
        CreditCard
    }
    public class Order
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public IdentityUser User { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<OrderItem> Items { get; set; } = new();
        public string? Notes { get; set; }
        public OrderType Type { get; set; } = OrderType.DineIn;
        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
        public string? FailureReason { get; set; }
    }
}
