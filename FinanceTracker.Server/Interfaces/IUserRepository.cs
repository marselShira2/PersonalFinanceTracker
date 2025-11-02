using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Interfaces
{
    public interface IUserRepository
    {
        Task<User> AddUserAsync(User user);
        Task<User?> GetUserByEmailAsync(string email);
        Task SaveChangesAsync();
    }
}
