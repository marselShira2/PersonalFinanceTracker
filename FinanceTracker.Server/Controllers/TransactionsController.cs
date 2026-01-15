// FinanceTracker.Server.Controllers.TransactionsController

using FinanceTracker.Server.Data.Dto;
using FinanceTracker.Server.Interfaces;
using FinanceTracker.Server.Models;
using FinanceTracker.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Security.Claims;

namespace FinanceTracker.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")] // Base Route: /api/Transactions
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly FinanceTracker.Server.Services.INotificationService _notificationService;
        private readonly FirebaseStorageUploader _storageUploader;
        private readonly ICurrencyConversionService _currencyService;

        public TransactionsController(ITransactionRepository transactionRepository, FinanceTracker.Server.Services.INotificationService notificationService, FirebaseStorageUploader storageUploader, ICurrencyConversionService currencyService)
        {
            _transactionRepository = transactionRepository;
            _notificationService = notificationService;
            _storageUploader = storageUploader;
            _currencyService = currencyService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found or invalid in token claims.");
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
        {
            try
            { 
                int userId = GetUserId();

                if (dto.Amount <= 0)
                {
                    return BadRequest("Transaction amount must be positive.");
                }
                if (dto.Type.ToLower() != "income" && dto.Type.ToLower() != "expense")
                {
                    return BadRequest("Transaction type must be 'Income' or 'Expense'.");
                }

                var user = await _transactionRepository.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return Unauthorized("User not found.");
                }

                // Calculate converted amount and rate
                decimal convertedAmount = dto.Amount;
                decimal? conversionRate = null;
                
                if (!string.Equals(dto.Currency, user.DefaultCurrency, StringComparison.OrdinalIgnoreCase))
                {
                    conversionRate = await _currencyService.GetConversionRateAsync(dto.Currency, user.DefaultCurrency);
                    convertedAmount = await _currencyService.ConvertAmountAsync(dto.Amount, dto.Currency, user.DefaultCurrency);
                }

                var transaction = new Transaction
                {
                    UserId = userId,
                    Type = dto.Type,
                    Amount = dto.Amount,
                    Currency = dto.Currency,
                    AmountConverted = convertedAmount,
                    ConversionRate = conversionRate,
                    Date = dto.Date,
                    CategoryId = dto.CategoryId,
                    Description = dto.Description,
                    IsRecurring = dto.IsRecurring,
                    RecurringFrequency = dto.RecurringFrequency,
                    NextOccurrenceDate = dto.IsRecurring ? (dto.NextOccurrenceDate ?? CalculateNextOccurrence(dto.Date, dto.RecurringFrequency)) : null,
                    PhotoUrl = dto.PhotoUrl
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

        [HttpPost("upload-photo")]
        
        public async Task<IActionResult> UploadPhoto(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                // Generate a unique object name, e.g., using timestamp and user id
                int userId = GetUserId();
                string objectName = $"{userId}/transactions/{DateTime.UtcNow:yyyyMMddHHmmss}_{file.FileName}";

                string photoUrl = await _storageUploader.UploadAsync(file, objectName);

                return Ok(new { PhotoUrl = photoUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Upload failed.", Error = ex.Message });
            }
        }

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
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed or ID missing." });
            }

            var transactions = await _transactionRepository.GetFilteredTransactionsAsync(userId, type, isRecurring);

            // Recalculate any missing conversions
            var user = await _transactionRepository.GetUserByIdAsync(userId);
            if (user != null)
            {
                foreach (var transaction in transactions)
                {
                    if (transaction.AmountConverted == null && transaction.Currency != user.DefaultCurrency)
                    {
                        var rate = await _currencyService.GetConversionRateAsync(transaction.Currency, user.DefaultCurrency);
                        transaction.AmountConverted = await _currencyService.ConvertAmountAsync(transaction.Amount, transaction.Currency, user.DefaultCurrency);
                        transaction.ConversionRate = rate;
                    }
                    else if (transaction.Currency == user.DefaultCurrency)
                    {
                        transaction.AmountConverted = transaction.Amount;
                        transaction.ConversionRate = null;
                    }
                }
            }

            return Ok(transactions);
        }

        [HttpGet("calendar")]
        public async Task<IActionResult> GetTransactionsForCalendar(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            int userId;
            try
            {
                userId = GetUserId();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed or ID missing." });
            }

            var transactions = await _transactionRepository.GetTransactionsByDateRangeAsync(userId, startDate, endDate);

            return Ok(transactions);
        }

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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionUpdateDto dto)
        {
            int userId = GetUserId();
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
            transaction.RecurringFrequency = dto.RecurringFrequency ?? transaction.RecurringFrequency;
            transaction.NextOccurrenceDate = dto.NextOccurrenceDate ?? transaction.NextOccurrenceDate;
            transaction.PhotoUrl = dto.PhotoUrl;

            if (transaction.Amount <= 0 || string.IsNullOrEmpty(transaction.Currency) || string.IsNullOrEmpty(transaction.Type))
            {
                return BadRequest("Mandatory fields (Type, Amount, Currency) cannot be empty or invalid.");
            }

            await _transactionRepository.UpdateTransactionAsync(transaction);

            return Ok(transaction);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            int userId = GetUserId();

            bool success = await _transactionRepository.DeleteTransactionAsync(id, userId);

            if (!success)
            {
                return NotFound("Transaction not found or unauthorized.");
            }

            return NoContent();
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportTransactions(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded or file is empty." });
            }

            int currentUserId;
            try
            {
                currentUserId = GetUserId();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { Message = "User authentication failed or ID missing." });
            }

            try
            {
                var transactionsToCreate = await ParseCsvFile(file, currentUserId);

                if (transactionsToCreate.Count == 0)
                {
                    return BadRequest(new { message = "The CSV file contained no valid transaction data after processing." });
                }

                await _transactionRepository.AddTransactionsFromCsvAsync(transactionsToCreate);

                return Ok(new { message = $"Successfully imported {transactionsToCreate.Count} transactions." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error during import: {ex.Message}" });
            }
        }

        private async Task<List<CsvTransactionDto>> ParseCsvFile(IFormFile file, int userId)
        {
            var transactions = new List<CsvTransactionDto>();
            var culture = CultureInfo.InvariantCulture;

            const int DATE_INDEX = 0;
            const int TYPE_INDEX = 1;
            const int AMOUNT_INDEX = 2;
            const int CURRENCY_INDEX = 3;
            const int DESCRIPTION_INDEX = 4;
            const int RECURRING_INDEX = 5;
            const int CATEGORY_ID_INDEX = 6;
            const int MIN_COLUMNS = 7;

            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                await reader.ReadLineAsync(); // Skip header row

                string? line;
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    var values = line.Split(',');

                    if (values.Length < MIN_COLUMNS) continue;

                    try
                    {
                        if (!DateTime.TryParse(values[DATE_INDEX].Trim(), culture, DateTimeStyles.None, out var date) ||
                            !decimal.TryParse(values[AMOUNT_INDEX].Trim(), NumberStyles.Any, culture, out var amount) ||
                            amount <= 0.01M)
                        {
                            continue; // Skip invalid line
                        }

                        string categoryName = values[CATEGORY_ID_INDEX].Trim();
                        int categoryId = await _transactionRepository.GetCategoryIdByName(categoryName);

                        bool isRecurring = bool.TryParse(values[RECURRING_INDEX].Trim(), out var recurring) ? recurring : false;

                        transactions.Add(new CsvTransactionDto
                        {
                            UserId = userId,
                            Date = date,
                            Type = values[TYPE_INDEX].Trim(),
                            Amount = amount,
                            Currency = values[CURRENCY_INDEX].Trim(),
                            Description = values[DESCRIPTION_INDEX].Trim(),
                            IsRecurring = isRecurring,
                            CategoryId = categoryId
                        });
                    }
                    catch (Exception)
                    {
                        // Log and skip bad line
                        continue;
                    }
                }
            }
            return transactions;
        }

        private DateOnly CalculateNextOccurrence(DateOnly current, string? frequency)
        {
            return frequency?.ToLower() switch
            {
                "daily" => current.AddDays(1),
                "weekly" => current.AddDays(7),
                "monthly" => current.AddMonths(1),
                "yearly" => current.AddYears(1),
                _ => current.AddMonths(1)
            };
        }

    }
}