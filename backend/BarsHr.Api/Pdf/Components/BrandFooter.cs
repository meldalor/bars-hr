using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Components;

// общий подвал: название компании слева, нумерация страниц справа
public static class BrandFooter
{
    public static void Compose(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(0.5f).LineColor(PdfTheme.Line);
            col.Item().PaddingTop(4).Row(row =>
            {
                row.RelativeItem().Text("БАРС Груп")
                    .FontSize(PdfTheme.SmallSize).FontColor(PdfTheme.Muted);
                row.RelativeItem().AlignRight().Text(text =>
                {
                    text.DefaultTextStyle(x => x.FontSize(PdfTheme.SmallSize).FontColor(PdfTheme.Muted));
                    text.Span("Стр. ");
                    text.CurrentPageNumber();
                    text.Span(" из ");
                    text.TotalPages();
                });
            });
        });
    }
}
