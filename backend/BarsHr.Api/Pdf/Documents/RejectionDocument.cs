using BarsHr.Api.Pdf.Models;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Documents;

// отказ по кандидатуре — текст по шаблону куратора; фидбек показываем только если он есть
public class RejectionDocument : IDocument
{
    private readonly RejectionModel _model;

    public RejectionDocument(RejectionModel model) => _model = model;

    public void Compose(IDocumentContainer container)
    {
        PdfLayout.Page(container, "Ответ по отклику", body =>
        {
            body.Column(col =>
            {
                col.Spacing(14);

                col.Item().Text($"Уважаемый(-ая), {_model.CandidateName}!")
                    .FontSize(PdfTheme.HeadingSize).Bold();

                col.Item().Text(text =>
                {
                    text.Span("Спасибо за уделённое время. Сообщаем, что рассмотрели вашу кандидатуру на вакансию ");
                    text.Span($"«{_model.VacancyTitle}»").Bold();
                    text.Span(", но на данный момент не готовы пригласить.");
                });

                if (!string.IsNullOrWhiteSpace(_model.Feedback))
                {
                    col.Item().Text(text =>
                    {
                        text.Span("Фидбек: ").Bold();
                        text.Span(_model.Feedback);
                    });
                }

                col.Item().PaddingTop(24).Text("С уважением,");
                col.Item().Text(_model.HrName).Bold();
                col.Item().Text("БАРС Груп");
                col.Item().PaddingTop(4).Text(PdfFormat.Date(_model.Date)).FontColor(PdfTheme.Muted);
            });
        });
    }
}
