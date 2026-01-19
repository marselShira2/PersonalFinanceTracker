export interface ExpenseLimitStatus {
  categoryId: number;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageSpent: number;
  month: number;
  year: number;
  isActive: boolean;
  currency: string;
}

export interface SetLimitRequest {
  userId: number;
  categoryId: number;
  amount: number;
  month?: number;
  year?: number;
  isActive?: boolean;
}