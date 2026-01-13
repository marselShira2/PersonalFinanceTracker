# Transaction Calendar Feature

## Overview
A calendar view for visualizing transactions in a monthly/weekly grid format using FullCalendar.

## Features
- Monthly and weekly calendar views
- Color-coded transactions (red for expenses, green for income)
- Click on events to view transaction details
- Automatic date range filtering when navigating months
- Responsive design with PrimeNG dialog for details

## Backend Changes

### New Endpoint
- **GET** `/api/Transactions/calendar`
  - Query params: `startDate`, `endDate` (optional)
  - Returns transactions within the specified date range

### Files Modified
1. `TransactionsController.cs` - Added `GetTransactionsForCalendar` endpoint
2. `ITransactionRepository.cs` - Added `GetTransactionsByDateRangeAsync` method signature
3. `TransactionRepository.cs` - Implemented date range filtering logic

## Frontend Changes

### New Component
- `transaction-calendar.component.ts/html/css` - Main calendar component

### Files Modified
1. `transaction.service.ts` - Added `getTransactionsForCalendar` method
2. `app-routing.module.ts` - Added route `/transaction-calendar`
3. `app.module.ts` - Added FullCalendarModule and component declaration
4. `app.menu.component.ts` - Added "Calendar View" menu item
5. `styles.css` - Added FullCalendar CSS imports

## Usage
Navigate to "Calendar View" from the sidebar menu to see your transactions in calendar format.

## Dependencies
- @fullcalendar/angular
- @fullcalendar/core
- @fullcalendar/daygrid
- @fullcalendar/interaction
