using FinanceTracker.Server.Data;
using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;

namespace FinanceTracker.Server.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        public TransactionRepository(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private async Task ProcessExpenseLogicAsync(Transaction transaction)
        {
            // 1. Get the Budget Limit for this user
            var expenseLimit = await _context.ExpenseLimits
                .Include(u => u.User)
                .FirstOrDefaultAsync(e => e.UserId == transaction.UserId && e.IsActive);

            // 2. Subtract the amount from the budget (if a budget exists)
            if (expenseLimit != null)
            {
                expenseLimit.Balance -= transaction.Amount;
                _context.ExpenseLimits.Update(expenseLimit);
            }

            // 3. Get User Email safely
            string? userEmail = expenseLimit?.User?.Email;
            if (string.IsNullOrEmpty(userEmail))
            {
                var user = await _context.Users.FindAsync(transaction.UserId);
                userEmail = user?.Email;
            }

            // 4. Check for Alerts
            await CheckAndNotifyAsync(expenseLimit, transaction, userEmail);

            // 5. Save the Budget updates and Notifications
            await _context.SaveChangesAsync();
        }

        private async Task CheckAndNotifyAsync(ExpenseLimit? limit, Transaction transaction, string? userEmail)
        {
            string title = "";
            string message = "";
            string type = "Info";
            bool shouldNotify = false;

            // Check Budget Percentage
            if (limit != null && limit.LimitAmount > 0)
            {
                decimal spent = limit.LimitAmount - limit.Balance;
                decimal percentage = (limit.LimitAmount > 0) ? (spent / limit.LimitAmount) * 100 : 0;

                if (percentage >= 100)
                {
                    title = "Buxheti u Tejkalua";
                    message = $"🚨 ALARM: Ju e keni tejkaluar buxhetin tuaj! Përdorur: {percentage:0}%";
                    type = "Critical";
                    shouldNotify = true;
                }
                else if (percentage >= 95)
                {
                    title = "Paralajmërim Buxheti";
                    message = $"⚠️ RREZIK: Keni përdorur {percentage:0}% të buxhetit tuaj!";
                    type = "Warning";
                    shouldNotify = true;
                }
                else if (percentage >= 90)
                {
                    title = "Paralajmërim Buxheti";
                    message = $"⚠️ RREZIK: Keni përdorur {percentage:0}% të buxhetit tuaj!";
                    type = "Warning";
                    shouldNotify = true;
                }
                else if (percentage >= 70)
                {
                    title = "Paralajmërim Buxheti";
                    message = $"⚠️ RREZIK: Keni përdorur {percentage:0}% të buxhetit tuaj!";
                    type = "Warning";
                    shouldNotify = true;
                }
                else if (percentage >= 50 && percentage < 55)
                {
                    title = "👀 Përditësim i Buxhetit";
                    message = $"Njoftim: Keni përdorur {percentage:0}% të buxhetit tuaj.";
                    type = "Info";
                    shouldNotify = true;
                }
            }

            // Check Recurring Confirmation (only if not Critical)
            if (transaction.IsRecurring == true && type != "Critical")
            {
                title = "Pagese e perseritshme";
                message = $"🔄 Pagesa e perseritshme e {transaction.Amount} {transaction.Currency} u rregjistrua.";
                type = "Info";
                shouldNotify = true;
            }
            // Save Notification & Send Email
            if (shouldNotify)
            {
                var notif = new Notification
                {
                    UserId = transaction.UserId,
                    Title = title,
                    Message = message,
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
                        // 👇 Now you will see the error in your debugger console
                        Console.WriteLine($"[Error] Email failed to send: {ex.Message}");
                    }
                }
            }
        }
        public async Task<Transaction> AddTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            if (!string.IsNullOrEmpty(transaction.Type) && transaction.Type.ToLower() == "expense")
            {
                try
                {
                    await ProcessExpenseLogicAsync(transaction);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Warning] Notification logic failed: {ex.Message}");
                }
            }
            return transaction;
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
            return _context.Categories.Where(w =>  w.Name == categoryName).Select(s => s.CategoryId).FirstOrDefault();
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
                    // Convert DateTime (from CSV) back to DateOnly (for EF Core Model)
                    Date = DateOnly.FromDateTime(dto.Date),
                    CategoryId = dto.CategoryId,
                    Description = dto.Description,
                    IsRecurring = dto.IsRecurring
                }).ToList();

            // 2. Perform Batch Insertion
            _context.Transactions.AddRange(newTransactions);
            foreach (var transaction in newTransactions)
            {
                // Only subtract if it is actually an 'Expense'
                if (!string.IsNullOrEmpty(transaction.Type) && transaction.Type.ToLower() == "expense")
                {
                    // We reuse the same logic we wrote for single transactions
                    // Note: This also sends emails. If you upload 50 items, you might get 50 emails!
                    await ProcessExpenseLogicAsync(transaction);
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
    }
}