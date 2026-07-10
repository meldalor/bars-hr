using BarsHr.Api.Authorization;
using BarsHr.Api.Domain;
using BarsHr.Api.DTOs.Audit;
using BarsHr.Api.Extensions;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[RequirePermission(Permissions.AuditView)]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AuditLogDto>>> GetAll(
        [FromQuery] string? entityName,
        [FromQuery] string? action,
        [FromQuery] int? userId,
        [FromQuery] int? candidateId,
        [FromQuery] int? vacancyId,
        [FromQuery] bool mine = false,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        // mine — личный журнал на «Обзоре»: id пользователя берём из токена, а не из query
        if (mine)
            userId = User.GetUserId();

        var result = await _auditService.GetAsync(
            entityName, action, userId, candidateId, vacancyId, from, to, page, pageSize);
        return Ok(result);
    }
}
