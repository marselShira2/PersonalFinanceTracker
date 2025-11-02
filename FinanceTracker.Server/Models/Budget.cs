using System;
using System.Collections.Generic;

namespace FinanceTracker.Server.Models;

public partial class Budget
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int CategoryId { get; set; }

    public decimal MonthlyLimit { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
