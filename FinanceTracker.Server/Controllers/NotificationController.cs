using FinanceTracker.Server.Data;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Data.Dto;
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

        public NotificationController(INotificationRepository notificationRepo)
        {
            _notificationRepo = notificationRepo;
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

        // POST: api/Notification
        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationCreateDto dto)
        {
            try
            {
                int userId = GetUserId();
                var notification = await _notificationRepo.CreateNotificationAsync(userId, dto);
                return CreatedAtAction(nameof(GetNotifications), new { id = notification.NotificationId }, notification);
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

        // GET: api/Notification?page=1&pageSize=5
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 5)
        {
            try
            {
                int userId = GetUserId();
                var result = await _notificationRepo.GetNotificationsAsync(userId, page, pageSize);
                return Ok(result);
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

        // GET: api/Notification/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                int userId = GetUserId();
                var count = await _notificationRepo.GetUnreadCountAsync(userId);
                return Ok(new { count });
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

        // PUT: api/Notification/mark-read/{notificationId}
        [HttpPut("mark-read/{notificationId}")]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            try
            {
                int userId = GetUserId();
                await _notificationRepo.MarkAsReadAsync(notificationId, userId);
                return Ok(new { message = "Marked as read" });
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

        // PUT: api/Notification/mark-all-read
        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                int userId = GetUserId();
                await _notificationRepo.MarkAllAsReadAsync(userId);
                return Ok(new { message = "All notifications marked as read" });
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

        // PUT: api/Notification/mark-multiple-read
        [HttpPut("mark-multiple-read")]
        public async Task<IActionResult> MarkMultipleAsRead([FromBody] MarkReadDto dto)
        {
            try
            {
                int userId = GetUserId();
                await _notificationRepo.MarkMultipleAsReadAsync(dto.NotificationIds, userId);
                return Ok(new { message = $"{dto.NotificationIds.Count} notifications marked as read" });
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

        // DELETE: api/Notification/{notificationId}
        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> DeleteNotification(int notificationId)
        {
            try
            {
                int userId = GetUserId();
                var success = await _notificationRepo.DeleteNotificationAsync(notificationId, userId);
                
                if (!success)
                {
                    return NotFound(new { message = "Notification not found" });
                }
                
                return Ok(new { message = "Notification deleted" });
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

        // DELETE: api/Notification/delete-all-read
        [HttpDelete("delete-all-read")]
        public async Task<IActionResult> DeleteAllRead()
        {
            try
            {
                int userId = GetUserId();
                var deletedCount = await _notificationRepo.DeleteAllReadAsync(userId);
                return Ok(new { message = $"{deletedCount} read notifications deleted" });
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