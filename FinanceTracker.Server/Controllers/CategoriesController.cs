// CategoriesController.cs
using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")] // Base Route: /api/Categories
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoriesController(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found or invalid in token claims.");
        }

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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            try
            {
                int userId = GetUserId();
                var category = await _categoryRepository.GetCategoryByIdAsync(id, userId);

                if (category == null)
                {
                    return NotFound();
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

                category.Name = dto.Name ?? category.Name;
                category.Type = dto.Type ?? category.Type;
                category.Icon = dto.Icon ?? category.Icon;

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

                return NoContent();
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