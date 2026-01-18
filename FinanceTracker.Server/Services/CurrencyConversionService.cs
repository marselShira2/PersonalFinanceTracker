using System.Text.Json;

namespace FinanceTracker.Server.Services
{
    public interface ICurrencyConversionService
    {
        decimal GetConversionRate(string fromCurrency, string toCurrency);
        decimal ConvertAmount(decimal amount, string fromCurrency, string toCurrency);
    }

    public class CurrencyConversionService : ICurrencyConversionService
    {
        private readonly Dictionary<string, Dictionary<string, decimal>> _staticRates = new()
        {
            ["USD"] = new() { ["EUR"] = 0.91m, ["ALL"] = 95.0m },
            ["EUR"] = new() { ["USD"] = 1.10m, ["ALL"] = 105.0m },
            ["ALL"] = new() { ["USD"] = 0.0105m, ["EUR"] = 0.0095m }
        };

        public decimal GetConversionRate(string fromCurrency, string toCurrency)
        {
            if (fromCurrency.Equals(toCurrency, StringComparison.OrdinalIgnoreCase))
                return 1.0m;

            if (_staticRates.ContainsKey(fromCurrency) && _staticRates[fromCurrency].ContainsKey(toCurrency))
                return _staticRates[fromCurrency][toCurrency];

            return 1.0m;
        }

        public decimal ConvertAmount(decimal amount, string fromCurrency, string toCurrency)
        {
            var rate = GetConversionRate(fromCurrency, toCurrency);
            return amount * rate;
        }
    }
}