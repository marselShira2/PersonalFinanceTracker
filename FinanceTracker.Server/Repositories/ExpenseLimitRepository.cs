using FinanceTracker.Server.Data;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Repositories
{
    public class ExpenseLimitRepository : IExpenseLimitRepository
    {
        private readonly AppDbContext _context;

        public ExpenseLimitRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ExpenseLimit?> GetLimitAsync(int userId)
        {
            return await _context.ExpenseLimits
                .FirstOrDefaultAsync(x => x.UserId == userId);
        }

        public async Task<ExpenseLimit> SetLimitAsync(int userId, decimal amount)
        {
            var limit = await _context.ExpenseLimits.FirstOrDefaultAsync(x => x.UserId == userId);

            if (limit == null)
            {
                // Create new limit logic
                limit = new ExpenseLimit
                {
                    UserId = userId,
                    LimitAmount = amount,
                    Balance = amount, // Start with full balance
                    StartDate = DateOnly.FromDateTime(DateTime.Now),
                    IsActive = true
                };
                _context.ExpenseLimits.Add(limit);
            }
            else
            {
                // Update existing logic
                limit.LimitAmount = amount;
                limit.Balance = amount; // Resetting the goal resets the balance
                limit.StartDate = DateOnly.FromDateTime(DateTime.Now);
                limit.IsActive = true;
                _context.ExpenseLimits.Update(limit);
            }

            await _context.SaveChangesAsync();
            return limit;
        }
    }
}