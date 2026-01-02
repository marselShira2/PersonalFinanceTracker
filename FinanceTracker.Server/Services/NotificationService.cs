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
        Task CreateBillAdvanceReminderAsync(int userId, string billDescription, decimal amount, string currency, int daysUntilDue);
        Task CreateSavingsGoalProgressAsync(int userId, decimal currentAmount, decimal goalAmount, decimal percentage);
        Task CreateSavingsGoalAchievedAsync(int userId, decimal goalAmount);
        Task CreateLargeExpenseAlertAsync(int userId, decimal amount, string description);
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
            var englishMessage = $"📅 Reminder: Your recurring bill '{billDescription}' ({amount} {currency}) is usually due today.";
            var albanianMessage = $"📅 Rikujtese: Pagesa juaj e përsëritur '{billDescription}' ({amount} {currency}) duhet paguar sot.";
            
            var dto = new NotificationCreateDto
            {
                Title = "Bill Reminder||Rikujtese për Pagesën",
                Message = $"{englishMessage}||{albanianMessage}",
                Type = "bill_reminder"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateBillAdvanceReminderAsync(int userId, string billDescription, decimal amount, string currency, int daysUntilDue)
        {
            var englishMessage = $"⏰ Your recurring bill '{billDescription}' ({amount} {currency}) is due in {daysUntilDue} days.";
            var albanianMessage = $"⏰ Rikujtese: Pagesa juaj e përsëritur '{billDescription}' ({amount} {currency}) duhet paguar pas {daysUntilDue} ditësh.";
            
            var dto = new NotificationCreateDto
            {
                Title = "Upcoming Bill Reminder||Rikujtese për Pagesën e Ardhshme",
                Message = $"{englishMessage}||{albanianMessage}",
                Type = "bill_advance"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateSavingsGoalProgressAsync(int userId, decimal currentAmount, decimal goalAmount, decimal percentage)
        {
            var englishMessage = $"🎯 Great progress! You've saved ${currentAmount:F2} of your ${goalAmount:F2} goal ({percentage:F0}% complete).";
            var albanianMessage = $"🎯 Progres i shkëlqyer! Keni kursyer ${currentAmount:F2} nga qëllimi juaj ${goalAmount:F2} ({percentage:F0}% e përfunduar).";
            
            var dto = new NotificationCreateDto
            {
                Title = "Savings Goal Progress||Progresi i Qëllimit të Kursimeve",
                Message = $"{englishMessage}||{albanianMessage}",
                Type = "savings_progress"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateSavingsGoalAchievedAsync(int userId, decimal goalAmount)
        {
            var englishMessage = $"🎉 Congratulations! You've reached your savings goal of ${goalAmount:F2}!";
            var albanianMessage = $"🎉 Urime! Keni arritur qëllimin tuaj të kursimeve prej ${goalAmount:F2}!";
            
            var dto = new NotificationCreateDto
            {
                Title = "Savings Goal Achieved!||Qëllimi i Kursimeve u Arrit!",
                Message = $"{englishMessage}||{albanianMessage}",
                Type = "savings_achieved"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }

        public async Task CreateLargeExpenseAlertAsync(int userId, decimal amount, string description)
        {
            // Create message with both languages separated by ||
            var englishMessage = $"💰 Large expense recorded: ${amount:F2} for {description}. Review your budget if needed.";
            var albanianMessage = $"💰 Shpenzim i madh u regjistrua: ${amount:F2} për {description}. Rishikoni buxhetin tuaj nëse është e nevojshme.";
            
            var dto = new NotificationCreateDto
            {
                Title = "Large Expense Alert||Alarm Shpenzimi i Madh",
                Message = $"{englishMessage}||{albanianMessage}",
                Type = "large_expense"
            };
            await _notificationRepo.CreateNotificationAsync(userId, dto);
        }
    }
}