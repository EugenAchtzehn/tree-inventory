import type { JsonStorage } from '@/shared/storage'

const TOKEN_KEY = 'tree-inventory.auth-token'

interface JwtPayload {
  sub?: string
  email?: string
  name?: string
  exp?: number
}

export class TokenStore {
  constructor(private readonly storage: JsonStorage) {}

  save(token: string): void {
    this.storage.write(TOKEN_KEY, token)
  }

  clear(): void {
    this.storage.remove(TOKEN_KEY)
  }

  getValid(): string | null {
    const token = this.storage.read<string | null>(TOKEN_KEY, null)
    if (!token) return null
    const payload = this.decode(token)
    if (!payload?.exp || payload.exp * 1000 <= Date.now()) {
      this.clear()
      return null
    }
    return token
  }

  decode(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1]
      if (!payload) return null
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
      const decoded = decodeURIComponent(
        Array.from(atob(normalized), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
      )
      return JSON.parse(decoded) as JwtPayload
    } catch {
      return null
    }
  }
}
