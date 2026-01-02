using FinanceTracker.Server.Data;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using FinanceTracker.Server.Data.Dto;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly AppDbContext _context;

        public NotificationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Notification> CreateNotificationAsync(int userId, NotificationCreateDto dto)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<NotificationListResponseDto> GetNotificationsAsync(int userId, int page = 1, int pageSize = 5)
        {
            var query = _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt);

            var totalCount = await query.CountAsync();
            var unreadCount = await query.Where(n => n.IsRead == false).CountAsync();

            var notifications = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificationResponseDto
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title,
                    Message = n.Message,
                    Type = n.Type,
                    IsRead = n.IsRead ?? false,
                    CreatedAt = n.CreatedAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return new NotificationListResponseDto
            {
                Notifications = notifications,
                TotalCount = totalCount,
                UnreadCount = unreadCount,
                HasMore = totalCount > page * pageSize
            };
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead == false)
                .CountAsync();
        }

        public async Task MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);
            
            if (notification != null)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead == false)
                .ExecuteUpdateAsync(n => n.SetProperty(p => p.IsRead, true));
        }

        public async Task MarkMultipleAsReadAsync(List<int> notificationIds, int userId)
        {
            await _context.Notifications
                .Where(n => notificationIds.Contains(n.NotificationId) && n.UserId == userId)
                .ExecuteUpdateAsync(n => n.SetProperty(p => p.IsRead, true));
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);
            
            if (notification != null)
            {
                _context.Notifications.Remove(notification);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<int> DeleteAllReadAsync(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && n.IsRead == true)
                .ExecuteDeleteAsync();
        }
    }
}