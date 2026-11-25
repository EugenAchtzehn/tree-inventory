import { MockAuthAdapter } from '@/modules/auth/mock-auth-adapter'
import { TokenStore } from '@/modules/auth/token-store'
import type { AuthGateway } from '@/modules/auth/types'
import { MockInventoryAdapter } from '@/modules/inventory/mock-inventory-adapter'
import type { TreeInventoryGateway } from '@/modules/inventory/types'
import { BrowserDeviceLocation } from '@/modules/location/browser-device-location'
import type { DeviceLocation } from '@/modules/location/types'
import { BrowserJsonStorage } from '@/shared/storage'

export interface Dependencies {
  auth: AuthGateway
  inventory: TreeInventoryGateway
  location: DeviceLocation
}

const storage = new BrowserJsonStorage()
const tokens = new TokenStore(storage)

export const dependencies: Dependencies = {
  auth: new MockAuthAdapter(tokens, storage),
  inventory: new MockInventoryAdapter(storage),
  location: new BrowserDeviceLocation(),
}
