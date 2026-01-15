using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceTracker.Server.Migrations
{
    /// <inheritdoc />
    public partial class New_Columns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "amount_converted",
                table: "transactions",
                type: "decimal(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "conversion_rate",
                table: "transactions",
                type: "decimal(10,6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "amount_converted",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "conversion_rate",
                table: "transactions");
        }
    }
}
