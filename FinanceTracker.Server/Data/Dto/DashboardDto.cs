namespace FinanceTracker.Server.Data.Dto
{
    public class DashboardSummaryDto
    {
        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }
        public decimal Balance { get; set; }
        public int TotalTransactions { get; set; }
    }

    public class PeriodDataDto
    {
        public string Period { get; set; } = null!;
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
    }

    public class CategoryBreakdownDto
    {
        public string CategoryName { get; set; } = null!;
        public decimal Amount { get; set; }
        public string Type { get; set; } = null!;
    }

    public class DashboardResponseDto
    {
        public DashboardSummaryDto Summary { get; set; } = null!;
        public List<PeriodDataDto> PeriodData { get; set; } = new();
        public List<CategoryBreakdownDto> CategoryBreakdown { get; set; } = new();
    }
}
