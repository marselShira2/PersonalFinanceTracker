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
            var result = await _repo.SetLimitAsync(dto.UserId, dto.Amount);
            return Ok(result);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetStatus(int userId)
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

            // 2. Determine the Warning Message
            string message = "You are doing great!"; // Default

            if (percentage >= 100)
            {
                message = "ALERT: You have exceeded your budget goal!";
            }
            else if (percentage >= 90)
            {
                message = $"DANGER: You have spent {percentage:0}% of your budget goal!";
            }
            else if (percentage >= 50)
            {
                // This matches your requirement exactly
                message = $"Careful! You have spent {percentage:0}% of your budget goal.";
            }

            // 3. Create the Response Object
            var statusDto = new LimitStatusDto
            {
                LimitAmount = limit.LimitAmount,
                Balance = limit.Balance,
                SpentAmount = spent,
                PercentageSpent = Math.Round(percentage, 1),
                WarningMessage = message
            };

            return Ok(statusDto);
        }
    }
}