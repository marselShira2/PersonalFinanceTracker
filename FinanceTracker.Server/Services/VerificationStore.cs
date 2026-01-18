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
        private readonly ConcurrentDictionary<string, PendingRegistration> _emailToPending = new();
        private readonly ConcurrentDictionary<int, bool> _verifiedUsers = new();

        public void AddCode(string email, string code, string username, string hashedPassword, string currency)
        {
            var registration = new PendingRegistration
            {
                Email = email,
                Username = username,
                HashedPassword = hashedPassword,
                Currency = currency
            };
            _codes[code] = registration;
            _emailToPending[email] = registration;
        }

        public (bool IsValid, string Email, string Username, string HashedPassword, string Currency) ValidateCode(string code)
        {
            if (_codes.TryRemove(code, out var registration))
            {
                _emailToPending.TryRemove(registration.Email, out _);
                return (true, registration.Email, registration.Username, registration.HashedPassword, registration.Currency);
            }
            return (false, string.Empty, string.Empty, string.Empty, string.Empty);
        }

        public (string Email, string Username, string HashedPassword, string Currency)? GetPendingVerification(string email)
        {
            if (_emailToPending.TryGetValue(email, out var registration))
            {
                return (registration.Email, registration.Username, registration.HashedPassword, registration.Currency);
            }
            return null;
        }

        public void UpdateCode(string email, string newCode)
        {
            if (_emailToPending.TryGetValue(email, out var registration))
            {
                // Remove old code entries
                var oldCodeToRemove = _codes.FirstOrDefault(kvp => kvp.Value.Email == email).Key;
                if (oldCodeToRemove != null)
                {
                    _codes.TryRemove(oldCodeToRemove, out _);
                }
                
                // Add new code
                _codes[newCode] = registration;
            }
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