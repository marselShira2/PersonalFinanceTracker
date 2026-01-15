-- Manual SQL script to add default_currency column if migration fails
-- Run this directly in SQL Server Management Studio or similar tool

USE finance_tracker;

-- Check if column exists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'default_currency')
BEGIN
    ALTER TABLE [users] 
    ADD [default_currency] nvarchar(3) NOT NULL DEFAULT 'USD';
    
    PRINT 'default_currency column added successfully';
END
ELSE
BEGIN
    PRINT 'default_currency column already exists';
END