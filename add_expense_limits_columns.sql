USE finance_tracker;

-- Add category_id column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[expense_limits]') AND name = 'category_id')
BEGIN
    ALTER TABLE [expense_limits] ADD [category_id] int NOT NULL DEFAULT 0;
END

-- Add month column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[expense_limits]') AND name = 'month')
BEGIN
    ALTER TABLE [expense_limits] ADD [month] int NOT NULL DEFAULT 0;
END

-- Add year column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[expense_limits]') AND name = 'year')
BEGIN
    ALTER TABLE [expense_limits] ADD [year] int NOT NULL DEFAULT 0;
END