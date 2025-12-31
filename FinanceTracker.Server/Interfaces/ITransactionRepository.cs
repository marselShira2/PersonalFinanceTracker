using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Interfaces
{
    public interface ITransactionRepository
    {
        Task<Transaction> AddTransactionAsync(Transaction transaction);

        // CRUDs
        Task<Transaction?> GetTransactionByIdAsync(int transactionId, int userId);
        Task<List<Transaction>> GetAllTransactionsAsync(int userId);
        Task<bool> UpdateTransactionAsync(Transaction transaction);

        Task<bool> DeleteTransactionAsync(int transactionId, int userId);

        Task<List<Transaction>> GetFilteredTransactionsAsync(int userId, string? type, bool? isRecurring);
        Task AddTransactionsFromCsvAsync(List<CsvTransactionDto> transactions);
    }

}