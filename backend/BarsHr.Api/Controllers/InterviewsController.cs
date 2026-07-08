using BarsHr.Api.DTOs.Evaluations;
using BarsHr.Api.DTOs.Interviews;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InterviewsController : ControllerBase
{
    private readonly IInterviewService _interviewService;

    public InterviewsController(IInterviewService interviewService)
    {
        _interviewService = interviewService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewDto>> GetById(int id)
    {
        var interview = await _interviewService.GetByIdAsync(id);
        if (interview == null) return NotFound();
        return Ok(interview);
    }

    [HttpGet("by-application/{applicationId}")]
    public async Task<ActionResult<List<InterviewDto>>> GetByApplicationId(int applicationId)
    {
        var interviews = await _interviewService.GetByApplicationIdAsync(applicationId);
        return Ok(interviews);
    }

    [HttpPost]
    public async Task<ActionResult<InterviewDto>> Create([FromBody] CreateInterviewRequest request)
    {
        var currentUserId = 1;

        var created = await _interviewService.CreateAsync(request, currentUserId);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InterviewDto>> Update(int id, [FromBody] UpdateInterviewRequest request)
    {
        var currentUserId = 1;

        var updated = await _interviewService.UpdateAsync(id, request, currentUserId);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpPost("{interviewId}/evaluations")]
    public async Task<ActionResult<EvaluationDto>> AddEvaluation(int interviewId, [FromBody] CreateEvaluationRequest request)
    {
        var currentUserId = 1;

        try
        {
            var evaluation = await _interviewService.AddEvaluationAsync(interviewId, request, currentUserId);

            return CreatedAtAction(
                nameof(GetById),                          
                new { id = interviewId },                 
                evaluation                                
            );
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}