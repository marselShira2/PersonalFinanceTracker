using FinanceTracker.Server.Data;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Services
{
    public class RecurringExpenseService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public RecurringExpenseService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Run endlessly until the server stops
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndNotifyRecurringExpenses();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Error] Background Worker failed: {ex.Message}");
                }

                // Check again every 10 seconds
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        private async Task CheckAndNotifyRecurringExpenses()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                var notificationService = scope.ServiceProvider.GetRequiredService<FinanceTracker.Server.Services.INotificationService>();

                int todayDay = DateTime.Now.Day;
                int currentMonth = DateTime.Now.Month;
                int currentYear = DateTime.Now.Year;

                // 1. Find ALL past recurring expenses that fall on this day of the month
                var allRecurring = await context.Transactions
                    .Include(t => t.User)
                    .Where(t => t.IsRecurring == true
                             && t.Type == "Expense" // distinct from Income
                             && t.Date.Day == todayDay)
                    .ToListAsync();

                // 2. Group by User and Description to handle duplicates (The "Anti-Spam" Fix)
                // This ensures we only process "Netflix" once, even if it appears 12 times in history.
                var uniqueBills = allRecurring
                    .GroupBy(t => new { t.UserId, t.Description })
                    .Select(g => g.OrderByDescending(t => t.Date).First()) // Take the most recent one info
                    .ToList();

                foreach (var bill in uniqueBills)
                {
                    // Check if we already sent a same-day notification for this bill this month
                    bool alreadyNotifiedToday = await context.Notifications.AnyAsync(n =>
                        n.UserId == bill.UserId &&
                        n.Type == "bill_reminder" &&
                        n.Message.Contains(bill.Description) &&
                        n.CreatedAt.HasValue &&
                        n.CreatedAt.Value.Month == currentMonth &&
                        n.CreatedAt.Value.Year == currentYear);

                    if (!alreadyNotifiedToday)
                    {
                        await notificationService.CreateBillReminderAsync(bill.UserId, bill.Description, bill.Amount, bill.Currency);

                        // Send Email
                        if (bill.User != null && !string.IsNullOrEmpty(bill.User.Email))
                        {
                            try
                            {
                                string title = "Bill Reminder";
                                string message = $"📅 Reminder: Your recurring bill '{bill.Description}' ({bill.Amount} {bill.Currency}) is usually due today.";
                                await emailService.SendEmailAsync(bill.User.Email, title, message);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[Error] Email failed: {ex.Message}");
                            }
                        }
                    }
                }

                // 5. Check for advance reminders (7 days before due date)
                int advanceDay = DateTime.Now.AddDays(7).Day;
                
                // Query separately for advance reminders
                var allRecurringForAdvance = await context.Transactions
                    .Include(t => t.User)
                    .Where(t => t.IsRecurring == true
                             && t.Type == "Expense"
                             && t.Date.Day == advanceDay)
                    .ToListAsync();

                var advanceReminders = allRecurringForAdvance
                    .GroupBy(t => new { t.UserId, t.Description })
                    .Select(g => g.OrderByDescending(t => t.Date).First())
                    .ToList();

                foreach (var bill in advanceReminders)
                {
                    // This will now run for every single item in your original list
                    bool alreadyNotifiedAdvance = await context.Notifications.AnyAsync(n =>
                        n.UserId == bill.UserId &&
                        n.Type == "bill_advance" &&
                        n.Message.Contains(bill.Description) &&
                        n.CreatedAt.HasValue &&
                        n.CreatedAt.Value.Month == currentMonth &&
                        n.CreatedAt.Value.Year == currentYear);

                    if (!alreadyNotifiedAdvance)
                    {
                        await notificationService.CreateBillAdvanceReminderAsync(bill.UserId, bill.Description, bill.Amount, bill.Currency, 7);
                    }
                }
                // No need to call SaveChangesAsync here since NotificationService handles it
            }
        }
    }
}