USE finance_tracker;

-- Add recurring_frequency column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND name = 'recurring_frequency')
BEGIN
    ALTER TABLE [transactions] ADD [recurring_frequency] nvarchar(20) NULL;
END

-- Add next_occurrence_date column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[transactions]') AND name = 'next_occurrence_date')
BEGIN
    ALTER TABLE [transactions] ADD [next_occurrence_date] date NULL;
END