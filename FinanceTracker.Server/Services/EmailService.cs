// File Location: FinanceTracker.Server/Services/EmailService.cs (REAL SMTP IMPLEMENTATION)

using FinanceTracker.Server.Interfaces;
using Microsoft.Extensions.Configuration; // NEW: Required for reading settings
using Microsoft.Extensions.Logging;
using System.Net.Mail; // Required for SmtpClient
using System.Net; // Required for NetworkCredential
using System.Text;
using System.Threading.Tasks;

namespace FinanceTracker.Server.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration; // NEW FIELD
        private readonly ILogger<EmailService> _logger;

        // 🎯 FIX: Constructor must accept IConfiguration
        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            // 🎯 FIX: Read settings from the IConfiguration
            var settings = _configuration.GetSection("EmailSettings");
            var host = settings["SmtpHost"];
            var port = int.Parse(settings["SmtpPort"]!);
            var username = settings["Username"];
            var password = settings["Password"];
            var fromEmail = settings["FromEmail"];
            var senderName = settings["SenderName"];
            var enableSsl = bool.Parse(settings["EnableSsl"]!);

            // Check for critical missing info
            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                _logger.LogError("SMTP settings are missing or incomplete. Email not sent.");
                return;
            }

            try
            {
                using var client = new SmtpClient(host, port)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = enableSsl
                };

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail!, senderName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true,
                    BodyEncoding = Encoding.UTF8
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation($"Real email sent successfully to {toEmail} via {host}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {toEmail}. Check App Password/Security settings.");
            }
        }
    }
}