using BarsHr.Api.DTOs.Vacancies;
using BarsHr.Api.Services.Interfaces;
using BarsHr.Api.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class VacanciesController : ControllerBase
{
    private readonly IVacancyService _vacancyService;

    public VacanciesController(IVacancyService vacancyService)
    {
        _vacancyService = vacancyService;
    }

    [HttpGet]
    public async Task<ActionResult<List<VacancyListItemDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] bool includeArchived = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _vacancyService.GetAllAsync(search, status, includeArchived, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VacancyDto>> GetById(int id)
    {
        var vacancy = await _vacancyService.GetByIdAsync(id);
        if (vacancy == null) return NotFound();
        return Ok(vacancy);
    }

    [HttpPost]
    public async Task<ActionResult<VacancyDto>> Create([FromBody] CreateVacancyRequest request)
    {
        var currentUserId = User.GetUserId();

        try
        {
            var created = await _vacancyService.CreateAsync(request, currentUserId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VacancyDto>> Update(int id, [FromBody] UpdateVacancyRequest request)
    {
        var currentUserId = User.GetUserId();

        try
        {
            var updated = await _vacancyService.UpdateAsync(id, request, currentUserId);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var success = await _vacancyService.SetArchivedAsync(id, archived: true);
        if (!success) return NotFound();
        return NoContent();
    }
}