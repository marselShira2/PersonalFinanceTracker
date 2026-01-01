using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpenseLimitController : ControllerBase
    {
        private readonly IExpenseLimitRepository _repo;

        public ExpenseLimitController(IExpenseLimitRepository repo)
        {
            _repo = repo;
        }

        [HttpPost("set-goal")]
        public async Task<IActionResult> SetGoal([FromBody] SetLimitDto dto)
        {
            try
            {
                var result = await _repo.SetLimitAsync(dto.UserId, dto.Amount);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error setting limit: {ex.Message}" });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetStatus(int userId, [FromQuery] string? lang = "en")
        {
            try
            {
                var limit = await _repo.GetLimitAsync(userId);
                if (limit == null) return NotFound("No limit set for this user.");

                // 1. Calculate the Math
                decimal spent = limit.LimitAmount - limit.Balance;
                decimal percentage = 0;

                if (limit.LimitAmount > 0)
                {
                    percentage = (spent / limit.LimitAmount) * 100;
                }

                // 2. Determine the Warning Message based on language
                string message = lang == "sq" ? "Ju jeni duke bërë mirë!" : "You are doing great!"; // Default

                if (percentage >= 100)
                {
                    message = lang == "sq" ? "ALARM: Keni tejkaluar qëllimin tuaj të buxhetit!" : "ALERT: You have exceeded your budget goal!";
                }
                else if (percentage >= 90)
                {
                    message = lang == "sq" ? $"RREZIK: Keni shpenzuar {percentage:0}% të qëllimit tuaj të buxhetit!" : $"DANGER: You have spent {percentage:0}% of your budget goal!";
                }
                else if (percentage >= 50)
                {
                    message = lang == "sq" ? $"Kujdes! Keni shpenzuar {percentage:0}% të qëllimit tuaj të buxhetit." : $"Careful! You have spent {percentage:0}% of your budget goal.";
                }

                // 3. Create the Response Object
                var statusDto = new LimitStatusDto
                {
                    LimitAmount = limit.LimitAmount,
                    Balance = limit.Balance,
                    SpentAmount = spent,
                    PercentageSpent = Math.Round(percentage, 1),
                    WarningMessage = message,
                    IsActive = limit.IsActive
                };

                return Ok(statusDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting limit status: {ex.Message}" });
            }
        }

        [HttpPost("toggle/{userId}")]
        public async Task<IActionResult> ToggleLimit(int userId, [FromBody] bool isActive)
        {
            try
            {
                var result = await _repo.ToggleLimitAsync(userId, isActive);
                if (result == null) return NotFound("No limit found for this user.");
                
                return Ok(new { message = $"Limit tracking {(isActive ? "enabled" : "disabled")} successfully.", isActive = result.IsActive });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error toggling limit: {ex.Message}" });
            }
        }
    }
}