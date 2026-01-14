using FinanceTracker.Server.Interfaces;
using System.Collections.Concurrent;

namespace FinanceTracker.Server.Services
{
    public class VerificationStore : IVerificationStore
    {
        private class PendingRegistration
        {
            public string Email { get; set; } = null!;
            public string Username { get; set; } = null!;
            public string HashedPassword { get; set; } = null!;
            public string Currency { get; set; } = null!;
        }

        private readonly ConcurrentDictionary<string, PendingRegistration> _codes = new();
        private readonly ConcurrentDictionary<int, bool> _verifiedUsers = new();

        public void AddCode(string email, string code, string username, string hashedPassword, string currency)
        {
            _codes[code] = new PendingRegistration
            {
                Email = email,
                Username = username,
                HashedPassword = hashedPassword,
                Currency = currency
            };
        }

        public (bool IsValid, string Email, string Username, string HashedPassword, string Currency) ValidateCode(string code)
        {
            if (_codes.TryRemove(code, out var registration))
            {
                return (true, registration.Email, registration.Username, registration.HashedPassword, registration.Currency);
            }
            return (false, string.Empty, string.Empty, string.Empty, string.Empty);
        }

        public bool IsUserVerified(int userId)
        {
            return _verifiedUsers.TryGetValue(userId, out bool isVerified) && isVerified;
        }

        public void SetUserVerified(int userId)
        {
            _verifiedUsers[userId] = true;
        }
    }
}