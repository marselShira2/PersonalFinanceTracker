// Interfaces matching the structure of your backend DTOs

/**
 * Interface representing a full Transaction entity returned from the API.
 * This should include the transactionId, which is usually not present in the Create DTO.
 */
export interface Transaction {
  transactionId: number;

  // Core data fields matching TransactionCreateDto
  type: string;          // Maps to C# string
  amount: number;        // Maps to C# decimal
  currency: string;      // Maps to C# string
  date: Date;            // Maps to C# DateOnly
  isRecurring: boolean;  // Maps to C# bool

  // Optional fields (C# nullable)
  categoryId?: number;   // Maps to C# int?
  description?: string;  // Maps to C# string?
}

/**
 * Data structure for header pagination information (if your API returns it).
 */
export interface PaginationHeader {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}
