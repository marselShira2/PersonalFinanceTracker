using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Interfaces
{
    public interface IExpenseLimitRepository
    {
      
        Task<ExpenseLimit> SetLimitAsync(int userId, decimal amount);

        
        Task<ExpenseLimit?> GetLimitAsync(int userId);
    }
}