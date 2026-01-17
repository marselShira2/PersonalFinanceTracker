using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Interfaces
{
    public interface IExpenseLimitRepository
    {
        Task<ExpenseLimit> SetLimitAsync(int userId, int categoryId, decimal amount, int month, int year, bool isActive = true);
        Task<ExpenseLimit?> GetLimitAsync(int userId, int categoryId, int month, int year);
        Task<List<ExpenseLimit>> GetAllLimitsAsync(int userId, int month, int year);
        Task<bool> DeleteLimitAsync(int userId, int categoryId, int month, int year);
        Task<decimal> GetCategorySpentAsync(int userId, int categoryId, int month, int year);
        Task<bool> IsLimitActiveAsync(int userId, int categoryId, int month, int year);
    }
}