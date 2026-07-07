using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BarsHr.Api.Migrations
{
    /// <inheritdoc />
    public partial class InterviewViaApplicationAndIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_interviews_applications_ApplicationId",
                table: "interviews");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_candidates_candidate_id",
                table: "interviews");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_vacancies_vacancy_id",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_interviews_candidate_id",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_interviews_vacancy_id",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_applications_candidate_id",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "candidate_id",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "vacancy_id",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "status",
                table: "candidates");

            migrationBuilder.RenameColumn(
                name: "ApplicationId",
                table: "interviews",
                newName: "application_id");

            migrationBuilder.RenameIndex(
                name: "IX_interviews_ApplicationId",
                table: "interviews",
                newName: "IX_interviews_application_id");

            migrationBuilder.AlterColumn<int>(
                name: "application_id",
                table: "interviews",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "vacancy_id",
                table: "competencies",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_is_archived",
                table: "vacancies",
                column: "is_archived");

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_status",
                table: "vacancies",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_users_login",
                table: "users",
                column: "login",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_interviews_scheduled_at",
                table: "interviews",
                column: "scheduled_at");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_status",
                table: "interviews",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_competencies_vacancy_id",
                table: "competencies",
                column: "vacancy_id");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_created_at",
                table: "candidates",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_full_name",
                table: "candidates",
                column: "full_name");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_is_archived",
                table: "candidates",
                column: "is_archived");

            migrationBuilder.CreateIndex(
                name: "IX_applications_candidate_id_vacancy_id",
                table: "applications",
                columns: new[] { "candidate_id", "vacancy_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_applications_status",
                table: "applications",
                column: "status");

            migrationBuilder.AddForeignKey(
                name: "FK_competencies_vacancies_vacancy_id",
                table: "competencies",
                column: "vacancy_id",
                principalTable: "vacancies",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_applications_application_id",
                table: "interviews",
                column: "application_id",
                principalTable: "applications",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_competencies_vacancies_vacancy_id",
                table: "competencies");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_applications_application_id",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_vacancies_is_archived",
                table: "vacancies");

            migrationBuilder.DropIndex(
                name: "IX_vacancies_status",
                table: "vacancies");

            migrationBuilder.DropIndex(
                name: "IX_users_login",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_interviews_scheduled_at",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_interviews_status",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_competencies_vacancy_id",
                table: "competencies");

            migrationBuilder.DropIndex(
                name: "IX_candidates_created_at",
                table: "candidates");

            migrationBuilder.DropIndex(
                name: "IX_candidates_full_name",
                table: "candidates");

            migrationBuilder.DropIndex(
                name: "IX_candidates_is_archived",
                table: "candidates");

            migrationBuilder.DropIndex(
                name: "IX_applications_candidate_id_vacancy_id",
                table: "applications");

            migrationBuilder.DropIndex(
                name: "IX_applications_status",
                table: "applications");

            migrationBuilder.DropColumn(
                name: "vacancy_id",
                table: "competencies");

            migrationBuilder.RenameColumn(
                name: "application_id",
                table: "interviews",
                newName: "ApplicationId");

            migrationBuilder.RenameIndex(
                name: "IX_interviews_application_id",
                table: "interviews",
                newName: "IX_interviews_ApplicationId");

            migrationBuilder.AlterColumn<int>(
                name: "ApplicationId",
                table: "interviews",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "candidate_id",
                table: "interviews",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "vacancy_id",
                table: "interviews",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "candidates",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_candidate_id",
                table: "interviews",
                column: "candidate_id");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_vacancy_id",
                table: "interviews",
                column: "vacancy_id");

            migrationBuilder.CreateIndex(
                name: "IX_applications_candidate_id",
                table: "applications",
                column: "candidate_id");

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_applications_ApplicationId",
                table: "interviews",
                column: "ApplicationId",
                principalTable: "applications",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_candidates_candidate_id",
                table: "interviews",
                column: "candidate_id",
                principalTable: "candidates",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_vacancies_vacancy_id",
                table: "interviews",
                column: "vacancy_id",
                principalTable: "vacancies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
