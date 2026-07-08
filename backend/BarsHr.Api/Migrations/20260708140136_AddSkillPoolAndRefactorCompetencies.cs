using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BarsHr.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSkillPoolAndRefactorCompetencies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_competencies_vacancy_id",
                table: "competencies");

            migrationBuilder.DropColumn(
                name: "category",
                table: "competencies");

            migrationBuilder.DropColumn(
                name: "description",
                table: "competencies");

            migrationBuilder.DropColumn(
                name: "name",
                table: "competencies");

            migrationBuilder.AddColumn<int>(
                name: "skill_id",
                table: "competencies",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "skills",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_skills", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_competencies_skill_id",
                table: "competencies",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_competencies_vacancy_id_skill_id",
                table: "competencies",
                columns: new[] { "vacancy_id", "skill_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_skills_name",
                table: "skills",
                column: "name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_competencies_skills_skill_id",
                table: "competencies",
                column: "skill_id",
                principalTable: "skills",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_competencies_skills_skill_id",
                table: "competencies");

            migrationBuilder.DropTable(
                name: "skills");

            migrationBuilder.DropIndex(
                name: "IX_competencies_skill_id",
                table: "competencies");

            migrationBuilder.DropIndex(
                name: "IX_competencies_vacancy_id_skill_id",
                table: "competencies");

            migrationBuilder.DropColumn(
                name: "skill_id",
                table: "competencies");

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "competencies",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "competencies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "competencies",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_competencies_vacancy_id",
                table: "competencies",
                column: "vacancy_id");
        }
    }
}
