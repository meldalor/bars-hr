using BarsHr.Api.Pdf.Documents;
using BarsHr.Api.Services.Interfaces;
using QuestPDF.Fluent;

namespace BarsHr.Api.Services.Implementations;

public class DocumentService : IDocumentService
{
    public byte[] GenerateSample() => new SampleDocument().GeneratePdf();
}
