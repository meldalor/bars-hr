using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Components;

// единый блок подписи HR внизу писем: «С уважением, {ФИО}, БАРС Груп, дата»
public static class Signature
{
    public static void Compose(IContainer container, string hrName, DateTime date)
    {
        container.Column(col =>
        {
            col.Item().Text("С уважением,");
            col.Item().Text(hrName).Bold();
            col.Item().Text("БАРС Груп");
            col.Item().PaddingTop(4).Text(PdfFormat.Date(date)).FontColor(PdfTheme.Muted);
        });
    }
}
