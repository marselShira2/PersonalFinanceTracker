// FinanceTracker.Server.Controllers.TransactionsController

using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // Make sure this is present

namespace FinanceTracker.Server.Controllers
{
    // Apply [Authorize] at the controller level to protect ALL methods by default
    [Authorize]
    [Route("api/[controller]")] // Base Route: /api/Transactions
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionRepository _transactionRepository;

        public TransactionsController(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }

        // Helper to securely get UserId from the JWT token
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            // Throw an exception if the ID is missing or not an integer
            throw new UnauthorizedAccessException("User ID not found or invalid in token claims.");
        }

        // 🎯 ROUTE: /api/Transactions/create
        // REMOVED [AllowAnonymous] and fixed ID
        [HttpPost("create")]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
        {
            try
            {
                // **FIXED: Use GetUserId() to associate the transaction with the logged-in user**
                int userId = GetUserId();

                if (dto.Amount <= 0)
                {
                    return BadRequest("Transaction amount must be positive.");
                }
                if (dto.Type.ToLower() != "income" && dto.Type.ToLower() != "expense")
                {
                    return BadRequest("Transaction type must be 'Income' or 'Expense'.");
                }

                var transaction = new Transaction
                {
                    UserId = userId,
                    Type = dto.Type,
                    Amount = dto.Amount,
                    Currency = dto.Currency,
                    Date = dto.Date,
                    CategoryId = dto.CategoryId,
                    Description = dto.Description,
                    IsRecurring = dto.IsRecurring
                };

                var newTransaction = await _transactionRepository.AddTransactionAsync(transaction);
                return CreatedAtAction(nameof(GetTransaction), new { id = newTransaction.TransactionId }, newTransaction);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed or ID missing." });
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        // 🎯 ROUTE: /api/Transactions (for fetching the list)
        [HttpGet]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] string? type,
            [FromQuery] bool? isRecurring)
        {
            int userId;
            try
            {
                // CORRECT: Get UserId from the authorized token
                userId = GetUserId();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed or ID missing." });
            }

            var transactions = await _transactionRepository.GetFilteredTransactionsAsync(userId, type, isRecurring);

            return Ok(transactions);
        }

        // 🎯 ROUTE: /api/Transactions/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransaction(int id)
        {
            // **FIXED: Use GetUserId()**
            int userId = GetUserId();
            var transaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);

            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        // 🎯 ROUTE: /api/Transactions/{id}
        // REMOVED [AllowAnonymous] and fixed ID
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionUpdateDto dto)
        {
            // **FIXED: Use GetUserId()**
            int userId = GetUserId();
            var transaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);

            if (transaction == null)
            {
                return NotFound("Transaction not found or unauthorized.");
            }
            // ... (rest of the update logic)
            transaction.Type = dto.Type ?? transaction.Type;
            transaction.Amount = dto.Amount ?? transaction.Amount;
            transaction.Currency = dto.Currency ?? transaction.Currency;
            transaction.Date = dto.Date ?? transaction.Date;
            transaction.CategoryId = dto.CategoryId ?? transaction.CategoryId;
            transaction.Description = dto.Description ?? transaction.Description;
            transaction.IsRecurring = dto.IsRecurring ?? transaction.IsRecurring;

            if (transaction.Amount <= 0 || string.IsNullOrEmpty(transaction.Currency) || string.IsNullOrEmpty(transaction.Type))
            {
                return BadRequest("Mandatory fields (Type, Amount, Currency) cannot be empty or invalid.");
            }

            await _transactionRepository.UpdateTransactionAsync(transaction);

            return Ok(transaction);
        }

        // 🎯 ROUTE: /api/Transactions/{id}
        // REMOVED [AllowAnonymous] and fixed ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            // **FIXED: Use GetUserId()**
            int userId = GetUserId();

            bool success = await _transactionRepository.DeleteTransactionAsync(id, userId);

            if (!success)
            {
                return NotFound("Transaction not found or unauthorized.");
            }

            return NoContent();
        }
    }
}