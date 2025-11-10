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

            var existingUser = await _userRepository.GetUserByEmailAsync(userDto.Email);
            if (existingUser != null)
            {
                return Conflict("An account with this email already exists.");
            }

            var passwordValidationResult = IsPasswordStrong(userDto.Password);
            if (!passwordValidationResult.IsStrong)
            {
                return BadRequest(passwordValidationResult.ErrorMessage);
            }

            string hashedPassword = _passwordHasher.HashPassword(userDto.Password);

            var newUser = new User
            {

                Name = userDto.Username,
                Email = userDto.Email,
                Password = hashedPassword,
                IsVerified = false
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
                success = true,
                newUser.UserId,
                newUser.Name,
                newUser.Email,

                Message = "Registration successful. Please enter the 6-digit code sent to your email to verify your account."
            };

            // Change the return status to 202 Accepted.
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

            var validationResult = _verificationStore.ValidateCode(dto.Code);

            if (!validationResult.IsValid || validationResult.UserId != user.UserId)
            {
                return BadRequest("Invalid or expired verification code.");
            }

            user.IsVerified = true;
            await _userRepository.SaveChangesAsync();
            // _verificationStore.SetUserVerified(user.UserId); 

            return Ok(new { Message = "Account successfully verified. You can now log in." });
        }

        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] UserVerifyCodeDto dto)
        {
            var user = await _userRepository.GetUserByEmailAsync(dto.Email);
            if (user == null)
                return NotFound("User not found.");

            if (user.IsVerified)
                return BadRequest("User is already verified.");

            string newCode = new Random().Next(100000, 999999).ToString();
            _verificationStore.AddCode(user.UserId, newCode);

            var emailBody = $"Your new Finance Tracker verification code is: <strong>{newCode}</strong>. Please enter this code to activate your account.";

            await _emailService.SendEmailAsync(
                user.Email,
                "Your New Verification Code",
                emailBody
            );

            return Ok(new { Message = "A new verification code has been sent to your email." });
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] UserForgotPasswordDto dto)
        {
            if (!IsValidEmail(dto.Email))
            {
                return BadRequest("Invalid email format.");
            }

            var user = await _userRepository.GetUserByEmailAsync(dto.Email);

            if (user == null)
            {
                return Ok(new { Message = "If an account with that email exists, a password reset code has been sent." });
            }

            string resetCode = new Random().Next(100000, 999999).ToString();
            DateTime expiry = DateTime.UtcNow.AddMinutes(5);

            user.ResetToken = resetCode;
            user.ResetTokenExpiry = expiry;
            await _userRepository.SaveChangesAsync();

            var emailBody = $@"
                <p>Hello {user.Name},</p>
                <p>Your **Finance Tracker Password Reset Code** is: <strong>{resetCode}</strong>.</p>
                <p>Please enter this 6-digit code to reset your password.</p>
                <p>This code will expire in 5 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            ";

            await _emailService.SendEmailAsync(
                user.Email,
                "Password Reset Verification Code",
                emailBody
            );

            return Ok(new { Message = "If an account with that email exists, a password reset code has been sent." });
        }

        [HttpPost("reset-password-with-code")]
        public async Task<IActionResult> ResetPasswordWithCode([FromBody] ResetPasswordDto dto)
        {
            var user = await _userRepository.GetUserByEmailAsync(dto.Email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (user.ResetToken != dto.Token || user.ResetTokenExpiry <= DateTime.UtcNow)
            {

                user.ResetToken = null;
                user.ResetTokenExpiry = null;
                await _userRepository.SaveChangesAsync();

                return BadRequest("Invalid or expired reset code.");
            }

            var passwordValidationResult = IsPasswordStrong(dto.NewPassword);
            if (!passwordValidationResult.IsStrong)
            {
                return BadRequest(passwordValidationResult.ErrorMessage);
            }

            string hashedPassword = _passwordHasher.HashPassword(dto.NewPassword);

            user.Password = hashedPassword;
            user.ResetToken = null;
            user.ResetTokenExpiry = null;
            await _userRepository.SaveChangesAsync();

            return Ok(new { Message = "Password has been successfully reset. You can now log in." });
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
            try
            {
                var user = await _userRepository.GetUserByEmailAsync(loginDto.Email);

                if (user == null || !_passwordHasher.VerifyPassword(loginDto.Password, user.Password))
                {
                    return Unauthorized(new { Message = "Invalid email or password." });
                }

                if (!user.IsVerified)
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
            catch (Exception ex)
            {
                // ✅ Return a clean 500 response
                return StatusCode(500, new
                {
                    message = "An internal server error occurred.",
                    error = ex.Message // optional, you can remove in production
                });
            }
        }

        private JwtSecurityToken GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim("id", user.UserId.ToString()),
                new Claim("name", user.Name),
                new Claim("email", user.Email)
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