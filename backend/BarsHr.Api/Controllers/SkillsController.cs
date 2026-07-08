using BarsHr.Api.DTOs.Skills;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ISkillService _skillService;

    public SkillsController(ISkillService skillService)
    {
        _skillService = skillService;
    }

    [HttpGet]
    public async Task<ActionResult<List<SkillDto>>> GetAll(
        [FromQuery] string? type,
        [FromQuery] bool includeInactive = false)
    {
        var result = await _skillService.GetAllAsync(type, includeInactive);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SkillDto>> GetById(int id)
    {
        var skill = await _skillService.GetByIdAsync(id);
        if (skill == null) return NotFound();
        return Ok(skill);
    }

    [HttpPost]
    public async Task<ActionResult<SkillDto>> Create([FromBody] CreateSkillRequest request)
    {
        try
        {
            var created = await _skillService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException)
        {
            // навык с таким названием уже есть — ловит unique-индекс skills.name
            return Conflict(new { message = "Навык с таким названием уже существует" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SkillDto>> Update(int id, [FromBody] UpdateSkillRequest request)
    {
        try
        {
            var updated = await _skillService.UpdateAsync(id, request);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "Навык с таким названием уже существует" });
        }
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var found = await _skillService.SetActiveAsync(id, active: false);
        if (!found) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> Restore(int id)
    {
        var found = await _skillService.SetActiveAsync(id, active: true);
        if (!found) return NotFound();
        return NoContent();
    }
}
