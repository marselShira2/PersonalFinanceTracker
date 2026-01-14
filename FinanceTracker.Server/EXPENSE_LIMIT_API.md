# Expense Limit API - Monthly Category Budget

## Overview
Backend API for setting and tracking monthly expense limits per category.

## Database Schema
**Table:** `expense_limits`
- `id` (int, PK)
- `user_id` (int, FK to users)
- `category_id` (int, FK to categories)
- `limit_amount` (decimal)
- `month` (int)
- `year` (int)

## API Endpoints

### 1. Set Monthly Limit
**POST** `/api/ExpenseLimit`

**Request Body:**
```json
{
  "userId": 1,
  "categoryId": 5,
  "amount": 500.00,
  "month": 1,
  "year": 2026
}
```
*Note: month and year are optional, defaults to current month/year*

**Response:**
```json
{
  "message": "Limit set successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "categoryId": 5,
    "limitAmount": 500.00,
    "month": 1,
    "year": 2026
  }
}
```

### 2. Get Limit Status for Category
**GET** `/api/ExpenseLimit/{userId}/category/{categoryId}?month=1&year=2026`

**Response:**
```json
{
  "categoryId": 5,
  "categoryName": "Food",
  "limitAmount": 500.00,
  "spentAmount": 320.50,
  "remainingAmount": 179.50,
  "percentageSpent": 64.1,
  "month": 1,
  "year": 2026
}
```

### 3. Get All Limits for User
**GET** `/api/ExpenseLimit/{userId}?month=1&year=2026`

**Response:**
```json
[
  {
    "categoryId": 5,
    "categoryName": "Food",
    "limitAmount": 500.00,
    "spentAmount": 320.50,
    "remainingAmount": 179.50,
    "percentageSpent": 64.1,
    "month": 1,
    "year": 2026
  },
  {
    "categoryId": 8,
    "categoryName": "Transport",
    "limitAmount": 200.00,
    "spentAmount": 150.00,
    "remainingAmount": 50.00,
    "percentageSpent": 75.0,
    "month": 1,
    "year": 2026
  }
]
```

### 4. Delete Limit
**DELETE** `/api/ExpenseLimit/{userId}/category/{categoryId}?month=1&year=2026`

**Response:**
```json
{
  "message": "Limit deleted successfully"
}
```

## Features
- Set different budget limits for each category
- Track limits on a monthly basis
- Automatically calculates spent amount from transactions
- Returns remaining amount and percentage spent
- Supports multiple categories per user
- Historical tracking (different limits for different months)

## Implementation Files
- **Model:** `Models/ExpenseLimit.cs`
- **Controller:** `Controllers/ExpenseLimitController.cs`
- **Repository:** `Repositories/ExpenseLimitRepository.cs`
- **Interface:** `Interfaces/IExpenseLimitRepository.cs`
- **DTOs:** `Data/Dto/SetLimitDto.cs`, `Data/Dto/LimitStatusDto.cs`
