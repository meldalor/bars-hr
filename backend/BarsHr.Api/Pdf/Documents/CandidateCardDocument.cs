using BarsHr.Api.Pdf.Models;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Documents;

// резюме кандидата: контакты, образование, опыт, навыки и история откликов
public class CandidateCardDocument : IDocument
{
    private readonly CandidateCardModel _model;

    public CandidateCardDocument(CandidateCardModel model) => _model = model;

    public void Compose(IDocumentContainer container)
    {
        PdfLayout.Page(container, "Резюме кандидата", body =>
        {
            body.Column(col =>
            {
                col.Spacing(16);

                col.Item().Column(head =>
                {
                    head.Item().Text(_model.FullName).FontSize(PdfTheme.TitleSize).Bold();
                    if (!string.IsNullOrWhiteSpace(_model.Specialty))
                        head.Item().Text(_model.Specialty);
                    var contacts = string.Join("  ·  ",
                        new[] { _model.City, _model.Phone, _model.Telegram }.Where(x => !string.IsNullOrWhiteSpace(x)));
                    if (!string.IsNullOrWhiteSpace(contacts))
                        head.Item().Text(contacts).FontColor(PdfTheme.Muted);
                });

                if (!string.IsNullOrWhiteSpace(_model.Education))
                    TextSection(col, "Образование", _model.Education);

                if (!string.IsNullOrWhiteSpace(_model.PreviousWork))
                    TextSection(col, "Опыт работы", _model.PreviousWork);

                if (!string.IsNullOrWhiteSpace(_model.AdditionalInfo))
                    TextSection(col, "Дополнительная информация", _model.AdditionalInfo);

                if (_model.Skills.Count > 0)
                    col.Item().Column(section =>
                    {
                        section.Spacing(6);
                        SectionTitle(section, "Навыки");
                        section.Item().Inlined(inlined =>
                        {
                            inlined.Spacing(6);
                            foreach (var skill in _model.Skills)
                                inlined.Item().Background(PdfTheme.Line)
                                    .PaddingVertical(3).PaddingHorizontal(8)
                                    .Text(skill).FontSize(PdfTheme.SmallSize);
                        });
                    });

                col.Item().Column(section =>
                {
                    section.Spacing(6);
                    SectionTitle(section, "Отклики");
                    if (_model.Applications.Count == 0)
                        section.Item().Text("Откликов нет.").FontColor(PdfTheme.Muted);
                    else
                        section.Item().Element(ApplicationsTable);
                });
            });
        });
    }

    private void ApplicationsTable(IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.ConstantColumn(110);
                columns.ConstantColumn(120);
            });

            table.Header(header =>
            {
                HeaderCell(header.Cell(), "Вакансия");
                HeaderCell(header.Cell(), "Статус");
                HeaderCell(header.Cell(), "Дата отклика");
            });

            foreach (var application in _model.Applications)
            {
                DataCell(table.Cell(), application.VacancyTitle);
                DataCell(table.Cell(), StatusLabel(application.Status));
                DataCell(table.Cell(), PdfFormat.Date(application.AppliedAt));
            }
        });
    }

    private static void TextSection(ColumnDescriptor column, string title, string value) =>
        column.Item().Column(section =>
        {
            section.Spacing(6);
            SectionTitle(section, title);
            section.Item().Text(value);
        });

    private static void SectionTitle(ColumnDescriptor column, string title) =>
        column.Item().Text(title).FontSize(PdfTheme.HeadingSize).Bold().FontColor(PdfTheme.Accent);

    private static void HeaderCell(IContainer cell, string text) =>
        cell.Background(PdfTheme.Line).Border(0.5f).BorderColor(PdfTheme.Line)
            .PaddingVertical(5).PaddingHorizontal(6)
            .Text(text).Bold();

    private static void DataCell(IContainer cell, string text) =>
        cell.Border(0.5f).BorderColor(PdfTheme.Line)
            .PaddingVertical(6).PaddingHorizontal(6)
            .Text(text);

    private static string StatusLabel(string status) => status switch
    {
        "New" => "Новый",
        "Viewed" => "Просмотрен",
        "Approved" => "Одобрен",
        "Rejected" => "Отклонён",
        _ => status
    };
}
