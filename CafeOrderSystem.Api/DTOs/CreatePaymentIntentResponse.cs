namespace CafeOrderSystem.Api.DTOs
{
    public class CreatePaymentIntentResponse
    {
        public required string ClientSecret { get; set; }
        public required string PaymentIntentId { get; set; }
    }
}
