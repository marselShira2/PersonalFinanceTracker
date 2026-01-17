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

        public async Task<ExpenseLimit> SetLimitAsync(int userId, int categoryId, decimal amount, int month, int year, bool isActive = true)
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
                    Year = year,
                    IsActive = isActive,
                    StartDate = DateOnly.FromDateTime(DateTime.Now)
                };
                _context.ExpenseLimits.Add(limit);
            }
            else
            {
                // When toggling from active to inactive, store current spending in Balance
                if (limit.IsActive && !isActive)
                {
                    var currentSpent = await GetCategorySpentAsync(userId, categoryId, month, year);
                    limit.Balance = limit.LimitAmount - currentSpent;
                }
                // When reactivating, set new start date
                else if (!limit.IsActive && isActive)
                {
                    limit.StartDate = DateOnly.FromDateTime(DateTime.Now);
                }
                
                limit.LimitAmount = amount;
                limit.IsActive = isActive;
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

            var limit = await _context.ExpenseLimits
                .FirstOrDefaultAsync(x => x.UserId == userId && x.CategoryId == categoryId && x.Month == month && x.Year == year);

            // If limit is inactive, return the stored balance (frozen amount)
            if (limit != null && !limit.IsActive)
            {
                return limit.LimitAmount - limit.Balance;
            }

            // If active, only count transactions from StartDate forward
            var effectiveStartDate = limit?.StartDate ?? startDate;
            if (effectiveStartDate < startDate) effectiveStartDate = startDate;
            
            return await _context.Transactions
                .Where(x => x.UserId == userId && x.CategoryId == categoryId && x.Type == "expense" && 
                           x.Date >= effectiveStartDate && x.Date <= endDate)
                .SumAsync(x => (decimal?)x.Amount) ?? 0;
        }

        public async Task<bool> IsLimitActiveAsync(int userId, int categoryId, int month, int year)
        {
            var limit = await _context.ExpenseLimits
                .FirstOrDefaultAsync(x => x.UserId == userId && x.CategoryId == categoryId && x.Month == month && x.Year == year);
            
            return limit?.IsActive ?? false;
        }
    }
}