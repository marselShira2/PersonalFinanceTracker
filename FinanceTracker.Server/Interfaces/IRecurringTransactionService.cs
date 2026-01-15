namespace FinanceTracker.Server.Interfaces
{
    public interface IRecurringTransactionService
    {
        Task ProcessDueRecurringTransactionsAsync();
        DateOnly CalculateNextOccurrence(DateOnly current, string? frequency);
    }
}
