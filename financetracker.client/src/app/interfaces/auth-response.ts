export interface AuthResponse {
  token: string,
  isSuccess: boolean,
  message: string,
  refreshToken: string
  refreshTokenValidity: string,
  twoFactorAuthenticationChecked: boolean
  twoFactorAuthenticationMethod: string
  credential: string,
  email: string,
  selfDeclaration: string,
  authSource: string
}
