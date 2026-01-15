USE finance_tracker;

-- Add amount_converted column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND name = 'amount_converted')
BEGIN
    ALTER TABLE [transactions] ADD [amount_converted] decimal(12, 2) NULL;
END

-- Add conversion_rate column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND name = 'conversion_rate')
BEGIN
    ALTER TABLE [transactions] ADD [conversion_rate] decimal(10, 6) NULL;
END