namespace FinanceTracker.Server.Data.Dto
{
    public class SetLimitDto
    {
        public int UserId { get; set; }
        public int CategoryId { get; set; }
        public decimal Amount { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
    }
}