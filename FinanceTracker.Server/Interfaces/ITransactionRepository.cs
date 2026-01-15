using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Interfaces
{
    public interface ITransactionRepository
    {
        Task<Transaction> AddTransactionAsync(Transaction transaction);
        Task<User?> GetUserByIdAsync(int userId);

        // CRUDs
        Task<Transaction?> GetTransactionByIdAsync(int transactionId, int userId);
        Task<List<Transaction>> GetAllTransactionsAsync(int userId);
        Task<bool> UpdateTransactionAsync(Transaction transaction);

        Task<bool> DeleteTransactionAsync(int transactionId, int userId);

        Task<List<Transaction>> GetFilteredTransactionsAsync(int userId, string? type, bool? isRecurring);
        Task<List<Transaction>> GetTransactionsByDateRangeAsync(int userId, DateTime? startDate, DateTime? endDate);
        Task AddTransactionsFromCsvAsync(List<CsvTransactionDto> transactions);
        Task<int> GetCategoryIdByName(string categoryName);
    }

}