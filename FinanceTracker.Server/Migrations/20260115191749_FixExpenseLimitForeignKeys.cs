using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixExpenseLimitForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Skip - foreign keys will be added in next migration
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_expense_limits_categories_category_id",
                table: "expense_limits");

            migrationBuilder.DropForeignKey(
                name: "FK_expense_limits_users_user_id",
                table: "expense_limits");

            migrationBuilder.AddForeignKey(
                name: "FK_expense_limits_categories_category_id",
                table: "expense_limits",
                column: "category_id",
                principalTable: "categories",
                principalColumn: "category_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_expense_limits_users_user_id",
                table: "expense_limits",
                column: "user_id",
                principalTable: "users",
                principalColumn: "user_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
