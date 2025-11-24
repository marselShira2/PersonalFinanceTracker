using FinanceTracker.Server.Data;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FinanceTracker.Server.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves a list of categories for a specific user, with optional filtering by type.
        /// </summary>
        public async Task<IEnumerable<Category>> GetCategoriesByUserIdAsync(int userId, string? type = null)
        {
            var query = _context.Categories.Where(c => c.UserId == userId);

            if (!string.IsNullOrEmpty(type))
            { 
                query = query.Where(c => c.Type.ToLower() == type.ToLower());
            }

            return await query
                .OrderBy(c => c.Name)  
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a single category by ID, ensuring it belongs to the specified user.
        /// </summary>
        public async Task<Category?> GetCategoryByIdAsync(int id, int userId)
        {
            // Crucial: Filters by both CategoryId and UserId for security
            return await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == id && c.UserId == userId);
        }

        /// <summary>
        /// Adds a new category to the database.
        /// </summary>
        public async Task<Category> AddCategoryAsync(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        /// <summary>
        /// Updates an existing category in the database.
        /// </summary>
        public async Task<Category> UpdateCategoryAsync(Category category)
        { 
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
            return category;
        }

        /// <summary>
        /// Deletes a category by ID, ensuring it belongs to the specified user.
        /// </summary>
        public async Task<bool> DeleteCategoryAsync(int id, int userId)
        { 
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == id && c.UserId == userId);

            if (category == null)
            {
                return false;  
            }
 
            _context.Categories.Remove(category);
            var changes = await _context.SaveChangesAsync();

            return changes > 0;
        }
    }
}