using BarsHr.Api.DTOs.Applications;

namespace BarsHr.Api.Services.Interfaces;

public interface IApplicationService
{
    Task<List<ApplicationDto>> GetAllAsync(int? candidateId = null, int? vacancyId = null);
    Task<ApplicationDto?> GetByIdAsync(int id);
    Task<ApplicationDto> CreateAsync(CreateApplicationRequest request, int currentUserId);
    Task<ApplicationDto?> UpdateStatusAsync(int id, UpdateApplicationStatusRequest request, int currentUserId);
}
