export interface ExpenseLimitStatus {
  limitAmount: number;
  balance: number;
  spentAmount: number;
  percentageSpent: number;
  warningMessage: string;
  isActive?: boolean;
}

export interface SetLimitRequest {
  userId: number;
  amount: number;
}