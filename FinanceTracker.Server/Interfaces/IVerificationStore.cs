namespace FinanceTracker.Server.Interfaces
{
    public interface IVerificationStore
    {
        void AddCode(int userId, string code);

        // Check if the provided code is valid for any user
        (bool IsValid, int UserId) ValidateCode(string code);

        bool IsUserVerified(int userId);

        void SetUserVerified(int userId);
    }
}