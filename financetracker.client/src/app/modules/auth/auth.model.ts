export interface AuthModel {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: any; // optionally replace with a proper UserModel
}
