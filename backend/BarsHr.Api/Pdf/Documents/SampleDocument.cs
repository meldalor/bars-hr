using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Documents;

// проверочный документ каркаса: рендер логотипа и кириллицы; удаляется на шаге 2
public class SampleDocument : IDocument
{
    public void Compose(IDocumentContainer container)
    {
        PdfLayout.Page(container, "Проверка вёрстки", body =>
        {
            body.Column(col =>
            {
                col.Spacing(8);
                col.Item().Text("Кириллица: Ёжик съел щавель — уж, ай!")
                    .FontSize(PdfTheme.HeadingSize).Bold();
                col.Item().Text("Алфавит: АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя");
                col.Item().Text("Цифры и знаки: 0123456789 № % ₽ «ёлки-палки»");
            });
        });
    }
}
