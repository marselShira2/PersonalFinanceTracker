using FinanceTracker.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardController(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
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

        [HttpGet("summary")]
        public async Task<IActionResult> GetAllTimeSummary()
        {
            try
            {
                int userId = GetUserId();
                var summary = await _dashboardRepository.GetAllTimeSummaryAsync(userId);
                return Ok(summary);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error.", Error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardData([FromQuery] string period = "year", [FromQuery] int? categoryId = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                int userId = GetUserId();
                var data = await _dashboardRepository.GetDashboardDataAsync(userId, period, categoryId, startDate, endDate);
                return Ok(data);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error.", Error = ex.Message });
            }
        }
    }
}
