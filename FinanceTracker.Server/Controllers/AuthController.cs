using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using FinanceTracker.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using System.IdentityModel.Tokens.Jwt; 
using System.Security.Claims; 
using Microsoft.IdentityModel.Tokens; 
using System.Text; 
using Microsoft.Extensions.Configuration;
using FinanceTracker.Server.Services; 

namespace FinanceTracker.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IVerificationStore _verificationStore;

        public AuthController(IUserRepository userRepository, IPasswordHasher passwordHasher, IEmailService emailService, IConfiguration configuration, IVerificationStore verificationStore)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _emailService = emailService;
            _configuration = configuration;
            _verificationStore = verificationStore;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserCreateDto userDto)
        {
           
            if (!IsValidEmail(userDto.Email))
            {
                return BadRequest("Invalid email format.");
            }

            // Acceptance Criterion: Duplicate email accounts check
            var existingUser = await _userRepository.GetUserByEmailAsync(userDto.Email);
            if (existingUser != null)
            {
                return Conflict("An account with this email already exists.");
            }

            // Acceptance Criterion: Password strength requirements check
            var passwordValidationResult = IsPasswordStrong(userDto.Password);
            if (!passwordValidationResult.IsStrong)
            {
                return BadRequest(passwordValidationResult.ErrorMessage);
            }

            // Acceptance Criterion: Passwords must be stored in encrypted form
            string hashedPassword = _passwordHasher.HashPassword(userDto.Password);

            var newUser = new User
            {
               
                Name = userDto.Username,
                Email = userDto.Email,
                Password = hashedPassword
            };

            await _userRepository.AddUserAsync(newUser);

            string verificationCode = new Random().Next(100000, 999999).ToString();

            _verificationStore.AddCode(newUser.UserId, verificationCode);

            var emailBody = $"Your Finance Tracker verification code is: <strong>{verificationCode}</strong>. Please enter this code in the app to activate your account.";

            await _emailService.SendEmailAsync(
                newUser.Email,
                "Your Account Verification Code",
                emailBody
            );

            var responseData = new
            {
                newUser.UserId,
                newUser.Name,
                newUser.Email,

                // 🎯 Include the user message
                Message = "Registration successful. Please enter the 6-digit code sent to your email to verify your account."
            };

            // 🎯 FIX: Change the return status to 202 Accepted.
            return Accepted(responseData);
        }


        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromBody] UserVerifyCodeDto dto)
        {
            var user = await _userRepository.GetUserByEmailAsync(dto.Email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (_verificationStore.IsUserVerified(user.UserId))
            {
                return BadRequest("Account is already verified.");
            }

            // 🎯 Validate code against the store
            var validationResult = _verificationStore.ValidateCode(dto.Code);

            if (!validationResult.IsValid || validationResult.UserId != user.UserId)
            {
                // Check if the user ID from the token matches the user submitting the code
                return BadRequest("Invalid or expired verification code.");
            }

            // Verification successful: Update status in the store
            _verificationStore.SetUserVerified(user.UserId);

            return Ok(new { Message = "Account successfully verified. You can now log in." });
        }


        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private (bool IsStrong, string ErrorMessage) IsPasswordStrong(string password)
        {
            var errors = new List<string>();

            // Must be at least 8 characters
            if (password.Length < 8)
            {
                errors.Add("8+ characters");
            }

            // Must contain at least one uppercase letter
            if (!Regex.IsMatch(password, @"[A-Z]"))
            {
                errors.Add("1 uppercase");
            }

            // Must contain at least one number
            if (!Regex.IsMatch(password, @"[0-9]"))
            {
                errors.Add("1 number");
            }

            // Must contain at least one special symbol (non-alphanumeric)
            if (!Regex.IsMatch(password, @"[\W_]"))
            {
                errors.Add("1 special symbol");
            }

            if (errors.Count > 0)
            {
                return (false, "Password requires: " + string.Join(", ", errors) + ".");
            }

            return (true, string.Empty);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

            if (user == null || !_passwordHasher.VerifyPassword(loginDto.Password, user.Password))
            {
                return Unauthorized(new { Message = "Invalid email or password." });
            }

            if (!_verificationStore.IsUserVerified(user.UserId))
            {
                return Unauthorized(new { Message = "Account is not verified. Please submit your 6-digit code to activate." });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                User = new { user.UserId, user.Name, user.Email }
            });
        }

        private JwtSecurityToken GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var issuer = _configuration["Jwt:Issuer"];

            var token = new JwtSecurityToken(issuer,
                issuer,
                claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials);

            return token;
        }
    }
}