using System.Text.Json;

namespace FinanceTracker.Server.Services
{
    public interface ICurrencyConversionService
    {
        Task<decimal> GetConversionRateAsync(string fromCurrency, string toCurrency);
        Task<decimal> ConvertAmountAsync(decimal amount, string fromCurrency, string toCurrency);
    }

    public class CurrencyConversionService : ICurrencyConversionService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<CurrencyConversionService> _logger;
        private readonly Dictionary<string, decimal> _rateCache = new();
        private DateTime _lastCacheUpdate = DateTime.MinValue;
        private readonly TimeSpan _cacheExpiry = TimeSpan.FromHours(1);

        public CurrencyConversionService(HttpClient httpClient, ILogger<CurrencyConversionService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<decimal> GetConversionRateAsync(string fromCurrency, string toCurrency)
        {
            if (fromCurrency.Equals(toCurrency, StringComparison.OrdinalIgnoreCase))
                return 1.0m;

            var cacheKey = $"{fromCurrency}_{toCurrency}";
            
            if (_rateCache.ContainsKey(cacheKey) && DateTime.UtcNow - _lastCacheUpdate < _cacheExpiry)
            {
                return _rateCache[cacheKey];
            }

            try
            {
                // Use Frankfurter API for all conversions (supports EUR, USD, but not ALL)
                if (fromCurrency != "ALL" && toCurrency != "ALL")
                {
                    var url = $"https://api.frankfurter.app/latest?from={fromCurrency}&to={toCurrency}";
                    var response = await _httpClient.GetStringAsync(url);
                    var data = JsonSerializer.Deserialize<FrankfurterResponse>(response);

                    if (data?.Rates != null && data.Rates.ContainsKey(toCurrency))
                    {
                        var rate = data.Rates[toCurrency];
                        _rateCache[cacheKey] = rate;
                        _lastCacheUpdate = DateTime.UtcNow;
                        return rate;
                    }
                }
                else
                {
                    // Handle ALL conversions with fallback rates only
                    return GetFallbackRate(fromCurrency, toCurrency);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get conversion rate from {FromCurrency} to {ToCurrency}", fromCurrency, toCurrency);
                // Use fallback rates if API fails
                return GetFallbackRate(fromCurrency, toCurrency);
            }

            return 1.0m;
        }

        private decimal GetFallbackRate(string fromCurrency, string toCurrency)
        {
            // Fallback rates only for ALL conversions
            var fallbackRates = new Dictionary<string, decimal>
            {
                { "EUR", 105.0m }, // 1 EUR = 105 ALL
                { "USD", 95.0m }   // 1 USD = 95 ALL
            };

            if (fromCurrency == "ALL" && fallbackRates.ContainsKey(toCurrency))
                return 1.0m / fallbackRates[toCurrency];
            
            if (toCurrency == "ALL" && fallbackRates.ContainsKey(fromCurrency))
                return fallbackRates[fromCurrency];

            // EUR/USD fallback if API completely fails
            if (fromCurrency == "EUR" && toCurrency == "USD") return 1.10m;
            if (fromCurrency == "USD" && toCurrency == "EUR") return 0.91m;

            return 1.0m;
        }

        public async Task<decimal> ConvertAmountAsync(decimal amount, string fromCurrency, string toCurrency)
        {
            var rate = await GetConversionRateAsync(fromCurrency, toCurrency);
            return amount * rate;
        }
    }

    public class FrankfurterResponse
    {
        public decimal Amount { get; set; }
        public string Base { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public Dictionary<string, decimal> Rates { get; set; } = new();
    }
}