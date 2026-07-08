using BarsHr.Api.Extensions;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet("rejection/{applicationId}")]
    public async Task<IActionResult> Rejection(int applicationId)
    {
        var pdf = await _documentService.GenerateRejectionAsync(applicationId, User.GetUserId());
        if (pdf == null) return NotFound();
        return File(pdf, "application/pdf", $"otkaz-{applicationId}.pdf");
    }
}
