namespace CafeOrderSystem.Api.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public List<CartItem> Items { get; set; } = new();
    }
}
