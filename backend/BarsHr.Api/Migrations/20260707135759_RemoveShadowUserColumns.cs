using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BarsHr.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShadowUserColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_audit_logs_users_UserId1",
                table: "audit_logs");

            migrationBuilder.DropForeignKey(
                name: "FK_candidates_users_UserId",
                table: "candidates");

            migrationBuilder.DropForeignKey(
                name: "FK_candidates_users_UserId1",
                table: "candidates");

            migrationBuilder.DropForeignKey(
                name: "FK_decisions_users_UserId",
                table: "decisions");

            migrationBuilder.DropForeignKey(
                name: "FK_evaluations_users_UserId",
                table: "evaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_generated_documents_users_UserId",
                table: "generated_documents");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_users_UserId",
                table: "interviews");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_users_UserId1",
                table: "interviews");

            migrationBuilder.DropForeignKey(
                name: "FK_interviews_users_UserId2",
                table: "interviews");

            migrationBuilder.DropForeignKey(
                name: "FK_vacancies_users_UserId",
                table: "vacancies");

            migrationBuilder.DropIndex(
                name: "IX_vacancies_UserId",
                table: "vacancies");

            migrationBuilder.DropIndex(
                name: "IX_interviews_UserId",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_interviews_UserId1",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_interviews_UserId2",
                table: "interviews");

            migrationBuilder.DropIndex(
                name: "IX_generated_documents_UserId",
                table: "generated_documents");

            migrationBuilder.DropIndex(
                name: "IX_evaluations_UserId",
                table: "evaluations");

            migrationBuilder.DropIndex(
                name: "IX_decisions_UserId",
                table: "decisions");

            migrationBuilder.DropIndex(
                name: "IX_candidates_UserId",
                table: "candidates");

            migrationBuilder.DropIndex(
                name: "IX_candidates_UserId1",
                table: "candidates");

            migrationBuilder.DropIndex(
                name: "IX_audit_logs_UserId1",
                table: "audit_logs");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "vacancies");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "UserId2",
                table: "interviews");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "generated_documents");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "evaluations");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "decisions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "candidates");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "candidates");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "audit_logs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "vacancies",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "interviews",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "interviews",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId2",
                table: "interviews",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "generated_documents",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "evaluations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "decisions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "candidates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "candidates",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "audit_logs",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_vacancies_UserId",
                table: "vacancies",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_UserId",
                table: "interviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_UserId1",
                table: "interviews",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_interviews_UserId2",
                table: "interviews",
                column: "UserId2");

            migrationBuilder.CreateIndex(
                name: "IX_generated_documents_UserId",
                table: "generated_documents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_evaluations_UserId",
                table: "evaluations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_decisions_UserId",
                table: "decisions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_UserId",
                table: "candidates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_candidates_UserId1",
                table: "candidates",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_UserId1",
                table: "audit_logs",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_audit_logs_users_UserId1",
                table: "audit_logs",
                column: "UserId1",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_candidates_users_UserId",
                table: "candidates",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_candidates_users_UserId1",
                table: "candidates",
                column: "UserId1",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_decisions_users_UserId",
                table: "decisions",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_evaluations_users_UserId",
                table: "evaluations",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_generated_documents_users_UserId",
                table: "generated_documents",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_users_UserId",
                table: "interviews",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_users_UserId1",
                table: "interviews",
                column: "UserId1",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_interviews_users_UserId2",
                table: "interviews",
                column: "UserId2",
                principalTable: "users",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_vacancies_users_UserId",
                table: "vacancies",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");
        }
    }
}
