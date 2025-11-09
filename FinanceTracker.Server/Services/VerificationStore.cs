using FinanceTracker.Server.Interfaces;
using System.Collections.Concurrent;
namespace FinanceTracker.Server.Services
{
    public class VerificationStore : IVerificationStore
    {
        private readonly ConcurrentDictionary<string, int> _codes = new ConcurrentDictionary<string, int>();
        private readonly ConcurrentDictionary<int, bool> _verifiedUsers = new ConcurrentDictionary<int, bool>();

        public void AddCode(int userId, string code)
        {
            _codes.TryAdd(code, userId);
            _verifiedUsers.TryAdd(userId, false); // Initialize as unverified
        }

        public (bool IsValid, int UserId) ValidateCode(string code)
        {
            if (_codes.TryRemove(code, out int userId))
            {
                return (true, userId);
            }
            return (false, 0);
        }

        public bool IsUserVerified(int userId)
        {
            return _verifiedUsers.TryGetValue(userId, out bool isVerified) && isVerified;
        }

        public void SetUserVerified(int userId)
        {
            // Set the user's status to true
            _verifiedUsers.TryUpdate(userId, true, false);
        }
    }
}