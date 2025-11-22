using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Server.Data.Dto
{
    public class TransactionCreateDto
    {
        [Required]
        [StringLength(10)]
        public string Type { get; set; } = null!; // Income or Expense

        [Required]
        [Range(0.01, 9999999.99)] // Must be a positive amount
        public decimal Amount { get; set; }

        [Required]
        [StringLength(5)]
        public string Currency { get; set; } = null!;

        [Required]
        public DateOnly Date { get; set; }

        public int? CategoryId { get; set; }

        public string? Description { get; set; }

        public bool IsRecurring { get; set; } = false;
    }

    public class TransactionUpdateDto
    {

        [StringLength(10)]
        public string? Type { get; set; }

        [Range(0.01, 9999999.99)]
        public decimal? Amount { get; set; }

        [StringLength(5)]
        public string? Currency { get; set; }

        public DateOnly? Date { get; set; }

        public int? CategoryId { get; set; }

        public string? Description { get; set; }

        public bool? IsRecurring { get; set; }
    }
}