using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceTracker.Server.Models
{
    // 🎯 FIX: This tells EF to look for "expense_limits" in the DB, not "ExpenseLimits"
    [Table("expense_limits")]
    public class ExpenseLimit
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("category_id")]
        public int CategoryId { get; set; }

        [Column("limit_amount", TypeName = "decimal(18,2)")]
        public decimal LimitAmount { get; set; }

        [Column("month")]
        public int Month { get; set; }

        [Column("year")]
        public int Year { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("CategoryId")]
        public Category Category { get; set; } = null!;
    }
}