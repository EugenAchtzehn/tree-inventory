import { z } from 'zod'
import { AppError } from '@/shared/errors'
import type { JsonStorage } from '@/shared/storage'
import type { AuthGateway, AuthSession, LoginInput, UserProfile } from './types'
import { TokenStore } from './token-store'

const envSchema = z.object({
  VITE_MOCK_EMAIL: z.string().email(),
  VITE_MOCK_PASSWORD: z.string().min(8),
  VITE_MOCK_NAME: z.string().min(1),
  VITE_MOCK_ACCESS_TOKEN: z.string().min(10),
})

const PROFILE_KEY = 'tree-inventory.profile'
const delay = (milliseconds = 350) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export class MockAuthAdapter implements AuthGateway {
  private readonly env = envSchema.parse(import.meta.env)

  constructor(
    private readonly tokens: TokenStore,
    private readonly storage: JsonStorage,
  ) {}

  async login(input: LoginInput): Promise<AuthSession> {
    await delay()
    if (input.email.toLowerCase() !== this.env.VITE_MOCK_EMAIL.toLowerCase() || input.password !== this.env.VITE_MOCK_PASSWORD) {
      throw new AppError('UNAUTHORIZED', '帳號或密碼不正確')
    }
    this.tokens.save(this.env.VITE_MOCK_ACCESS_TOKEN)
    return { accessToken: this.env.VITE_MOCK_ACCESS_TOKEN, user: this.profile() }
  }

  async register(): Promise<void> {
    await delay(500)
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    if (!this.tokens.getValid()) return null
    return this.profile()
  }

  async updateProfile(name: string): Promise<UserProfile> {
    if (!this.tokens.getValid()) throw new AppError('UNAUTHORIZED', '登入已過期')
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      throw new AppError('VALIDATION', '姓名至少需要 2 個字元', false, { name: '姓名至少需要 2 個字元' })
    }
    const updated = { ...this.profile(), name: trimmedName }
    this.storage.write(PROFILE_KEY, updated)
    await delay()
    return updated
  }

  async logout(): Promise<void> {
    this.tokens.clear()
  }

  private profile(): UserProfile {
    return this.storage.read<UserProfile>(PROFILE_KEY, {
      id: 'demo-user',
      email: this.env.VITE_MOCK_EMAIL,
      name: this.env.VITE_MOCK_NAME,
    })
  }
}
