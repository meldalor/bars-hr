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
        var currentUserId = 1; // TODO: из JWT

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
}
