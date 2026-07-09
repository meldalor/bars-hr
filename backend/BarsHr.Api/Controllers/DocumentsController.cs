using BarsHr.Api.Authorization;
using BarsHr.Api.Domain;
using BarsHr.Api.Extensions;
using BarsHr.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BarsHr.Api.Controllers;

[ApiController]
[Authorize]
[RequirePermission(Permissions.DocumentsPrint)]
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

    [HttpGet("invitation/{applicationId}")]
    public async Task<IActionResult> Invitation(int applicationId)
    {
        var pdf = await _documentService.GenerateInvitationAsync(applicationId, User.GetUserId());
        if (pdf == null) return NotFound();
        return File(pdf, "application/pdf", $"priglashenie-{applicationId}.pdf");
    }

    [HttpGet("offer/{applicationId}")]
    public async Task<IActionResult> Offer(int applicationId)
    {
        var pdf = await _documentService.GenerateOfferAsync(applicationId, User.GetUserId());
        if (pdf == null) return NotFound();
        return File(pdf, "application/pdf", $"offer-{applicationId}.pdf");
    }

    [HttpGet("interview-protocol/{interviewId}")]
    public async Task<IActionResult> InterviewProtocol(int interviewId)
    {
        var pdf = await _documentService.GenerateInterviewProtocolAsync(interviewId);
        if (pdf == null) return NotFound();
        return File(pdf, "application/pdf", $"protokol-{interviewId}.pdf");
    }

    [HttpGet("candidate-card/{candidateId}")]
    public async Task<IActionResult> CandidateCard(int candidateId)
    {
        var pdf = await _documentService.GenerateCandidateCardAsync(candidateId);
        if (pdf == null) return NotFound();
        return File(pdf, "application/pdf", $"rezyume-{candidateId}.pdf");
    }
}
