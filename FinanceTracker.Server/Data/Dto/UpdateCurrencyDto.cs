using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Server.Data.Dto
{
    public class UpdateCurrencyDto
    {
        [Required]
        [StringLength(3, MinimumLength = 3)]
        public string Currency { get; set; } = null!;
    }
}