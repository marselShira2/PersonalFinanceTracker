using FinanceTracker.Server.Data.Dto; 
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using FinanceTracker.Server.Repositories;
using Microsoft.AspNetCore.Authorization;
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

   /*    [HttpPost("register")]
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
                Name = dto.Username,
                Email = dto.Email,
                Password = passwordHash
            };

            await _userRepository.AddUserAsync(user);

            return Ok(new { user.UserId, user.Name, user.Email });
        }*/

        [HttpGet("getAllUsers2")]
        public async Task<IActionResult> GetAllUserList()
        {
            // merr listen e userave
            var allUsers = await _userRepository.GetAllUsers();
            
            return Ok(allUsers);
        }

        [HttpPut("currency")]
        [Authorize]
        public async Task<IActionResult> UpdateDefaultCurrency([FromBody] UpdateCurrencyDto dto)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var oldCurrency = user.DefaultCurrency;
            user.DefaultCurrency = dto.Currency;
            await _userRepository.UpdateUserAsync(user);

            // Recalculate all transactions if currency changed
            if (oldCurrency != dto.Currency)
            {
                // This will reset conversion values, they'll be recalculated on next view
                var transactionRepo = HttpContext.RequestServices.GetRequiredService<ITransactionRepository>();
                await transactionRepo.RecalculateTransactionCurrenciesAsync(userId, dto.Currency);
            }

            return Ok(new { message = "Default currency updated successfully.", currency = dto.Currency });
        }

        [HttpGet("currency")]
        [Authorize]
        public async Task<IActionResult> GetDefaultCurrency()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized("Invalid user ID.");
            }

            var user = await _userRepository.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new { currency = user.DefaultCurrency });
        }



        private string ComputeSha256Hash(string rawData)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return Convert.ToBase64String(bytes);
        }
    }
}
