using Microsoft.AspNetCore.Identity;

namespace CafeOrderSystem.Api.Services
{
    public interface IAuthService
    {
        Task<(IdentityResult Result, string? Token, string? Username, string? Role)> LoginAsync(string username, string password);
        Task<IdentityResult> RegisterAsync(string username, string email, string password);
    }
}
