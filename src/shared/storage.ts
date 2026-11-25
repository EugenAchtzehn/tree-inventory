import { AppError } from './errors'

export interface JsonStorage {
  read<T>(key: string, fallback: T): T
  write<T>(key: string, value: T): void
  remove(key: string): void
}

export class BrowserJsonStorage implements JsonStorage {
  read<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key)
      return value === null ? fallback : (JSON.parse(value) as T)
    } catch {
      return fallback
    }
  }

  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      throw new AppError('STORAGE', '無法在此裝置保存資料')
    }
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }
}
