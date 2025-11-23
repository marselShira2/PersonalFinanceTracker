// CategoriesController.cs
using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.Server.Controllers
{
    [Authorize] // 🔐 Requires authentication for all endpoints
    [Route("api/[controller]")] // Base Route: /api/Categories
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;

        // Constructor injection of the repository
        public CategoriesController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        // Helper to securely get UserId from the JWT token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found or invalid in token claims.");
        }

        // --- CRUD Endpoints ---

        // 🎯 ROUTE: GET /api/Categories?type=Income
        [HttpGet]
        public async Task<IActionResult> GetCategories([FromQuery] string? type)
        {
            try
            {
                int userId = GetUserId();
                var categories = await _categoryRepository.GetCategoriesByUserIdAsync(userId, type);
                return Ok(categories);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error occurred.", Error = ex.Message });
            }
        }

        // 🎯 ROUTE: GET /api/Categories/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            try
            {
                int userId = GetUserId();
                var category = await _categoryRepository.GetCategoryByIdAsync(id, userId);

                if (category == null)
                {
                    return NotFound(); // Returns 404 if not found or if it belongs to another user
                }

                return Ok(category);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error occurred.", Error = ex.Message });
            }
        }


        // 🎯 ROUTE: POST /api/Categories
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                int userId = GetUserId();

                var category = new Category
                {
                    UserId = userId,
                    Name = dto.Name,
                    Type = dto.Type,
                    Icon = dto.Icon
                };

                var newCategory = await _categoryRepository.AddCategoryAsync(category);

                // Return 201 Created and a link to the new resource
                return CreatedAtAction(nameof(GetCategory), new { id = newCategory.CategoryId }, newCategory);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error occurred.", Error = ex.Message });
            }
        }


        // 🎯 ROUTE: PUT /api/Categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                int userId = GetUserId();
                var category = await _categoryRepository.GetCategoryByIdAsync(id, userId);

                if (category == null)
                {
                    return NotFound("Category not found or unauthorized.");
                }

                // Apply updates (only if the DTO field is provided)
                category.Name = dto.Name ?? category.Name;
                category.Type = dto.Type ?? category.Type;
                category.Icon = dto.Icon ?? category.Icon;

                // Ensure required fields aren't made null (though this is enforced by DTO attributes above)
                if (string.IsNullOrEmpty(category.Name) || string.IsNullOrEmpty(category.Type))
                {
                    return BadRequest("Category Name and Type are required.");
                }

                await _categoryRepository.UpdateCategoryAsync(category);

                return Ok(category);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error occurred.", Error = ex.Message });
            }
        }

        // 🎯 ROUTE: DELETE /api/Categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                int userId = GetUserId();

                bool success = await _categoryRepository.DeleteCategoryAsync(id, userId);

                if (!success)
                {
                    return NotFound("Category not found or unauthorized.");
                }

                return NoContent(); // 204 No Content on successful deletion
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User ID not found in token." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error occurred.", Error = ex.Message });
            }
        }
    }
}