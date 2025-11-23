using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization; // 👈 Add this using statement

namespace FinanceTracker.Server.Models;

[Table("categories")]
public partial class Category
{
    [Key]
    [Column("category_id")]
    public int CategoryId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("type")]
    [StringLength(10)]
    public string Type { get; set; } = null!;

    [Column("icon")]
    [StringLength(50)]
    public string? Icon { get; set; }

    [InverseProperty("Category")]
    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    // 🛑 CRITICAL FIX: Add [JsonIgnore] here.
    // This tells the System.Text.Json serializer to skip this property 
    // when serializing the Category object, breaking the loop (Category -> Transactions -> Category).
    [JsonIgnore]
    [InverseProperty("Category")]
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    [ForeignKey("UserId")]
    [InverseProperty("Categories")]
    public virtual User User { get; set; } = null!;
}