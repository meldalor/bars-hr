using BarsHr.Api.Pdf.Models;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf.Documents;

// протокол для офлайн-заполнения: интервьюер печатает бланк и проставляет баллы вручную,
// поэтому графы «Балл» и «Комментарий» оставляем пустыми
public class InterviewProtocolDocument : IDocument
{
    private readonly InterviewProtocolModel _model;

    public InterviewProtocolDocument(InterviewProtocolModel model) => _model = model;

    public void Compose(IDocumentContainer container)
    {
        PdfLayout.Page(container, "Протокол собеседования", body =>
        {
            body.Column(col =>
            {
                col.Spacing(16);

                col.Item().Column(info =>
                {
                    info.Spacing(3);
                    InfoRow(info, "Кандидат", _model.CandidateName);
                    InfoRow(info, "Вакансия", _model.VacancyTitle);
                    InfoRow(info, "Интервьюер", _model.InterviewerName ?? "не назначен");
                    InfoRow(info, "Дата и время", PdfFormat.DateTime(_model.ScheduledAt));
                });

                col.Item().Column(section =>
                {
                    section.Spacing(6);
                    SectionTitle(section, "Обязательные вопросы");
                    var number = 1;
                    foreach (var question in _model.Questions)
                        section.Item().Text($"{number++}. {question}");
                });

                if (!string.IsNullOrWhiteSpace(_model.Plan))
                    col.Item().Column(section =>
                    {
                        section.Spacing(6);
                        SectionTitle(section, "План собеседования");
                        section.Item().Text(_model.Plan);
                    });

                col.Item().Column(section =>
                {
                    section.Spacing(6);
                    SectionTitle(section, "Оценка компетенций");
                    if (_model.Competencies.Count == 0)
                        section.Item().Text("Компетенции для вакансии не заданы.").FontColor(PdfTheme.Muted);
                    else
                        section.Item().Element(CompetenciesTable);
                });
            });
        });
    }

    private void CompetenciesTable(IContainer container)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(26);
                columns.RelativeColumn(3);
                columns.ConstantColumn(72);
                columns.ConstantColumn(58);
                columns.RelativeColumn(3);
            });

            table.Header(header =>
            {
                HeaderCell(header.Cell(), "№");
                HeaderCell(header.Cell(), "Компетенция");
                HeaderCell(header.Cell(), "Тип");
                HeaderCell(header.Cell(), "Балл");
                HeaderCell(header.Cell(), "Комментарий");
            });

            var number = 1;
            foreach (var competency in _model.Competencies)
            {
                DataCell(table.Cell(), number++.ToString());
                DataCell(table.Cell(), competency.SkillName);
                DataCell(table.Cell(), TypeLabel(competency.SkillType));
                DataCell(table.Cell(), $"/ {competency.MaxScore}");
                DataCell(table.Cell(), string.Empty);
            }
        });
    }

    private static void InfoRow(ColumnDescriptor column, string label, string value) =>
        column.Item().Text(text =>
        {
            text.Span($"{label}: ").Bold();
            text.Span(value);
        });

    private static void SectionTitle(ColumnDescriptor column, string title) =>
        column.Item().Text(title).FontSize(PdfTheme.HeadingSize).Bold().FontColor(PdfTheme.Accent);

    private static void HeaderCell(IContainer cell, string text) =>
        cell.Background(PdfTheme.Line).Border(0.5f).BorderColor(PdfTheme.Line)
            .PaddingVertical(5).PaddingHorizontal(6)
            .Text(text).Bold();

    private static void DataCell(IContainer cell, string text) =>
        cell.Border(0.5f).BorderColor(PdfTheme.Line)
            .PaddingVertical(7).PaddingHorizontal(6)
            .Text(text);

    private static string TypeLabel(string type) => type switch
    {
        "Hard" => "Hard",
        "Soft" => "Soft",
        "CultureFit" => "Culture Fit",
        _ => type
    };
}
