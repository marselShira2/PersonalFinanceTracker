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

                // Check again in 24 hours
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task CheckAndNotifyRecurringExpenses()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

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
                    // 3. Check if the user has ALREADY paid this bill in the CURRENT month/year
                    bool isPaidThisMonth = await context.Transactions.AnyAsync(t =>
                        t.UserId == bill.UserId &&
                        t.Description == bill.Description &&
                        t.Date.Month == currentMonth &&
                        t.Date.Year == currentYear);

                    // 4. Only notify if it is NOT paid yet
                    if (!isPaidThisMonth)
                    {
                        string title = "Bill Reminder";
                        string message = $"📅 Reminder: Your recurring bill '{bill.Description}' ({bill.Amount} {bill.Currency}) is usually due today.";

                        // Save Notification
                        context.Notifications.Add(new Notification
                        {
                            UserId = bill.UserId,
                            Title = title,
                            Message = message,
                            Type = "Reminder",
                            CreatedAt = DateTime.Now,
                            IsRead = false
                        });

                        // Send Email
                        if (bill.User != null && !string.IsNullOrEmpty(bill.User.Email))
                        {
                            try
                            {
                                await emailService.SendEmailAsync(bill.User.Email, title, message);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"[Error] Email failed: {ex.Message}");
                            }
                        }
                    }
                }
                await context.SaveChangesAsync();
            }
        }
    }
}