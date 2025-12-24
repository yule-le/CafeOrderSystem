using CafeOrderSystem.Api.DTOs;
using CafeOrderSystem.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace CafeOrderSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var (result, token, username, role) = await _authService.LoginAsync(dto.Username, dto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToArray();

                return BadRequest(new
                {
                    success = false,
                    message = "Login failed",
                    errors
                });
            }

            return Ok(new
            {
                success = true,
                data = new LoginResponseDto
                {
                    Token = token!,
                    Username = username!,
                    Role = role!
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto.Username, dto.Email, dto.Password);

            if(!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToArray();

                return BadRequest(new
                {
                    success = false,
                    message = "Registration failed",
                    errors
                });
            }

            return Ok(new 
            { 
                success = true,
                message = "Register successful"
            });
        }
    }
}
