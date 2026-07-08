using BarsHr.Api.DTOs.Vacancies;

namespace BarsHr.Api.Services.Interfaces;

public interface IVacancyService
{
    Task<List<VacancyListItemDto>> GetAllAsync(
        string? search = null,
        string? status = null,
        bool includeArchived = false,
        int page = 1,
        int pageSize = 20);

    Task<VacancyDto?> GetByIdAsync(int id);

    Task<VacancyDto> CreateAsync(CreateVacancyRequest request, int currentUserId);

    Task<VacancyDto?> UpdateAsync(int id, UpdateVacancyRequest request, int currentUserId);

    Task<bool> SetArchivedAsync(int id, bool archived);
}