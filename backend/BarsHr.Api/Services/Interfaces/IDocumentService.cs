namespace BarsHr.Api.Services.Interfaces;

public interface IDocumentService
{
    // null — если сущность по id не найдена (контроллер вернёт 404)
    Task<byte[]?> GenerateRejectionAsync(int applicationId, int currentUserId);
    Task<byte[]?> GenerateInvitationAsync(int applicationId, int currentUserId);
    Task<byte[]?> GenerateOfferAsync(int applicationId, int currentUserId);
    Task<byte[]?> GenerateInterviewProtocolAsync(int interviewId);
}
