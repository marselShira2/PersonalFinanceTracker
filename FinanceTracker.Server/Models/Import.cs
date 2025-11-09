using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Server.Models;

[Table("imports")]
public partial class Import
{
    [Key]
    [Column("import_id")]
    public int ImportId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("filename")]
    [StringLength(255)]
    public string Filename { get; set; } = null!;

    [Column("upload_date", TypeName = "datetime")]
    public DateTime? UploadDate { get; set; }

    [Column("status")]
    [StringLength(20)]
    public string? Status { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Imports")]
    public virtual User User { get; set; } = null!;
}
