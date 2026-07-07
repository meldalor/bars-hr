using BarsHr.Api.DTOs.Evaluations;
using BarsHr.Api.DTOs.Interviews;

namespace BarsHr.Api.Services.Interfaces;

public interface IEvaluationService
{
    Task<InterviewDto?> UpsertAsync(int interviewId, UpsertEvaluationsRequest request, int currentUserId);
}
