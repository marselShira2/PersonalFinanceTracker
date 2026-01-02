using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Data.Dto;

namespace FinanceTracker.Server.Services
{
    public interface INotificationService
    {
        Task CreateExpenseLimitWarningAsync(int userId, decimal currentAmount, decimal limit);
        Task CreateBudgetExceededAsync(int userId, string categoryName, decimal spent, decimal budget);
        Task CreateTransactionAddedAsync(int userId, string transactionType, decimal amount);
        Task CreateWelcomeNotificationAsync(int userId, string userName);
        Task CreateBillReminderAsync(int userId, string billDescription, decimal amount, string currency);
    }

    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepo;

        public NotificationService(INotificationRepository notificationRepo)
        {
            _notificationRepo = notificationRepo;
        }

        public async Task CreateExpenseLimitWarningAsync(int userId, decimal currentAmount, decimal limit)
        {
            var percentage = (currentAmount / limit) * 100;
            var dto = new NotificationCreateDto
            {
                Title = "Expense Limit Warning",
                Message = $"You've spent ${currentAmount:F2} of your ${limit:F2} limit ({percentage:F0}%)",
                Type = "expense_warning"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateBudgetExceededAsync(int userId, string categoryName, decimal spent, decimal budget)
        {
            var dto = new NotificationCreateDto
            {
                Title = "Budget Exceeded",
                Message = $"You've exceeded your {categoryName} budget. Spent: ${spent:F2}, Budget: ${budget:F2}",
                Type = "budget_exceeded"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateTransactionAddedAsync(int userId, string transactionType, decimal amount)
        {
            var dto = new NotificationCreateDto
            {
                Title = "Transaction Added",
                Message = $"New {transactionType.ToLower()} of ${amount:F2} has been recorded",
                Type = "transaction_added"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateWelcomeNotificationAsync(int userId, string userName)
        {
            var dto = new NotificationCreateDto
            {
                Title = "Welcome to Finance Tracker!",
                Message = $"Hello {userName}! Start tracking your finances by adding your first transaction.",
                Type = "welcome"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateBillReminderAsync(int userId, string billDescription, decimal amount, string currency)
        {
            var dto = new NotificationCreateDto
            {
                Title = "Bill Reminder",
                Message = $"📅 Reminder: Your recurring bill '{billDescription}' ({amount} {currency}) is usually due today.",
                Type = "bill_reminder"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }
    }
}