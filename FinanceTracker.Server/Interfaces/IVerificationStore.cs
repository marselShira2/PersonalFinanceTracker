namespace FinanceTracker.Server.Interfaces
{
    public interface IVerificationStore
    {
        void AddCode(string email, string code, string username, string hashedPassword, string currency);
        (bool IsValid, string Email, string Username, string HashedPassword, string Currency) ValidateCode(string code);
        bool IsUserVerified(int userId);
        void SetUserVerified(int userId);
        (string Email, string Username, string HashedPassword, string Currency)? GetPendingVerification(string email);
        void UpdateCode(string email, string newCode);
    }
}