using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceTracker.Server.Controllers
{ 
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
            throw new UnauthorizedAccessException("User ID not found in token claims.");
        }

        // 🎯 ROUTE: /api/Transactions/create
        [AllowAnonymous]
        [HttpPost("create")]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
        {

            try { 
            //anynomous per momentin
            // int userId = GetUserId();
            int userId = 6; 
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
            catch(Exception ex)
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
                userId = GetUserId();
            }
            catch (InvalidOperationException)
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
            // Note: This needs to be uncommented for production/auth
            // int userId = GetUserId();
            int userId = 17; // Using fixed ID for testing
            var transaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);

            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        // 🎯 ROUTE: /api/Transactions/{id}
        [AllowAnonymous]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionUpdateDto dto)
        {
            //int userId = GetUserId();
            int userId = 17;
            var transaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);

            if (transaction == null)
            {
                return NotFound("Transaction not found or unauthorized.");
            }


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
        [AllowAnonymous]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            //int userId = GetUserId();
            int userId = 17;

            bool success = await _transactionRepository.DeleteTransactionAsync(id, userId);

            if (!success)
            {
                return NotFound("Transaction not found or unauthorized.");
            }

            return NoContent();
        }



 
    }
}