import type { GeoPoint } from '@/modules/inventory/types'

const EARTH_RADIUS_M = 6_371_008.8
const radians = (degrees: number) => (degrees * Math.PI) / 180
const degrees = (value: number) => (value * 180) / Math.PI

export function destinationPoint(origin: GeoPoint, bearingDegrees: number, distanceMeters: number): GeoPoint {
  const angularDistance = distanceMeters / EARTH_RADIUS_M
  const bearing = radians(bearingDegrees)
  const lat1 = radians(origin.latitude)
  const lon1 = radians(origin.longitude)
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance)
      + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  )
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
  )
  return { latitude: degrees(lat2), longitude: ((degrees(lon2) + 540) % 360) - 180 }
}

export function eulerAnglesToCompassHeading(alpha: number | null, beta: number | null, gamma: number | null): number {
  const x = radians(beta ?? 0)
  const y = radians(gamma ?? 0)
  const z = radians(alpha ?? 0)
  const cY = Math.cos(y)
  const cZ = Math.cos(z)
  const sX = Math.sin(x)
  const sY = Math.sin(y)
  const sZ = Math.sin(z)
  const vx = -cZ * sY - sZ * sX * cY
  const vy = -sZ * sY + cZ * sX * cY
  let heading = Math.atan2(vx, vy)
  if (heading < 0) heading += 2 * Math.PI
  return degrees(heading)
}
