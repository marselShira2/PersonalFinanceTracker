using FinanceTracker.Server.Data.Dto; 
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using FinanceTracker.Server.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace FinanceTracker.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserCreateDto dto)
        {
            // Check if email already exists
            var existingUser = await _userRepository.GetUserByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest("Email already in use");

            // Hash password (simple example)
            var passwordHash = ComputeSha256Hash(dto.Password);

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = passwordHash
            };

            await _userRepository.AddUserAsync(user);

            return Ok(new { user.Id, user.Username, user.Email });
        }

        private string ComputeSha256Hash(string rawData)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return Convert.ToBase64String(bytes);
        }
    }
}
