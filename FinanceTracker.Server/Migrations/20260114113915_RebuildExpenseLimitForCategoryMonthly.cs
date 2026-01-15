using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class RebuildExpenseLimitForCategoryMonthly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "balance",
                table: "expense_limits");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "expense_limits");

            migrationBuilder.DropColumn(
                name: "start_date",
                table: "expense_limits");

            migrationBuilder.AddColumn<int>(
                name: "category_id",
                table: "expense_limits",
                type: "int",
                nullable: true,
                defaultValue: null);

            migrationBuilder.AddColumn<int>(
                name: "month",
                table: "expense_limits",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "year",
                table: "expense_limits",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_expense_limits_category_id",
                table: "expense_limits",
                column: "category_id");

            // Don't add foreign key here - will be added in next migration after data cleanup
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_expense_limits_categories_category_id",
                table: "expense_limits");

            migrationBuilder.DropIndex(
                name: "IX_expense_limits_category_id",
                table: "expense_limits");

            migrationBuilder.DropColumn(
                name: "category_id",
                table: "expense_limits");

            migrationBuilder.DropColumn(
                name: "month",
                table: "expense_limits");

            migrationBuilder.DropColumn(
                name: "year",
                table: "expense_limits");

            migrationBuilder.AddColumn<decimal>(
                name: "balance",
                table: "expense_limits",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "expense_limits",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateOnly>(
                name: "start_date",
                table: "expense_limits",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));
        }
    }
}
