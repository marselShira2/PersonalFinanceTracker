namespace FinanceTracker.Server.Data.Dto
{
    public class UserVerifyCodeDto
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
    }
}