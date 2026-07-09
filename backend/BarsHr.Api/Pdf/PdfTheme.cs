using QuestPDF.Infrastructure;

namespace BarsHr.Api.Pdf;

// фирменные цвета и типографика БАРС Груп из бренд-бука
public static class PdfTheme
{
    // family name внутри вложенного TTF (DejaVu Sans содержит кириллицу)
    public const string FontFamily = "DejaVu Sans";

    public static readonly Color Accent = Color.FromHex("#D74738");
    public static readonly Color Ink = Color.FromHex("#4F4949");
    public static readonly Color Muted = Color.FromHex("#8A8585");
    public static readonly Color Line = Color.FromHex("#E3E0E0");

    public const float PageMargin = 40f;
    public const int TitleSize = 18;
    public const int HeadingSize = 13;
    public const int BodySize = 11;
    public const int SmallSize = 9;
}
