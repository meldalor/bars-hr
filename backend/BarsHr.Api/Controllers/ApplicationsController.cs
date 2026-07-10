using BarsHr.Api.DTOs.Applications;
using BarsHr.Api.Extensions;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ApplicationDto>>> GetAll(
        [FromQuery] int? candidateId,
        [FromQuery] int? vacancyId)
    {
        var result = await _applicationService.GetAllAsync(candidateId, vacancyId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApplicationDto>> GetById(int id)
    {
        var application = await _applicationService.GetByIdAsync(id);
        if (application == null) return NotFound();
        return Ok(application);
    }

    [HttpPost]
    public async Task<ActionResult<ApplicationDto>> Create([FromBody] CreateApplicationRequest request)
    {
        var currentUserId = User.GetUserId();

        try
        {
            var created = await _applicationService.CreateAsync(request, currentUserId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (DbUpdateException)
        {
            // гонка двух одновременных запросов: дубль поймал unique-индекс БД
            return Conflict(new { message = "Отклик этого кандидата на эту вакансию уже существует" });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApplicationDto>> UpdateStatus(int id, [FromBody] UpdateApplicationStatusRequest request)
    {
        try
        {
            var updated = await _applicationService.UpdateStatusAsync(id, request, User.GetUserId());
            if (updated == null) return NotFound();
            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
