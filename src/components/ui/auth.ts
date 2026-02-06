export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: string
  tokenType: string
}

export interface UserAuth {
  sub: string
  role: string
  iat: number
  exp: number
}
