using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BarsHr.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddApplicationSubStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "sub_status",
                table: "applications",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "sub_status",
                table: "applications");
        }
    }
}
