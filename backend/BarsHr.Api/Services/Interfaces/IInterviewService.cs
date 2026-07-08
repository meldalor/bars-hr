using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.DTOs.Decisions;

namespace BarsHr.Api.Services.Interfaces;

public interface IInterviewService
{
    Task<List<InterviewListItemDto>> GetAllAsync(string? scope = null, int? candidateId = null);
    Task<InterviewDto?> GetByIdAsync(int id);
    Task<InterviewDto> CreateAsync(CreateInterviewRequest request, int currentUserId);
    Task<DecisionDto?> MakeDecisionAsync(int interviewId, CreateDecisionRequest request, int currentUserId);
}
