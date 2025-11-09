export interface UserDetailsDTO {
  id?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
  phoneNumber?: string;
  twoFactorAuthenticationEnabled: boolean;
  phoneNumberConfirmed: boolean;
  accessFailedCount: number;
  status: boolean;
}

