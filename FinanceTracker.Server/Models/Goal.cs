using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Models;

[Table("goals")]
public partial class Goal
{
    [Key]
    [Column("goal_id")]
    public int GoalId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("target_amount", TypeName = "decimal(12, 2)")]
    public decimal TargetAmount { get; set; }

    [Column("current_amount", TypeName = "decimal(12, 2)")]
    public decimal? CurrentAmount { get; set; }

    [Column("deadline")]
    public DateOnly? Deadline { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Goals")]
    public virtual User User { get; set; } = null!;
}
