using BarsHr.Api.DTOs.Candidates;

namespace BarsHr.Api.Services.Interfaces;

public interface ICandidateService
{
    Task<List<CandidateListItemDto>> GetAllAsync(
        string? search = null, string? status = null, bool includeArchived = false,
        int page = 1, int pageSize = 20);
    Task<CandidateDto?> GetByIdAsync(int id);
    Task<CandidateDto> CreateAsync(CreateCandidateRequest request, int currentUserId);
    Task<CandidateDto?> UpdateAsync(int id, UpdateCandidateRequest request, int currentUserId);
    Task<bool> SetArchivedAsync(int id, bool archived);
}
