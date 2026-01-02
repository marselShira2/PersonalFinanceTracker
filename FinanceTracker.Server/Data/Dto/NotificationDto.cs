using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Server.Data.Dto
{
    public class NotificationCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; } = null!;

        [Required]
        public string Message { get; set; } = null!;

        [StringLength(20)]
        public string Type { get; set; } = "general";
    }

    public class NotificationResponseDto
    {
        public int NotificationId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class NotificationListResponseDto
    {
        public List<NotificationResponseDto> Notifications { get; set; } = new();
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
        public bool HasMore { get; set; }
    }

    public class MarkReadDto
    {
        public List<int> NotificationIds { get; set; } = new();
    }
}