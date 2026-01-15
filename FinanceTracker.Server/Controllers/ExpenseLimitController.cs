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

        [HttpPost]
        public async Task<IActionResult> SetLimit([FromBody] SetLimitDto dto)
        {
            try
            {
                var month = dto.Month ?? DateTime.Now.Month;
                var year = dto.Year ?? DateTime.Now.Year;

                var result = await _repo.SetLimitAsync(dto.UserId, dto.CategoryId, dto.Amount, month, year);
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

                var spent = await _repo.GetCategorySpentAsync(userId, categoryId, targetMonth, targetYear);
                var remaining = limit.LimitAmount - spent;
                var percentage = limit.LimitAmount > 0 ? (spent / limit.LimitAmount) * 100 : 0;

                var statusDto = new LimitStatusDto
                {
                    CategoryId = limit.CategoryId ?? 0,
                    CategoryName = limit.Category?.Name ?? "",
                    LimitAmount = limit.LimitAmount,
                    SpentAmount = spent,
                    RemainingAmount = remaining,
                    PercentageSpent = Math.Round(percentage, 1),
                    Month = targetMonth,
                    Year = targetYear
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
                var statusList = new List<LimitStatusDto>();

                foreach (var limit in limits)
                {
                    var spent = await _repo.GetCategorySpentAsync(userId, limit.CategoryId ?? 0, targetMonth, targetYear);
                    var remaining = limit.LimitAmount - spent;
                    var percentage = limit.LimitAmount > 0 ? (spent / limit.LimitAmount) * 100 : 0;

                    statusList.Add(new LimitStatusDto
                    {
                        CategoryId = limit.CategoryId ?? 0,
                        CategoryName = limit.Category?.Name ?? "",
                        LimitAmount = limit.LimitAmount,
                        SpentAmount = spent,
                        RemainingAmount = remaining,
                        PercentageSpent = Math.Round(percentage, 1),
                        Month = targetMonth,
                        Year = targetYear
                    });
                }

                return Ok(statusList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error getting limits: {ex.Message}" });
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
