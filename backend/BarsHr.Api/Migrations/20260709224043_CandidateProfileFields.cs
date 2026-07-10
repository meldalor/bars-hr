using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BarsHr.Api.Migrations
{
    /// <inheritdoc />
    public partial class CandidateProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "additional_info",
                table: "candidates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "specialty",
                table: "candidates",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "telegram",
                table: "candidates",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "additional_info",
                table: "candidates");

            migrationBuilder.DropColumn(
                name: "specialty",
                table: "candidates");

            migrationBuilder.DropColumn(
                name: "telegram",
                table: "candidates");
        }
    }
}
