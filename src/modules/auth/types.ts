import { z } from 'zod'

export const loginInputSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z.string().min(8, '密碼至少需要 8 個字元'),
})

export const registerInputSchema = loginInputSchema.extend({
  name: z.string().trim().min(2, '姓名至少需要 2 個字元'),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  message: '兩次輸入的密碼不一致',
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginInputSchema>
export type RegisterInput = z.infer<typeof registerInputSchema>

export interface UserProfile {
  id: string
  email: string
  name: string
}

export interface AuthSession {
  accessToken: string
  user: UserProfile
}

export interface AuthGateway {
  login(input: LoginInput): Promise<AuthSession>
  register(input: RegisterInput): Promise<void>
  getCurrentUser(): Promise<UserProfile | null>
  updateProfile(name: string): Promise<UserProfile>
  logout(): Promise<void>
}
