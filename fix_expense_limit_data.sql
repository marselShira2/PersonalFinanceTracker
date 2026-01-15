USE HotelManagement;

-- Update invalid category_id values to NULL
UPDATE expense_limits 
SET category_id = NULL 
WHERE category_id NOT IN (SELECT category_id FROM categories) AND category_id != 0;

-- Update category_id = 0 to NULL
UPDATE expense_limits 
SET category_id = NULL 
WHERE category_id = 0;