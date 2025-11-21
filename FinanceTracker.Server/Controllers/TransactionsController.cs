using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; 

namespace FinanceTracker.Server.Controllers
{
    [Authorize] // 🎯 Secure all transaction endpoints
    [Route("api/[controller]")]
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

        //krijojme transaksionin
        //permomentin anonim per test
        [AllowAnonymous]
        [HttpPost]

        public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
        {
            //anynomous per momentin
            // int userId = GetUserId();
            int userId = 17;

            
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

        //marrim ter transaksionet i lexojme 

        [HttpGet]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] string? type,
            [FromQuery] bool? isRecurring)
        {
            int userId = GetUserId();

            var transactions = await _transactionRepository.GetFilteredTransactionsAsync(userId, type, isRecurring);

            return Ok(transactions);
        }

      //lexojme 1 transaksion
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransaction(int id)
        {
            int userId = GetUserId();
            var transaction = await _transactionRepository.GetTransactionByIdAsync(id, userId);

            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        //update 
        //e leme anynomous per testing
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