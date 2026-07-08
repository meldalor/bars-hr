using BarsHr.Api.Pdf.Components;
using BarsHr.Api.Pdf.Models;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Documents;

// типовой оффер; в блоке условий показываем только заполненные поля вакансии
public class OfferDocument : IDocument
{
    private readonly OfferModel _model;

    public OfferDocument(OfferModel model) => _model = model;

    public void Compose(IDocumentContainer container)
    {
        PdfLayout.Page(container, null, body =>
        {
            body.Column(col =>
            {
                col.Spacing(14);

                col.Item().Text($"Уважаемый(-ая), {_model.CandidateName}!")
                    .FontSize(PdfTheme.HeadingSize).Bold();

                col.Item().Text("Рады предложить вам работу в компании «БАРС Груп» на следующих условиях:");

                col.Item().PaddingLeft(8).Column(details =>
                {
                    details.Spacing(4);
                    Row(details, "Должность", _model.Position);
                    Row(details, "Отдел", _model.Department);
                    Row(details, "Заработная плата", _model.Salary);
                    Row(details, "Формат работы", _model.WorkFormat);
                    Row(details, "Место работы", _model.Location);
                });

                col.Item().Text("Будем рады видеть вас в нашей команде. Просим сообщить о вашем решении.");

                col.Item().PaddingTop(24).Element(c => Signature.Compose(c, _model.HrName, _model.Date));
            });
        });
    }

    private static void Row(ColumnDescriptor column, string label, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return;

        column.Item().Text(text =>
        {
            text.Span($"{label}: ").Bold();
            text.Span(value);
        });
    }
}
