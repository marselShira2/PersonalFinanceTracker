namespace FinanceTracker.Server.Data.Dto
{
    public class LimitStatusDto
    {
        public decimal LimitAmount { get; set; }
        public decimal Balance { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal PercentageSpent { get; set; }
        public string WarningMessage { get; set; } // The new message field
        public bool IsActive { get; set; }
    }
}