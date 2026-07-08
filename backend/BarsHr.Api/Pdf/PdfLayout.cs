using BarsHr.Api.Pdf.Components;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf;

// единый каркас страницы A4: поля, шрифт, шапка и подвал; тело задаёт документ
public static class PdfLayout
{
    public static void Page(IDocumentContainer container, string title, Action<IContainer> body)
    {
        container.Page(page =>
        {
            page.Size(PageSizes.A4);
            page.Margin(PdfTheme.PageMargin);
            page.DefaultTextStyle(x => x
                .FontFamily(PdfTheme.FontFamily)
                .FontSize(PdfTheme.BodySize)
                .FontColor(PdfTheme.Ink));

            page.Header().Element(h => BrandHeader.Compose(h, title));
            page.Content().PaddingVertical(16).Element(body);
        });
    }
}
