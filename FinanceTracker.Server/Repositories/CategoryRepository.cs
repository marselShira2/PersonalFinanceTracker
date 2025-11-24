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
                // Case-insensitive filtering by Type ('Income' or 'Expense')
                query = query.Where(c => c.Type.ToLower() == type.ToLower());
            }

            return await query
                .OrderBy(c => c.Name) // Order alphabetically for better UI presentation
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
            // Note: Since the category object passed in is already tracked and verified by the controller,
            // we just need to update it.
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
            return category;
        }

        /// <summary>
        /// Deletes a category by ID, ensuring it belongs to the specified user.
        /// </summary>
        public async Task<bool> DeleteCategoryAsync(int id, int userId)
        {
            // 1. Fetch the category, secure by userId
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryId == id && c.UserId == userId);

            if (category == null)
            {
                return false; // Not found or doesn't belong to the user
            }

            // 2. IMPORTANT: Handle foreign key constraints (Transactions, Budgets)
            // You cannot delete a category if active transactions or budgets rely on it.
            // Depending on your database setup (Cascade vs. Restrict), you may need to:
            // a) Remove the CategoryId reference from dependent entities (Set NULL)
            // b) Check for dependent entities and throw an exception/return false if found.
            // 
            // For simplicity here, we assume the DB is configured to handle related entities
            // (e.g., setting Transaction.CategoryId to NULL on cascade delete). 
            // If the DB policy is RESTRICT, this SaveChangesAsync() will fail, and you must
            // manually set dependent IDs to null first.

            _context.Categories.Remove(category);
            var changes = await _context.SaveChangesAsync();

            return changes > 0;
        }
    }
}