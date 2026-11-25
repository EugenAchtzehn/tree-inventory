import { eulerAnglesToCompassHeading } from './geo'
import type {
  DeviceLocation,
  DeviceOrientationEventConstructorWithPermission,
  DeviceOrientationEventWithWebKit,
  DevicePosition,
  PermissionSnapshot,
} from './types'

export class BrowserDeviceLocation implements DeviceLocation {
  private watchId: number | null = null
  private lastGeo: Omit<DevicePosition, 'heading'> | null = null
  private heading: number | null = null
  private onUpdate: ((position: DevicePosition) => void) | null = null
  private onError: ((message: string) => void) | null = null
  private orientationEvent: 'deviceorientationabsolute' | 'deviceorientation' | null = null
  private updateTimer: number | null = null

  async queryPermissions(): Promise<PermissionSnapshot> {
    let geolocation: PermissionState = 'prompt'
    try {
      geolocation = (await navigator.permissions.query({ name: 'geolocation' })).state
    } catch {
      geolocation = 'prompt'
    }
    const orientation = 'DeviceOrientationEvent' in window
      ? (this.needsOrientationPermission() ? 'prompt' : 'granted')
      : 'unsupported'
    return { geolocation, orientation }
  }

  async requestPermissions(): Promise<PermissionSnapshot> {
    const Orientation = window.DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission
    let orientation: PermissionState | 'unsupported' = 'unsupported'
    if ('DeviceOrientationEvent' in window) {
      try {
        orientation = Orientation.requestPermission ? await Orientation.requestPermission(true) : 'granted'
      } catch {
        orientation = 'denied'
      }
    }

    const geolocation = await new Promise<PermissionState>((resolve) => {
      if (!navigator.geolocation) return resolve('denied')
      navigator.geolocation.getCurrentPosition(
        () => resolve('granted'),
        (error) => resolve(error.code === error.PERMISSION_DENIED ? 'denied' : 'granted'),
        { enableHighAccuracy: true, timeout: 8_000, maximumAge: 30_000 },
      )
    })
    return { geolocation, orientation }
  }

  start(onUpdate: (position: DevicePosition) => void, onError: (message: string) => void): void {
    this.stop()
    this.onUpdate = onUpdate
    this.onError = onError
    if (!navigator.geolocation) {
      onError('此瀏覽器不支援定位')
      return
    }
    this.watchId = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        this.lastGeo = { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, timestamp }
        this.queueUpdate()
      },
      (error) => onError(this.geolocationError(error)),
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 15_000 },
    )
    this.bindOrientation()
  }

  stop(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId)
    this.watchId = null
    if (this.orientationEvent) window.removeEventListener(this.orientationEvent, this.handleOrientation as EventListener)
    this.orientationEvent = null
    if (this.updateTimer !== null) window.clearTimeout(this.updateTimer)
    this.updateTimer = null
  }

  private bindOrientation() {
    if ('ondeviceorientationabsolute' in window) {
      this.orientationEvent = 'deviceorientationabsolute'
    } else if ('ondeviceorientation' in window) {
      this.orientationEvent = 'deviceorientation'
    }
    if (this.orientationEvent) window.addEventListener(this.orientationEvent, this.handleOrientation as EventListener)
  }

  private readonly handleOrientation = (rawEvent: DeviceOrientationEvent) => {
    const event = rawEvent as DeviceOrientationEventWithWebKit
    if (typeof event.webkitCompassHeading === 'number') {
      this.heading = event.webkitCompassHeading
    } else if (event.absolute) {
      this.heading = eulerAnglesToCompassHeading(event.alpha, event.beta, event.gamma)
    }
    this.queueUpdate()
  }

  private queueUpdate() {
    if (this.updateTimer !== null) return
    this.updateTimer = window.setTimeout(() => {
      this.updateTimer = null
      if (this.lastGeo && this.onUpdate) this.onUpdate({ ...this.lastGeo, heading: this.heading })
    }, 50)
  }

  private needsOrientationPermission() {
    const Orientation = window.DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission
    return typeof Orientation.requestPermission === 'function'
  }

  private geolocationError(error: GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) return '定位權限已被拒絕，仍可在地圖中心手動放置樹木'
    if (error.code === error.TIMEOUT) return '定位逾時，請移至較空曠處再試一次'
    return '目前無法取得定位'
  }
}
