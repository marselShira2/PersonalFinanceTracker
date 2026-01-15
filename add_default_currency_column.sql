USE finance_tracker;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'default_currency')
BEGIN
    ALTER TABLE [users] ADD [default_currency] nvarchar(3) NOT NULL DEFAULT 'USD';
END