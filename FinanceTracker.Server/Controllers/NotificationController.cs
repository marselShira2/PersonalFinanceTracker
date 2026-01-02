using FinanceTracker.Server.Data;
using FinanceTracker.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepo;

        // We only need the Repo now, the Context is hidden inside it!
        public NotificationController(INotificationRepository notificationRepo)
        {
            _notificationRepo = notificationRepo;
        }

        // Helper to get ID from Token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        // GET: api/Notification
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            int userId = GetUserId();
            var notifications = await _notificationRepo.GetNotificationsAsync(userId);
            return Ok(notifications);
        }

        // GET: api/Notification/unread-count
        // 👇 NEW: Use this for the "Red Dot" badge in your UI
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            int userId = GetUserId();
            var count = await _notificationRepo.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        // PUT: api/Notification/mark-read/5
        [HttpPut("mark-read/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            await _notificationRepo.MarkAsReadAsync(notificationId);
            return Ok(new { message = "Marked as read" });
        }
    }
}