using FinanceTracker.Server.Data.Dto;

namespace FinanceTracker.Server.Interfaces
{
    public interface IDashboardRepository
    {
        Task<DashboardResponseDto> GetDashboardDataAsync(int userId, string period, int? categoryId = null);
        Task<DashboardSummaryDto> GetAllTimeSummaryAsync(int userId);
    }
}
