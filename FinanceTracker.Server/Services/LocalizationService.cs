using System.Collections.Generic;

namespace FinanceTracker.Server.Services
{
    public interface ILocalizationService
    {
        string GetLocalizedMessage(string key, string language, params object[] args);
    }

    public class LocalizationService : ILocalizationService
    {
        private readonly Dictionary<string, Dictionary<string, string>> _translations = new()
        {
            ["BUDGET_EXCEEDED_TITLE"] = new()
            {
                ["en"] = "Budget Exceeded",
                ["sq"] = "Buxheti u Tejkalua"
            },
            ["BUDGET_EXCEEDED_MESSAGE"] = new()
            {
                ["en"] = "🚨 ALARM: You have exceeded the budget for category '{0}'! Used: {1}%",
                ["sq"] = "🚨 ALARM: Ju e keni tejkaluar buxhetin për kategorinë '{0}'! Përdorur: {1}%"
            },
            ["BUDGET_WARNING_TITLE"] = new()
            {
                ["en"] = "Budget Warning",
                ["sq"] = "Paralajmërim Buxheti"
            },
            ["BUDGET_WARNING_95_MESSAGE"] = new()
            {
                ["en"] = "⚠️ DANGER: You have used {0}% of the budget for category '{1}'!",
                ["sq"] = "⚠️ RREZIK: Keni përdorur {0}% të buxhetit për kategorinë '{1}'!"
            },
            ["BUDGET_WARNING_90_MESSAGE"] = new()
            {
                ["en"] = "⚠️ DANGER: You have used {0}% of the budget for category '{1}'!",
                ["sq"] = "⚠️ RREZIK: Keni përdorur {0}% të buxhetit për kategorinë '{1}'!"
            },
            ["BUDGET_WARNING_70_MESSAGE"] = new()
            {
                ["en"] = "⚠️ DANGER: You have used {0}% of the budget for category '{1}'!",
                ["sq"] = "⚠️ RREZIK: Keni përdorur {0}% të buxhetit për kategorinë '{1}'!"
            },
            ["BUDGET_UPDATE_TITLE"] = new()
            {
                ["en"] = "👀 Budget Update",
                ["sq"] = "👀 Përditësim i Buxhetit"
            },
            ["BUDGET_UPDATE_MESSAGE"] = new()
            {
                ["en"] = "Notice: You have used {0}% of the budget for category '{1}'.",
                ["sq"] = "Njoftim: Keni përdorur {0}% të buxhetit për kategorinë '{1}'."
            },
            ["RECURRING_PAYMENT_TITLE"] = new()
            {
                ["en"] = "Recurring Payment",
                ["sq"] = "Pagese e perseritshme"
            },
            ["RECURRING_PAYMENT_MESSAGE"] = new()
            {
                ["en"] = "🔄 Recurring payment of {0} {1} was recorded.",
                ["sq"] = "🔄 Pagesa e perseritshme e {0} {1} u rregjistrua."
            }
        };

        public string GetLocalizedMessage(string key, string language, params object[] args)
        {
            if (_translations.TryGetValue(key, out var translations) &&
                translations.TryGetValue(language, out var message))
            {
                return args.Length > 0 ? string.Format(message, args) : message;
            }

            // Fallback to English if translation not found
            if (language != "en" && _translations.TryGetValue(key, out var fallbackTranslations) &&
                fallbackTranslations.TryGetValue("en", out var fallbackMessage))
            {
                return args.Length > 0 ? string.Format(fallbackMessage, args) : fallbackMessage;
            }

            return key; // Return key if no translation found
        }
    }
}