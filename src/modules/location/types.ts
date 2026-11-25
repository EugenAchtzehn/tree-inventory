export type PermissionStateLike = PermissionState | 'unsupported'

export interface DevicePosition {
  latitude: number
  longitude: number
  accuracy: number
  heading: number | null
  timestamp: number
}

export interface PermissionSnapshot {
  geolocation: PermissionStateLike
  orientation: PermissionStateLike
}

export interface DeviceLocation {
  queryPermissions(): Promise<PermissionSnapshot>
  requestPermissions(): Promise<PermissionSnapshot>
  start(onUpdate: (position: DevicePosition) => void, onError: (message: string) => void): void
  stop(): void
}

export interface DeviceOrientationEventWithWebKit extends DeviceOrientationEvent {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

export interface DeviceOrientationEventConstructorWithPermission {
  requestPermission?: (absolute?: boolean) => Promise<'granted' | 'denied'>
}
