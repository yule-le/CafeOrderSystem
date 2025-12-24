using CafeOrderSystem.Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace CafeOrderSystem.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _config;

        public AuthService(UserManager<IdentityUser> userManager, IConfiguration config)
        {
            _userManager = userManager;
            _config = config;
        }

        public async Task<(IdentityResult Result, string? Token, string? Username, string? Role)> LoginAsync(string username, string password)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return (IdentityResult.Failed(new IdentityError
                {
                    Code = "InvalidLogin",
                    Description = "Invalid username or password"
                }), null, null, null);
            }

            var valid = await _userManager.CheckPasswordAsync(user, password);
            if (!valid)
            {
                return (IdentityResult.Failed(new IdentityError
                {
                    Code = "InvalidLogin",
                    Description = "Invalid username or password"
                }), null, null, null);
            }

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "Customer";

            var token = GenerateJwtToken(user, role);

            return (IdentityResult.Success, token, user.UserName, role);
        }

        private string GenerateJwtToken(IdentityUser user, string role)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var secret = jwtSettings["SecretKey"]
                ?? throw new ArgumentNullException("SecretKey not configured");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.Role, role)
            };

            var expiryMinutes = double.Parse(jwtSettings["ExpiryMinutes"] ?? "60");

            var token = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<IdentityResult> RegisterAsync(string username, string email, string password)
        {
            if (await _userManager.FindByEmailAsync(email) != null)
            {
                return IdentityResult.Failed(new IdentityError
                {
                    Code = "DuplicateEmail",
                    Description = "Email is already taken."
                });
            }

            var user = new IdentityUser
            {
                UserName = username,
                Email = email
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                return result;

            await _userManager.AddToRoleAsync(user, "Customer");
            return IdentityResult.Success;
        }

    }
}
