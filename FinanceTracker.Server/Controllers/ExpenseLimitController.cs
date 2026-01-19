using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ExpenseLimitController : ControllerBase
    {
        private readonly IExpenseLimitRepository _repo;
        private readonly ICurrencyConversionService _currencyService;

        public ExpenseLimitController(IExpenseLimitRepository repo, ICurrencyConversionService currencyService)
        {
            _repo = repo;
            _currencyService = currencyService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        [HttpPost]
        public async Task<IActionResult> SetLimit([FromBody] SetLimitDto dto)
        {
            try
            {
                var month = dto.Month ?? DateTime.Now.Month;
                var year = dto.Year ?? DateTime.Now.Year;

                // Get user's default currency and convert amount to USD for storage
                var user = await _repo.GetUserByIdAsync(dto.UserId);
                var userCurrency = user?.DefaultCurrency ?? "USD";
                var amountInUSD = _currencyService.ConvertAmount(dto.Amount, userCurrency, "USD");

                var result = await _repo.SetLimitAsync(dto.UserId, dto.CategoryId, amountInUSD, month, year);
                return Ok(new { message = "Limit set successfully", data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error setting limit: {ex.Message}" });
            }
        }

        [HttpGet("{userId}/category/{categoryId}")]
        public async Task<IActionResult> GetLimitStatus(int userId, int categoryId, [FromQuery] int? month, [FromQuery] int? year)
        {
            try
            {
                var targetMonth = month ?? DateTime.Now.Month;
                var targetYear = year ?? DateTime.Now.Year;

                var limit = await _repo.GetLimitAsync(userId, categoryId, targetMonth, targetYear);
                if (limit == null) return NotFound("No limit set for this category.");

                var user = await _repo.GetUserByIdAsync(userId);
                var defaultCurrency = user?.DefaultCurrency ?? "USD";

                var spent = await _repo.GetCategorySpentAsync(userId, categoryId, targetMonth, targetYear);
                
                // Convert limit amounts from USD to user's default currency
                var convertedLimitAmount = _currencyService.ConvertAmount(limit.LimitAmount, "USD", defaultCurrency);
                var convertedSpentAmount = spent; // Already converted in GetCategorySpentAsync
                var remaining = convertedLimitAmount - convertedSpentAmount;
                var percentage = convertedLimitAmount > 0 ? (convertedSpentAmount / convertedLimitAmount) * 100 : 0;

                var statusDto = new LimitStatusDto
                {
                    CategoryId = limit.CategoryId ?? 0,
                    CategoryName = limit.Category?.Name ?? "",
                    LimitAmount = convertedLimitAmount,
                    SpentAmount = convertedSpentAmount,
                    RemainingAmount = remaining,
                    PercentageSpent = Math.Round(percentage, 1),
                    Month = targetMonth,
                    Year = targetYear,
                    IsActive = limit.IsActive,
                    Currency = defaultCurrency
                };

                return Ok(statusDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting limit status: {ex.Message}" });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAllLimits(int userId, [FromQuery] int? month, [FromQuery] int? year)
        {
            try
            {
                var targetMonth = month ?? DateTime.Now.Month;
                var targetYear = year ?? DateTime.Now.Year;

                var limits = await _repo.GetAllLimitsAsync(userId, targetMonth, targetYear);
                var user = await _repo.GetUserByIdAsync(userId);
                var defaultCurrency = user?.DefaultCurrency ?? "USD";
                var statusList = new List<LimitStatusDto>();

                foreach (var limit in limits)
                {
                    var spent = await _repo.GetCategorySpentAsync(userId, limit.CategoryId ?? 0, targetMonth, targetYear);
                    
                    // Convert limit amounts from USD to user's default currency
                    var convertedLimitAmount = _currencyService.ConvertAmount(limit.LimitAmount, "USD", defaultCurrency);
                    var convertedSpentAmount = spent; // Already converted in GetCategorySpentAsync
                    var remaining = convertedLimitAmount - convertedSpentAmount;
                    var percentage = convertedLimitAmount > 0 ? (convertedSpentAmount / convertedLimitAmount) * 100 : 0;

                    statusList.Add(new LimitStatusDto
                    {
                        CategoryId = limit.CategoryId ?? 0,
                        CategoryName = limit.Category?.Name ?? "",
                        LimitAmount = convertedLimitAmount,
                        SpentAmount = convertedSpentAmount,
                        RemainingAmount = remaining,
                        PercentageSpent = Math.Round(percentage, 1),
                        Month = targetMonth,
                        Year = targetYear,
                        IsActive = limit.IsActive,
                        Currency = defaultCurrency
                    });
                }

                return Ok(statusList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting limits: {ex.Message}" });
            }
        }

        [HttpPut("{userId}/category/{categoryId}/toggle")]
        public async Task<IActionResult> ToggleLimit(int userId, int categoryId, [FromQuery] int? month, [FromQuery] int? year)
        {
            try
            {
                int currentUserId = GetUserId();
                if (currentUserId != userId)
                {
                    return Unauthorized("Cannot modify limits for other users.");
                }

                var targetMonth = month ?? DateTime.Now.Month;
                var targetYear = year ?? DateTime.Now.Year;

                var limit = await _repo.GetLimitAsync(userId, categoryId, targetMonth, targetYear);
                if (limit == null) return NotFound("No limit found for this category.");

                var result = await _repo.SetLimitAsync(userId, categoryId, limit.LimitAmount, targetMonth, targetYear, !limit.IsActive);
                return Ok(new { message = "Limit status toggled successfully", isActive = !limit.IsActive });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error toggling limit: {ex.Message}" });
            }
        }

        [HttpDelete("{userId}/category/{categoryId}")]
        public async Task<IActionResult> DeleteLimit(int userId, int categoryId, [FromQuery] int? month, [FromQuery] int? year)
        {
            try
            {
                var targetMonth = month ?? DateTime.Now.Month;
                var targetYear = year ?? DateTime.Now.Year;

                var result = await _repo.DeleteLimitAsync(userId, categoryId, targetMonth, targetYear);
                if (!result) return NotFound("No limit found for this category.");

                return Ok(new { message = "Limit deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting limit: {ex.Message}" });
            }
        }
    }
}
