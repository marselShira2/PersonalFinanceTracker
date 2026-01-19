using FinanceTracker.Server.Data;
using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using FinanceTracker.Server.Services;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;

namespace FinanceTracker.Server.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILocalizationService _localizationService;
        
        public TransactionRepository(AppDbContext context, IEmailService emailService, ILocalizationService localizationService)
        {
            _context = context;
            _emailService = emailService;
            _localizationService = localizationService;
        }

        private async Task ProcessExpenseLogicAsync(Transaction transaction, string language = "en")
        {
            // Only process if transaction has a category
            if (!transaction.CategoryId.HasValue) return;

            var currentMonth = transaction.Date.Month;
            var currentYear = transaction.Date.Year;

            // Get the expense limit for this specific category and month/year
            var expenseLimit = await _context.ExpenseLimits
                .Include(u => u.User)
                .Include(c => c.Category)
                .FirstOrDefaultAsync(e => e.UserId == transaction.UserId && 
                                        e.CategoryId == transaction.CategoryId &&
                                        e.Month == currentMonth &&
                                        e.Year == currentYear &&
                                        e.IsActive);

            if (expenseLimit == null) return; // No active limit for this category/month

            // Calculate total spent in this category for this month (including current transaction)
            var startDate = new DateOnly(currentYear, currentMonth, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);
            var effectiveStartDate = expenseLimit.StartDate < startDate ? startDate : expenseLimit.StartDate;

            var totalSpent = await _context.Transactions
                .Where(t => t.UserId == transaction.UserId && 
                           t.CategoryId == transaction.CategoryId && 
                           t.Type.ToLower() == "expense" &&
                           t.Date >= effectiveStartDate && 
                           t.Date <= endDate)
                .SumAsync(t => (decimal?)(t.AmountConverted ?? t.Amount)) ?? 0;

            // Get User Email
            string? userEmail = expenseLimit.User?.Email;
            if (string.IsNullOrEmpty(userEmail))
            {
                var user = await _context.Users.FindAsync(transaction.UserId);
                userEmail = user?.Email;
            }

            // Check for Alerts based on category spending
            await CheckAndNotifyAsync(expenseLimit, transaction, userEmail, totalSpent, language);

            // Save Notifications
            await _context.SaveChangesAsync();
        }

        private async Task CheckAndNotifyAsync(ExpenseLimit? limit, Transaction transaction, string? userEmail, decimal totalSpent, string language = "en")
        {
            string title = "";
            string message = "";
            string type = "Info";
            bool shouldNotify = false;

            // Get user's default currency for display
            var user = await _context.Users.FindAsync(transaction.UserId);
            string defaultCurrency = user?.DefaultCurrency ?? "USD";
            decimal displayAmount = transaction.AmountConverted ?? transaction.Amount;

            // Check Budget Percentage based on category spending
            if (limit != null && limit.LimitAmount > 0)
            {
                decimal percentage = (totalSpent / limit.LimitAmount) * 100;
                string categoryName = limit.Category?.Name ?? "Unknown Category";

                if (percentage >= 100)
                {
                    title = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_TITLE", language);
                    message = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_MESSAGE", language, 
                        categoryName, percentage.ToString("0"), totalSpent.ToString("F2"), defaultCurrency, limit.LimitAmount.ToString("F2"), defaultCurrency);
                    type = "Critical";
                    shouldNotify = true;
                }
                else if (percentage >= 95)
                {
                    title = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", language);
                    message = _localizationService.GetLocalizedMessage("BUDGET_WARNING_95_MESSAGE", language,
                        percentage.ToString("0"), categoryName, totalSpent.ToString("F2"), defaultCurrency, limit.LimitAmount.ToString("F2"), defaultCurrency);
                    type = "Warning";
                    shouldNotify = true;
                }
                else if (percentage >= 90)
                {
                    title = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", language);
                    message = _localizationService.GetLocalizedMessage("BUDGET_WARNING_90_MESSAGE", language,
                        percentage.ToString("0"), categoryName, totalSpent.ToString("F2"), defaultCurrency, limit.LimitAmount.ToString("F2"), defaultCurrency);
                    type = "Warning";
                    shouldNotify = true;
                }
                else if (percentage >= 70)
                {
                    title = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", language);
                    message = _localizationService.GetLocalizedMessage("BUDGET_WARNING_70_MESSAGE", language,
                        percentage.ToString("0"), categoryName, totalSpent.ToString("F2"), defaultCurrency, limit.LimitAmount.ToString("F2"), defaultCurrency);
                    type = "Warning";
                    shouldNotify = true;
                }
                else if (percentage >= 50 && percentage < 55)
                {
                    title = _localizationService.GetLocalizedMessage("BUDGET_UPDATE_TITLE", language);
                    message = _localizationService.GetLocalizedMessage("BUDGET_UPDATE_MESSAGE", language,
                        percentage.ToString("0"), categoryName, totalSpent.ToString("F2"), defaultCurrency, limit.LimitAmount.ToString("F2"), defaultCurrency);
                    type = "Info";
                    shouldNotify = true;
                }
            }

            // Check Recurring Confirmation (only if not Critical)
            if (transaction.IsRecurring == true && type != "Critical")
            {
                title = _localizationService.GetLocalizedMessage("RECURRING_PAYMENT_TITLE", language);
                message = _localizationService.GetLocalizedMessage("RECURRING_PAYMENT_MESSAGE", language,
                    displayAmount.ToString("F2"), defaultCurrency);
                type = "Info";
                shouldNotify = true;
            }
            
            // Save Notification & Send Email
            if (shouldNotify)
            {
                // Create messages in both languages
                string titleEn = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_TITLE", "en");
                string titleSq = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_TITLE", "sq");
                string messageEn = "";
                string messageSq = "";

                if (limit != null && limit.LimitAmount > 0)
                {
                    decimal percentage = (totalSpent / limit.LimitAmount) * 100;
                    string categoryName = limit.Category?.Name ?? "Unknown Category";

                    if (percentage >= 100)
                    {
                        titleEn = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_TITLE", "en");
                        titleSq = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_TITLE", "sq");
                        messageEn = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_MESSAGE", "en", categoryName, percentage.ToString("0"));
                        messageSq = _localizationService.GetLocalizedMessage("BUDGET_EXCEEDED_MESSAGE", "sq", categoryName, percentage.ToString("0"));
                    }
                    else if (percentage >= 95)
                    {
                        titleEn = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", "en");
                        titleSq = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", "sq");
                        messageEn = _localizationService.GetLocalizedMessage("BUDGET_WARNING_95_MESSAGE", "en", percentage.ToString("0"), categoryName);
                        messageSq = _localizationService.GetLocalizedMessage("BUDGET_WARNING_95_MESSAGE", "sq", percentage.ToString("0"), categoryName);
                    }
                    else if (percentage >= 90)
                    {
                        titleEn = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", "en");
                        titleSq = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", "sq");
                        messageEn = _localizationService.GetLocalizedMessage("BUDGET_WARNING_90_MESSAGE", "en", percentage.ToString("0"), categoryName);
                        messageSq = _localizationService.GetLocalizedMessage("BUDGET_WARNING_90_MESSAGE", "sq", percentage.ToString("0"), categoryName);
                    }
                    else if (percentage >= 70)
                    {
                        titleEn = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", "en");
                        titleSq = _localizationService.GetLocalizedMessage("BUDGET_WARNING_TITLE", "sq");
                        messageEn = _localizationService.GetLocalizedMessage("BUDGET_WARNING_70_MESSAGE", "en", percentage.ToString("0"), categoryName);
                        messageSq = _localizationService.GetLocalizedMessage("BUDGET_WARNING_70_MESSAGE", "sq", percentage.ToString("0"), categoryName);
                    }
                    else if (percentage >= 50 && percentage < 55)
                    {
                        titleEn = _localizationService.GetLocalizedMessage("BUDGET_UPDATE_TITLE", "en");
                        titleSq = _localizationService.GetLocalizedMessage("BUDGET_UPDATE_TITLE", "sq");
                        messageEn = _localizationService.GetLocalizedMessage("BUDGET_UPDATE_MESSAGE", "en", percentage.ToString("0"), categoryName);
                        messageSq = _localizationService.GetLocalizedMessage("BUDGET_UPDATE_MESSAGE", "sq", percentage.ToString("0"), categoryName);
                    }
                }
                else if (transaction.IsRecurring == true && type != "Critical")
                {
                    titleEn = _localizationService.GetLocalizedMessage("RECURRING_PAYMENT_TITLE", "en");
                    titleSq = _localizationService.GetLocalizedMessage("RECURRING_PAYMENT_TITLE", "sq");
                    messageEn = _localizationService.GetLocalizedMessage("RECURRING_PAYMENT_MESSAGE", "en", displayAmount.ToString("F2"), defaultCurrency);
                    messageSq = _localizationService.GetLocalizedMessage("RECURRING_PAYMENT_MESSAGE", "sq", displayAmount.ToString("F2"), defaultCurrency);
                }

                var notif = new Notification
                {
                    UserId = transaction.UserId,
                    Title = $"en:{titleEn} sq:{titleSq}",
                    Message = $"en:{messageEn} sq:{messageSq}",
                    Type = type,
                    CreatedAt = DateTime.Now,
                    IsRead = false
                };
                _context.Notifications.Add(notif);

                if (!string.IsNullOrEmpty(userEmail))
                {
                    try
                    {
                        await _emailService.SendEmailAsync(userEmail, title, message);
                        Console.WriteLine($"[Success] Email sent to {userEmail}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Error] Email failed to send: {ex.Message}");
                    }
                }
            }
        }
        public async Task<Transaction> AddTransactionAsync(Transaction transaction, string language = "en")
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            if (!string.IsNullOrEmpty(transaction.Type) && transaction.Type.ToLower() == "expense")
            {
                try
                {
                    await ProcessExpenseLogicAsync(transaction, language);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Warning] Notification logic failed: {ex.Message}");
                }
            }
            return transaction;
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<Transaction?> GetTransactionByIdAsync(int transactionId, int userId)
        {
            return await _context.Transactions
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.TransactionId == transactionId && t.UserId == userId);
        }

        public async Task<List<Transaction>> GetAllTransactionsAsync(int userId)
        {
            return await _context.Transactions
                .Where(t => t.UserId == userId)
                .Include(t => t.Category)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }

        public async Task<List<Transaction>> GetFilteredTransactionsAsync(int userId, string? type, bool? isRecurring)
        {
            var query = _context.Transactions.Where(t => t.UserId == userId);

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(t => t.Type.ToLower() == type.ToLower());
            }

            if (isRecurring.HasValue)
            {
                query = query.Where(t => t.IsRecurring == isRecurring.Value);
            }

            return await query
                .Include(t => t.Category)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
        }

        public async Task<List<Transaction>> GetTransactionsByDateRangeAsync(int userId, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Transactions.Where(t => t.UserId == userId);

            if (startDate.HasValue)
            {
                var startDateOnly = DateOnly.FromDateTime(startDate.Value);
                query = query.Where(t => t.Date >= startDateOnly);
            }

            if (endDate.HasValue)
            {
                var endDateOnly = DateOnly.FromDateTime(endDate.Value);
                query = query.Where(t => t.Date <= endDateOnly);
            }

            return await query
                .Include(t => t.Category)
                .OrderBy(t => t.Date)
                .ToListAsync();
        }

        public async Task<bool> UpdateTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Update(transaction);
            var changes = await _context.SaveChangesAsync();
            return changes > 0;
        }

        public async Task<bool> DeleteTransactionAsync(int transactionId, int userId)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.TransactionId == transactionId && t.UserId == userId);

            if (transaction == null)
            {
                return false;
            }

            _context.Transactions.Remove(transaction);
            var changes = await _context.SaveChangesAsync();
            return changes > 0;
        }


        public async Task<int> GetCategoryIdByName(string categoryName)
        {
            return _context.Categories.Where(w => w.Name == categoryName).Select(s => s.CategoryId).FirstOrDefault();
        }

        public async Task AddTransactionsFromCsvAsync(List<CsvTransactionDto> csvTransactions)
        {
            try
            {
                // 1. Map DTOs to Entity Models
                var newTransactions = csvTransactions.Select(dto => new Transaction
                {
                    UserId = dto.UserId,
                    Type = dto.Type,
                    Amount = dto.Amount,
                    Currency = dto.Currency,
                    Date = DateOnly.FromDateTime(dto.Date),
                    CategoryId = dto.CategoryId,
                    Description = dto.Description,
                    IsRecurring = dto.IsRecurring,
                    RecurringFrequency = dto.RecurringFrequency,
                    NextOccurrenceDate = dto.IsRecurring ? (dto.NextOccurrenceDate ?? CalculateNextOccurrence(DateOnly.FromDateTime(dto.Date), dto.RecurringFrequency)) : null
                }).ToList();

                // 2. Perform Batch Insertion
                _context.Transactions.AddRange(newTransactions);
                foreach (var transaction in newTransactions)
                {
                    // Only subtract if it is actually an 'Expense'
                    if (!string.IsNullOrEmpty(transaction.Type) && transaction.Type.ToLower() == "expense")
                    {
                        // We reuse the same logic we wrote for single transactions
                        try
                        {
                            await ProcessExpenseLogicAsync(transaction);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Warning] Notification logic failed for transaction {transaction.TransactionId}: {ex.Message}");
                        }
                    }
                }
                //

                // 3. Save Changes
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {

            }
        }

        private DateOnly CalculateNextOccurrence(DateOnly current, string? frequency)
        {
            return frequency?.ToLower() switch
            {
                "daily" => current.AddDays(1),
                "weekly" => current.AddDays(7),
                "monthly" => current.AddMonths(1),
                "yearly" => current.AddYears(1),
                _ => current.AddMonths(1)
            };
        }

        public async Task RecalculateTransactionCurrenciesAsync(int userId, string newDefaultCurrency)
        {
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();

            foreach (var transaction in transactions)
            {
                if (transaction.Currency != newDefaultCurrency)
                {
                    // Will be recalculated by the service layer
                    transaction.AmountConverted = null;
                    transaction.ConversionRate = null;
                }
                else
                {
                    // Same currency, no conversion needed
                    transaction.AmountConverted = transaction.Amount;
                    transaction.ConversionRate = null;
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> CategoryExistsAsync(int categoryId)
        {
            return await _context.Categories.AnyAsync(c => c.CategoryId == categoryId);
        }
    }
}