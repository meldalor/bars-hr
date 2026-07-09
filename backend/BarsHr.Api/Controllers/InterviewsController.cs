using BarsHr.Api.Domain;
using BarsHr.Api.DTOs.Decisions;
using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.Extensions;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class InterviewsController : ControllerBase
{
    private readonly IInterviewService _interviewService;

    public InterviewsController(IInterviewService interviewService)
    {
        _interviewService = interviewService;
    }

    [HttpGet]
    public async Task<ActionResult<List<InterviewListItemDto>>> GetAll(
        [FromQuery] string? scope,
        [FromQuery] int? candidateId)
    {
        var result = await _interviewService.GetAllAsync(scope, candidateId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewDto>> GetById(int id)
    {
        var interview = await _interviewService.GetByIdAsync(id);
        if (interview == null) return NotFound();
        return Ok(interview);
    }

    [HttpPost]
    public async Task<ActionResult<InterviewDto>> Create([FromBody] CreateInterviewRequest request)
    {
        var currentUserId = User.GetUserId();

        try
        {
            var created = await _interviewService.CreateAsync(request, currentUserId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InterviewDto>> Update(int id, [FromBody] UpdateInterviewRequest request)
    {
        try
        {
            var updated = await _interviewService.UpdateAsync(id, request, User.GetUserId());
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // отмена интервью: 409, если по нему уже вынесено решение
    [HttpDelete("{id}")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var found = await _interviewService.CancelAsync(id, User.GetUserId());
            if (!found) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // итоговое решение выносит DecisionMaker (админу тоже разрешаем)
    [Authorize(Roles = Roles.DecisionMaker + "," + Roles.Admin)]
    [HttpPost("{interviewId}/decision")]
    public async Task<ActionResult<DecisionDto>> MakeDecision(
        int interviewId,
        [FromBody] CreateDecisionRequest request)
    {
        var currentUserId = User.GetUserId();

        try
        {
            var result = await _interviewService.MakeDecisionAsync(interviewId, request, currentUserId);

            if (result == null)
                return NotFound(new { message = "Интервью не найдено" });

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
