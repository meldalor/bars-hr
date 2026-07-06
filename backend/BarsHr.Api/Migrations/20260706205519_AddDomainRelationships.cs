using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BarsHr.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDomainRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_evaluations_competencies_competency_id",
                table: "evaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_vacancies_vacancy_id",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_users_login",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_evaluations_interview_id",
                table: "evaluations");

            migrationBuilder.CreateIndex(
                name: "IX_evaluations_interview_id_competency_id",
                table: "evaluations",
                columns: new[] { "interview_id", "competency_id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_evaluations_competencies_competency_id",
                table: "evaluations",
                column: "competency_id",
                principalTable: "competencies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_vacancies_vacancy_id",
                table: "interviews",
                column: "vacancy_id",
                principalTable: "vacancies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_evaluations_competencies_competency_id",
                table: "evaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_vacancies_vacancy_id",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_evaluations_interview_id_competency_id",
                table: "evaluations");

            migrationBuilder.CreateIndex(
                name: "IX_users_login",
                table: "users",
                column: "login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_evaluations_interview_id",
                table: "evaluations",
                column: "interview_id");

            migrationBuilder.AddForeignKey(
                name: "FK_evaluations_competencies_competency_id",
                table: "evaluations",
                column: "competency_id",
                principalTable: "competencies",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_vacancies_vacancy_id",
                table: "interviews",
                column: "vacancy_id",
                principalTable: "vacancies",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
