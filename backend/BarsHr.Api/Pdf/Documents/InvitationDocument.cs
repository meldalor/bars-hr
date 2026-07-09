using BarsHr.Api.Pdf.Components;
using BarsHr.Api.Pdf.Models;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Documents;

// приглашение на собеседование; дату показываем, только если интервью уже назначено
public class InvitationDocument : IDocument
{
    private readonly InvitationModel _model;

    public InvitationDocument(InvitationModel model) => _model = model;

    public void Compose(IDocumentContainer container)
    {
        PdfLayout.Page(container, null, body =>
        {
            body.Column(col =>
            {
                col.Spacing(14);

                col.Item().Text($"Уважаемый(-ая), {_model.CandidateName}!")
                    .FontSize(PdfTheme.HeadingSize).Bold();

                col.Item().Text(text =>
                {
                    text.Span("Благодарим за отклик на вакансию ");
                    text.Span($"«{_model.VacancyTitle}»").Bold();
                    text.Span(". Рады сообщить, что готовы пригласить вас на собеседование.");
                });

                if (_model.ScheduledAt is not null)
                    col.Item().Text(text =>
                    {
                        text.Span("Дата и время: ").Bold();
                        text.Span(PdfFormat.DateTime(_model.ScheduledAt.Value));
                    });
                else
                    col.Item().Text("О дате и времени собеседования мы свяжемся с вами дополнительно.");

                col.Item().PaddingTop(24).Element(c => Signature.Compose(c, _model.HrName, _model.Date));
            });
        });
    }
}
