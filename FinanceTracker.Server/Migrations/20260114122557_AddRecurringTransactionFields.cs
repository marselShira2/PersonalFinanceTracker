using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddRecurringTransactionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "next_occurrence_date",
                table: "transactions",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "recurring_frequency",
                table: "transactions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "next_occurrence_date",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "recurring_frequency",
                table: "transactions");
        }
    }
}
