using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Components;

// общая шапка: логотип слева, название документа справа, акцентная линия
public static class BrandHeader
{
    public static void Compose(IContainer container, string documentTitle)
    {
        container.Column(col =>
        {
            col.Item().Row(row =>
            {
                row.ConstantItem(110).Image(PdfAssets.Logo);
                row.RelativeItem().AlignRight().AlignBottom().Text(documentTitle)
                    .FontSize(PdfTheme.HeadingSize).Bold().FontColor(PdfTheme.Ink);
            });
            col.Item().PaddingTop(8).LineHorizontal(1.5f).LineColor(PdfTheme.Accent);
        });
    }
}
