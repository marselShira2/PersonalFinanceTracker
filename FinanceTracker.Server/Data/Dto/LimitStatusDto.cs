namespace FinanceTracker.Server.Data.Dto
{
    public class LimitStatusDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public decimal LimitAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public decimal PercentageSpent { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }
}