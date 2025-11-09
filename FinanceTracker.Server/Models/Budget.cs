using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Models;

[Table("budgets")]
public partial class Budget
{
    [Key]
    [Column("budget_id")]
    public int BudgetId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("category_id")]
    public int CategoryId { get; set; }

    [Column("amount", TypeName = "decimal(12, 2)")]
    public decimal Amount { get; set; }

    [Column("month")]
    [StringLength(7)]
    public string Month { get; set; } = null!;

    [ForeignKey("CategoryId")]
    [InverseProperty("Budgets")]
    public virtual Category Category { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("Budgets")]
    public virtual User User { get; set; } = null!;
}
