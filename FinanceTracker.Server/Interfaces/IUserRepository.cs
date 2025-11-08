using FinanceTracker.Server.Models;

namespace FinanceTracker.Server.Interfaces
{
    public interface IUserRepository
    {
        Task<User> AddUserAsync(User user);
        Task<User?> GetUserByEmailAsync(string email);
        Task<List<User>> GetAllUsers();
        Task<User?> GetUserByIdAsync(int userId); //for reset password
        Task SaveChangesAsync();

        Task<User?> GetUserByResetTokenAsync(string token);
    }
}
