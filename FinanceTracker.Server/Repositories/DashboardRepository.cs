using FinanceTracker.Server.Data;
using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly AppDbContext _context;

        public DashboardRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetAllTimeSummaryAsync(int userId)
        {
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var totalIncome = transactions.Where(t => t.Type.ToLower() == "income").Sum(t => (decimal?)t.Amount) ?? 0;
            var totalExpense = transactions.Where(t => t.Type.ToLower() == "expense").Sum(t => (decimal?)t.Amount) ?? 0;

            return new DashboardSummaryDto
            {
                TotalIncome = totalIncome,
                TotalExpense = totalExpense,
                Balance = totalIncome - totalExpense,
                TotalTransactions = transactions.Count
            };
        }

        public async Task<DashboardResponseDto> GetDashboardDataAsync(int userId, string period, int? categoryId = null)
        {
            var query = _context.Transactions
                .Include(t => t.Category)
                .Where(t => t.UserId == userId);

            if (categoryId.HasValue)
            {
                query = query.Where(t => t.CategoryId == categoryId.Value);
            }

            var (startDate, endDate) = GetDateRange(period);
            var transactions = await query
                .Where(t => t.Date >= startDate && t.Date <= endDate)
                .ToListAsync();

            var summary = new DashboardSummaryDto
            {
                TotalIncome = transactions.Where(t => t.Type.ToLower() == "income").Sum(t => (decimal?)t.Amount) ?? 0,
                TotalExpense = transactions.Where(t => t.Type.ToLower() == "expense").Sum(t => (decimal?)t.Amount) ?? 0,
                TotalTransactions = transactions.Count
            };
            summary.Balance = summary.TotalIncome - summary.TotalExpense;

            var periodData = GetPeriodData(transactions, period);
            var categoryBreakdown = transactions
                .GroupBy(t => new { t.Category?.Name, t.Type })
                .Select(g => new CategoryBreakdownDto
                {
                    CategoryName = g.Key.Name ?? "Uncategorized",
                    Amount = g.Sum(t => t.Amount),
                    Type = g.Key.Type
                })
                .OrderByDescending(c => c.Amount)
                .ToList();

            return new DashboardResponseDto
            {
                Summary = summary,
                PeriodData = periodData,
                CategoryBreakdown = categoryBreakdown
            };
        }

        private (DateOnly startDate, DateOnly endDate) GetDateRange(string period)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            
            return period.ToLower() switch
            {
                "week" => (today.AddDays(-(int)today.DayOfWeek), today),
                "month" => (new DateOnly(today.Year, today.Month, 1), today),
                "year" => (new DateOnly(today.Year, 1, 1), today),
                "q1" => (new DateOnly(today.Year, 1, 1), new DateOnly(today.Year, 3, 31)),
                "q2" => (new DateOnly(today.Year, 4, 1), new DateOnly(today.Year, 6, 30)),
                "q3" => (new DateOnly(today.Year, 7, 1), new DateOnly(today.Year, 9, 30)),
                "q4" => (new DateOnly(today.Year, 10, 1), new DateOnly(today.Year, 12, 31)),
                _ => (new DateOnly(today.Year, 1, 1), today)
            };
        }

        private List<PeriodDataDto> GetPeriodData(List<Models.Transaction> transactions, string period)
        {
            return period.ToLower() switch
            {
                "week" => GetWeeklyData(transactions),
                "month" => GetMonthlyData(transactions),
                "year" => GetYearlyData(transactions),
                "q1" or "q2" or "q3" or "q4" => GetQuarterlyData(transactions),
                _ => GetYearlyData(transactions)
            };
        }

        private List<PeriodDataDto> GetWeeklyData(List<Models.Transaction> transactions)
        {
            return transactions
                .GroupBy(t => t.Date.DayOfWeek)
                .Select(g => new PeriodDataDto
                {
                    Period = g.Key.ToString(),
                    Income = g.Where(t => t.Type.ToLower() == "income").Sum(t => (decimal?)t.Amount) ?? 0,
                    Expense = g.Where(t => t.Type.ToLower() == "expense").Sum(t => (decimal?)t.Amount) ?? 0
                })
                .OrderBy(p => Enum.Parse<DayOfWeek>(p.Period))
                .ToList();
        }

        private List<PeriodDataDto> GetMonthlyData(List<Models.Transaction> transactions)
        {
            return transactions
                .GroupBy(t => t.Date.Day)
                .Select(g => new PeriodDataDto
                {
                    Period = $"Day {g.Key}",
                    Income = g.Where(t => t.Type.ToLower() == "income").Sum(t => (decimal?)t.Amount) ?? 0,
                    Expense = g.Where(t => t.Type.ToLower() == "expense").Sum(t => (decimal?)t.Amount) ?? 0
                })
                .OrderBy(p => int.Parse(p.Period.Replace("Day ", "")))
                .ToList();
        }

        private List<PeriodDataDto> GetYearlyData(List<Models.Transaction> transactions)
        {
            return transactions
                .GroupBy(t => t.Date.Month)
                .Select(g => new PeriodDataDto
                {
                    Period = new DateTime(2000, g.Key, 1).ToString("MMMM"),
                    Income = g.Where(t => t.Type.ToLower() == "income").Sum(t => (decimal?)t.Amount) ?? 0,
                    Expense = g.Where(t => t.Type.ToLower() == "expense").Sum(t => (decimal?)t.Amount) ?? 0
                })
                .OrderBy(p => DateTime.ParseExact(p.Period, "MMMM", null).Month)
                .ToList();
        }

        private List<PeriodDataDto> GetQuarterlyData(List<Models.Transaction> transactions)
        {
            return transactions
                .GroupBy(t => t.Date.Month)
                .Select(g => new PeriodDataDto
                {
                    Period = new DateTime(2000, g.Key, 1).ToString("MMMM"),
                    Income = g.Where(t => t.Type.ToLower() == "income").Sum(t => (decimal?)t.Amount) ?? 0,
                    Expense = g.Where(t => t.Type.ToLower() == "expense").Sum(t => (decimal?)t.Amount) ?? 0
                })
                .OrderBy(p => DateTime.ParseExact(p.Period, "MMMM", null).Month)
                .ToList();
        }
    }
}
