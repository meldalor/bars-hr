using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.DTOs.Evaluations;
namespace BarsHr.Api.Services.Interfaces;

public interface IInterviewService
{
    Task<InterviewDto?> GetByIdAsync(int id);
    
    Task<List<InterviewDto>> GetByApplicationIdAsync(int applicationId);
    
    Task<InterviewDto> CreateAsync(CreateInterviewRequest request, int currentUserId);
    
    Task<InterviewDto?> UpdateAsync(int id, UpdateInterviewRequest request, int currentUserId);
    Task<EvaluationDto> AddEvaluationAsync(int interviewId, CreateEvaluationRequest request, int currentUserId);
}