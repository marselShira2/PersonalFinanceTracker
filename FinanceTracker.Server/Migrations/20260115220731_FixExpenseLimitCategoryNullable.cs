using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class FixExpenseLimitCategoryNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clean up invalid data
            migrationBuilder.Sql(@"
                UPDATE [expense_limits] 
                SET [category_id] = NULL 
                WHERE [category_id] NOT IN (SELECT [category_id] FROM [categories]) OR [category_id] = 0;
            ");

            // Add foreign key
            migrationBuilder.AddForeignKey(
                name: "FK_expense_limits_categories_category_id",
                table: "expense_limits",
                column: "category_id",
                principalTable: "categories",
                principalColumn: "category_id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_expense_limits_categories_category_id",
                table: "expense_limits");
        }
    }
}
