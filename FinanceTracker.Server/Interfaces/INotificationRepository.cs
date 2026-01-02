using FinanceTracker.Server.Models;
using FinanceTracker.Server.Data.Dto;

namespace FinanceTracker.Server.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification> CreateNotificationAsync(int userId, NotificationCreateDto dto);
        Task<NotificationListResponseDto> GetNotificationsAsync(int userId, int page = 1, int pageSize = 5);
        Task<int> GetUnreadCountAsync(int userId);
        Task MarkAsReadAsync(int notificationId, int userId);
        Task MarkAllAsReadAsync(int userId);
        Task MarkMultipleAsReadAsync(List<int> notificationIds, int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
        Task<int> DeleteAllReadAsync(int userId);
    }
}