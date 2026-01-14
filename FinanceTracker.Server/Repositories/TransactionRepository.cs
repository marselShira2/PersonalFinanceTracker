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
            // Get User Email
            var user = await _context.Users.FindAsync(transaction.UserId);
            string? userEmail = user?.Email;

            // Check for Alerts
            await CheckAndNotifyAsync(transaction, userEmail);

            // Save Notifications
            await _context.SaveChangesAsync();
        }

        private async Task CheckAndNotifyAsync(Transaction transaction, string? userEmail)
        {
            string title = "";
            string message = "";
            string type = "Info";
            bool shouldNotify = false;

            // Check Recurring Confirmation
            if (transaction.IsRecurring == true)
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
    }
}