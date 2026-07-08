using System.Globalization;

namespace BarsHr.Api.Pdf;

// единый формат дат по-русски для всех документов
public static class PdfFormat
{
    private static readonly CultureInfo Ru = new("ru-RU");

    public static string Date(DateTime value) => value.ToString("d MMMM yyyy 'г.'", Ru);

    public static string DateTime(DateTime value) => value.ToString("d MMMM yyyy 'г.', HH:mm", Ru);
}
