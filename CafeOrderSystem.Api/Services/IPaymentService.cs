namespace CafeOrderSystem.Api.Services
{
    public interface IPaymentService
    {
        Task<string> CreatePaymentIntentAsync(int orderId);
    }
}
