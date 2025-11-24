using FinanceTracker.Server.Data;
using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _context;

        public TransactionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Transaction> AddTransactionAsync(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
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


        public async Task AddTransactionsFromCsvAsync(List<CsvTransactionDto> csvTransactions)
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

            // 3. Save Changes
            await _context.SaveChangesAsync();
        }
    }
}