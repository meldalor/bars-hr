using BarsHr.Api.DTOs.Candidates;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandidatesController : ControllerBase
{
    private readonly ICandidateService _candidateService;

    public CandidatesController(ICandidateService candidateService)
    {
        _candidateService = candidateService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CandidateListItemDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _candidateService.GetAllAsync(search, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateDto>> GetById(int id)
    {
        var candidate = await _candidateService.GetByIdAsync(id);
        if (candidate == null) return NotFound();
        return Ok(candidate);
    }

    [HttpPost]
    public async Task<ActionResult<CandidateDto>> Create([FromBody] CreateCandidateRequest request)
    {
        // TODO: позже возьмём currentUserId из JWT
        var currentUserId = 1; 

        var created = await _candidateService.CreateAsync(request, currentUserId);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CandidateDto>> Update(int id, [FromBody] UpdateCandidateRequest request)
    {
        var currentUserId = 1; // TODO: из JWT
        var updated = await _candidateService.UpdateAsync(id, request, currentUserId);

        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _candidateService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}