// ICategoryRepository.cs
using FinanceTracker.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FinanceTracker.Server.Interfaces
{
    public interface ICategoryRepository
    {
        // Get all categories for a specific user, with optional type filter
        Task<IEnumerable<Category>> GetCategoriesByUserIdAsync(int userId, string? type = null);

        // Get a single category by ID, ensuring it belongs to the user
        Task<Category?> GetCategoryByIdAsync(int id, int userId);

        // Add a new category
        Task<Category> AddCategoryAsync(Category category);

        // Update an existing category
        Task<Category> UpdateCategoryAsync(Category category);

        // Delete a category by ID, ensuring it belongs to the user
        Task<bool> DeleteCategoryAsync(int id, int userId);
    }
}