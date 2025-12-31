using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Interfaces
{
    public interface INotificationRepository
    {
        Task<List<Notification>> GetNotificationsAsync(int userId);

        Task MarkAsReadAsync(int notificationId);

        Task<int> GetUnreadCountAsync(int userId);
    }
}