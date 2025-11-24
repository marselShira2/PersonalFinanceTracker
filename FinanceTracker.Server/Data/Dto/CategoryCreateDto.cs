using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Server.Data.Dto
{
    public class CategoryCreateDto
    {
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Income|Expense)$", ErrorMessage = "Type must be 'Income' or 'Expense'.")]
        public string Type { get; set; } = "Expense"; // Default to Expense

        [StringLength(50)]
        public string? Icon { get; set; }
    }
    public class CategoryUpdateDto
    {
        [StringLength(50)]
        public string? Name { get; set; }

        [RegularExpression("^(Income|Expense)$", ErrorMessage = "Type must be 'Income' or 'Expense'.")]
        public string? Type { get; set; }

        [StringLength(50)]
        public string? Icon { get; set; }
    }
}