using BarsHr.Api.DTOs.Evaluations;
using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.Extensions;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/interviews/{interviewId}/evaluations")]
public class EvaluationsController : ControllerBase
{
    private readonly IEvaluationService _evaluationService;

    public EvaluationsController(IEvaluationService evaluationService)
    {
        _evaluationService = evaluationService;
    }

    [HttpPut]
    public async Task<ActionResult<InterviewDto>> Upsert(
        int interviewId,
        [FromBody] UpsertEvaluationsRequest request)
    {
        var currentUserId = User.GetUserId();

        try
        {
            var updated = await _evaluationService.UpsertAsync(interviewId, request, currentUserId);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
