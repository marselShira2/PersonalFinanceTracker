using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Models;

[Table("transactions")]
public partial class Transaction
{
    [Key]
    [Column("transaction_id")]
    public int TransactionId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("category_id")]
    public int? CategoryId { get; set; }

    [Column("currency")]
    [StringLength(5)]
    public string Currency { get; set; } = null!;

    [Column("type")]
    [StringLength(10)]
    public string Type { get; set; } = null!;

    [Column("amount", TypeName = "decimal(12, 2)")]
    public decimal Amount { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("date")]
    public DateOnly Date { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Transactions")]
    public virtual Category? Category { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Transactions")]
    public virtual User User { get; set; } = null!;
}
