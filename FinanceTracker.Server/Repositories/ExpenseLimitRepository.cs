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

        public async Task<ExpenseLimit> SetLimitAsync(int userId, int categoryId, decimal amount, int month, int year)
        {
            var limit = await _context.ExpenseLimits
                .FirstOrDefaultAsync(x => x.UserId == userId && x.CategoryId == categoryId && x.Month == month && x.Year == year);

            if (limit == null)
            {
                limit = new ExpenseLimit
                {
                    UserId = userId,
                    CategoryId = categoryId,
                    LimitAmount = amount,
                    Month = month,
                    Year = year
                };
                _context.ExpenseLimits.Add(limit);
            }
            else
            {
                limit.LimitAmount = amount;
                _context.ExpenseLimits.Update(limit);
            }

            await _context.SaveChangesAsync();
            return limit;
        }

        public async Task<ExpenseLimit?> GetLimitAsync(int userId, int categoryId, int month, int year)
        {
            return await _context.ExpenseLimits
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.UserId == userId && x.CategoryId == categoryId && x.Month == month && x.Year == year);
        }

        public async Task<List<ExpenseLimit>> GetAllLimitsAsync(int userId, int month, int year)
        {
            return await _context.ExpenseLimits
                .Include(x => x.Category)
                .Where(x => x.UserId == userId && x.Month == month && x.Year == year)
                .ToListAsync();
        }

        public async Task<bool> DeleteLimitAsync(int userId, int categoryId, int month, int year)
        {
            var limit = await _context.ExpenseLimits
                .FirstOrDefaultAsync(x => x.UserId == userId && x.CategoryId == categoryId && x.Month == month && x.Year == year);

            if (limit == null) return false;

            _context.ExpenseLimits.Remove(limit);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal> GetCategorySpentAsync(int userId, int categoryId, int month, int year)
        {
            var startDate = new DateOnly(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            return await _context.Transactions
                .Where(x => x.UserId == userId && x.CategoryId == categoryId && x.Type == "expense" && x.Date >= startDate && x.Date <= endDate)
                .SumAsync(x => (decimal?)x.Amount) ?? 0;
        }
    }
}