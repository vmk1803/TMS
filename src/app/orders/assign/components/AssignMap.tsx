"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import 'leaflet/dist/leaflet.css'
import type { LatLng } from 'leaflet'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Polygon, useMap, useMapEvents, CircleMarker, Popup } from 'react-leaflet'
import type { LatLngBounds } from 'leaflet'

import { BacktIcon, AssignIcon } from '../../../../components/Icons'
import ButtonLight from '../../../../components/common/ButtonLight'
import Toast from '../../../../components/common/Toast'
import SuccessUpdateModal from '../../../../components/common/SuccessUpdateModal'
import AssignOrderModal from '../components/AssignOrderModal'
import { assignTechnician } from '../../manageAllOrders/services/assignTechnicianService'
import { getAllOrders } from '../../manageAllOrders/services/getAllOrderService'

interface Order {
  order_guid: string
  urgency?: string | null
  fasting?: boolean
  status?: string | null

  service_latitude?: number | null
  service_longitude?: number | null

  patient_address?: {
    latitude?: number | null
    longitude?: number | null
    address_line1?: string | null
    city?: string | null
    country?: string | null
    zipcode?: string | null
  } | null
  phlebio_order_id?: string
  patient?: {
    first_name?: string | null
    middle_name?: string | null
    last_name?: string | null
    date_of_birth?: string | null
  } | null
  service_address?: string | null
}

interface ShapeDrawLayerProps {
  drawing: boolean
  onShapeChange: (points: [number, number][] | null) => void
}

const ShapeDrawLayer: React.FC<ShapeDrawLayerProps> = ({ drawing, onShapeChange }) => {
  const pointsRef = useRef<LatLng[]>([])

  useMapEvents({
    click(e) {
      if (!drawing) return
      pointsRef.current = [...pointsRef.current, e.latlng]
      const pts: [number, number][] = pointsRef.current.map((p) => [p.lat, p.lng])
      onShapeChange(pts.length >= 3 ? pts : null)
    },
  })

  useEffect(() => {
    if (drawing) {
      pointsRef.current = []
      // Don't reset onShapeChange here - let it be controlled by parent
    }
  }, [drawing])

  return null
}

const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]): boolean => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]

    const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// Component to handle auto-zoom to bounds
const AutoZoomToBounds: React.FC<{ bounds: [[number, number], [number, number]] | null }> = ({ bounds }) => {
  const map = useMap()
  const hasZoomedRef = useRef(false)

  useEffect(() => {
    if (bounds && !hasZoomedRef.current) {
      // Add padding to bounds
      const padding = 0.1 // 10% padding for better view
      const latDiff = bounds[1][0] - bounds[0][0]
      const lngDiff = bounds[1][1] - bounds[0][1]

      // Handle case where all points are at same location
      const effectiveLatDiff = latDiff > 0 ? latDiff : 0.01
      const effectiveLngDiff = lngDiff > 0 ? lngDiff : 0.01

      const paddedBounds: LatLngBounds = L.latLngBounds(
        [bounds[0][0] - effectiveLatDiff * padding, bounds[0][1] - effectiveLngDiff * padding],
        [bounds[1][0] + effectiveLatDiff * padding, bounds[1][1] + effectiveLngDiff * padding]
      )

      map.fitBounds(paddedBounds, { padding: [50, 50], maxZoom: 15 })
      hasZoomedRef.current = true
    }
  }, [bounds, map])

  // Reset zoom flag when bounds change significantly (new orders loaded)
  useEffect(() => {
    hasZoomedRef.current = false
  }, [bounds?.[0]?.[0], bounds?.[1]?.[0]]) // Reset when bounds change

  return null
}

const MapControls: React.FC = () => {
  const map = useMap()
  const [open, setOpen] = useState(false)

  const pan = (dx: number, dy: number) => {
    map.panBy([dx, dy])
  }

  const zoomIn = () => {
    map.zoomIn()
  }

  const zoomOut = () => {
    map.zoomOut()
  }

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-center gap-2">
      {open && (
        <div className="flex flex-col items-center gap-2 mb-1 transition-all duration-200 ease-out">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pan(0, -80)}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 text-sm"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pan(-80, 0)}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 text-sm"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => pan(80, 0)}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 text-sm"
            >
              ▶
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pan(0, 80)}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 text-sm"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={zoomOut}
              className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 text-lg"
            >
              -
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 text-xl"
      >
        ⤢
      </button>
    </div>
  )
}

const AssignMap: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastMessage, setToastMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [shapePoints, setShapePoints] = useState<[number, number][] | null>(null)
  const [isDrawing, setIsDrawing] = useState(true) // Enable drawing by default
  const [drawnShapes, setDrawnShapes] = useState<[number, number][][]>([]) // Store all drawn shapes for undo

  const orderGuidsFromQuery = useMemo(() => {
    const raw = searchParams?.get('orderGuids') || ''
    if (!raw) return [] as string[]
    return raw.split(',').map((g) => g.trim()).filter(Boolean)
  }, [searchParams])

  useEffect(() => {
    const load = async () => {
      if (!orderGuidsFromQuery.length) {
        setOrders([])
        return
      }
      try {
        setLoading(true)
        setError(null)
        const res = await getAllOrders(1, 100, {})
        const items: Order[] = Array.isArray(res) ? res : (res?.data ?? [])
        const filtered = items.filter((o) => {
          if (!o.order_guid || !orderGuidsFromQuery.includes(o.order_guid)) return false
          const status = (o.status || '').toUpperCase()
          return status === 'PENDING'
        })
        setOrders(filtered)
      } catch (e: any) {
        setError(e?.message || 'Failed to load orders for map')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderGuidsFromQuery])

  useEffect(() => {
    setShapePoints(null)
    setIsDrawing(true) // Keep drawing enabled
    setDrawnShapes([]) // Reset drawn shapes when orders change
  }, [orderGuidsFromQuery])

  const markers = useMemo(() => {
    return orders
      .map((o) => {
        const lat = o.service_latitude
        const lng = o.service_longitude
        if (lat == null || lng == null) return null
        const urgency = (o.urgency || '').toUpperCase()
        const fasting = !!o.fasting
        let color = '#007BFF' // Default: Routine + no fasting = blue
        if (urgency === 'STAT' && fasting) color = '#009728' // STAT + fasting = green
        else if (urgency === 'STAT') color = '#FF3B30' // STAT + no fasting = red
        else if (fasting) color = '#FFC107' // Routine + fasting = yellow
        return {
          order: o,
          position: [lat, lng] as [number, number],
          color,
        }
      })
      .filter(Boolean) as { order: Order; position: [number, number]; color: string }[]
  }, [orders])

  const center = useMemo(() => {
    if (!markers.length) return [37.7749, -122.4194] as [number, number]
    const lat = markers.reduce((sum, m) => sum + m.position[0], 0) / markers.length
    const lng = markers.reduce((sum, m) => sum + m.position[1], 0) / markers.length
    return [lat, lng] as [number, number]
  }, [markers])

  // Calculate bounds for auto-zoom
  const bounds = useMemo(() => {
    if (!markers.length) return null
    const lats = markers.map((m) => m.position[0])
    const lngs = markers.map((m) => m.position[1])
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    return [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]]
  }, [markers])

  const ordersInsideShape = useMemo(() => {
    if (!shapePoints || shapePoints.length < 3) return [] as Order[]
    return orders.filter((o) => {
      const lat = o.service_latitude
      const lng = o.service_longitude
      if (lat == null || lng == null) return false
      return isPointInPolygon(lat, lng, shapePoints)
    })
  }, [orders, shapePoints])

  const effectiveSelectedGuids = useMemo(
    () => ordersInsideShape.map((o) => o.order_guid).filter(Boolean),
    [ordersInsideShape]
  )

  const handleRemoveVertex = (index: number) => {
    if (!shapePoints) return
    const next = shapePoints.filter((_, i) => i !== index)
    setShapePoints(next.length >= 3 ? next : null)
  }

  const handleUndo = () => {
    if (shapePoints && shapePoints.length >= 3) {
      setDrawnShapes((prev) => [...prev, shapePoints])
    }
    // Clear drawn shape
    setShapePoints(null)
    // Force ShapeDrawLayer to reset its internal pointsRef
    setIsDrawing(false)
    // Re-enable drawing after small delay to trigger effect cleanly
    setTimeout(() => {
      setIsDrawing(true)
    }, 50)
  }


  // Clustering logic: group markers by location and color
  interface ClusterGroup {
    position: [number, number]
    orders: Array<{ order: Order; color: string }>
    colors: string[]
  }

  const clusters = useMemo(() => {
    const tolerance = 0.00005 // Approximately 5.5 meters - tighter tolerance for better accuracy

    return markers.reduce((acc, marker) => {
      // Find existing cluster at same location (regardless of color)
      const existingCluster = acc.find(cluster => {
        const latDiff = Math.abs(cluster.position[0] - marker.position[0])
        const lngDiff = Math.abs(cluster.position[1] - marker.position[1])
        return latDiff < tolerance && lngDiff < tolerance
      })

      if (existingCluster) {
        existingCluster.orders.push(marker)
        if (!existingCluster.colors.includes(marker.color)) {
          existingCluster.colors.push(marker.color)
        }
      } else {
        acc.push({
          position: marker.position,
          orders: [marker],
          colors: [marker.color]
        })
      }

      return acc
    }, [] as ClusterGroup[])
  }, [markers])

  // Helper to format address
  const getAddress = (order: Order): string => {
    if (order.service_address) return order.service_address
    if (order.patient_address) {
      const parts = [
        order.patient_address.address_line1,
        order.patient_address.city,
        order.patient_address.country,
        order.patient_address.zipcode
      ].filter(Boolean)
      return parts.join(', ') || 'N/A'
    }
    return 'N/A'
  }

  // Helper to format date
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US').replace(/\//g, '-')
    } catch {
      return 'N/A'
    }
  }

  const handleAssign = async (technicianGuid: string | null) => {
    const targetGuids = effectiveSelectedGuids
      .filter((g) => orderGuidsFromQuery.includes(g))

    if (!technicianGuid || !targetGuids.length) return
    try {
      setAssigning(true)
      const res = await assignTechnician({
        order_guids: targetGuids,
        technician_guid: technicianGuid,
      })
      const msg = res?.message || `Technician assigned successfully to ${res?.data?.updated_count ?? targetGuids.length} order(s)`
      setShowAssignModal(false)
      setShowSuccessModal(true)

      const reload = async () => {
        try {
          setLoading(true)
          setError(null)
          const reloadRes = await getAllOrders(1, 100, {})
          const items: Order[] = Array.isArray(reloadRes) ? reloadRes : (reloadRes?.data ?? [])
          const filtered = items.filter((o) => {
            if (!o.order_guid || !orderGuidsFromQuery.includes(o.order_guid)) return false
            const status = (o.status || '').toUpperCase()
            return status === 'PENDING'
          })
          setOrders(filtered)
          setShapePoints(null)
          if (filtered.length === 0) {
            setShouldNavigate(true)
          }
        } catch (e: any) {
          setError(e?.message || 'Failed to load orders for map')
          setOrders([])
        } finally {
          setLoading(false)
        }
      }

      reload()
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to assign technician'
      setToastType('error')
      setToastMessage(msg)
      setToastOpen(true)
    } finally {
      setAssigning(false)
    }
  }

  // New state to track if we should navigate away
  const [shouldNavigate, setShouldNavigate] = useState(false)

  // Navigate when shouldNavigate is true and success modal is closed
  useEffect(() => {
    if (shouldNavigate && !showSuccessModal) {
      router.push('/orders')
    }
  }, [shouldNavigate, showSuccessModal, router])

  return (
    <div className="w-full h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/orders')}
            className="rounded-full border border-gray-300 w-9 h-9 flex items-center justify-center hover:bg-gray-50"
          >
            <BacktIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Map View</h1>
            <p className="text-xs text-gray-500">Visualize selected orders on map</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ButtonLight
            label="Assign"
            Icon={AssignIcon}
            onClick={() => setShowAssignModal(true)}
            disabled={!orderGuidsFromQuery.length || assigning || !effectiveSelectedGuids.length}
          />
        </div>
      </div>

      <div className="px-6 py-3 bg-white border-b border-gray-200 flex flex-wrap gap-4 items-center text-xs font-medium">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#007BFF]"></span> Routine</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FF3B30]"></span> Stat</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#009728]"></span> Stat with fasting</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FFC107]"></span> Fasting</div>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!shapePoints || shapePoints.length < 3}
            className={`px-3 py-1 rounded-full border text-xs ${shapePoints && shapePoints.length >= 3
              ? 'bg-[#dc2626] text-white border-[#dc2626] hover:bg-[#b91c1c]'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
          >
            Undo
          </button>
        </div>
      </div>
      <div className="px-6 pb-2 text-[11px] text-gray-500">
        Drawing mode: click multiple points on the map to create a polygon. Double-click a corner dot to remove it. Click &quot;Undo&quot; to remove the current shape.
      </div>

      <div className="flex-1 relative">
        {loading && <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600">Loading orders...</div>}
        {error && !loading && <div className="absolute inset-0 flex items-center justify-center text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <MapContainer
            {...({
              center,
              zoom: bounds ? undefined : 6,
              style: { width: '100%', height: '100%' },
            } as unknown as React.ComponentProps<typeof MapContainer>)}
          >
            <TileLayer
              {...({
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
              } as unknown as React.ComponentProps<typeof TileLayer>)}
            />
            {bounds && <AutoZoomToBounds bounds={bounds} />}
            <ShapeDrawLayer drawing={isDrawing} onShapeChange={setShapePoints} />
            {shapePoints && shapePoints.length >= 3 && (
              <Polygon
                positions={shapePoints.map((p) => [p[0], p[1]]) as [number, number][]}
                pathOptions={{ color: '#009728', weight: 1, fillOpacity: 0.1 }}
              />
            )}
            {shapePoints && shapePoints.map((p, idx) => (
              <CircleMarker
                key={`vertex-${idx}`}
                center={[p[0], p[1]]}
                {...({ radius: 4 } as any)}
                pathOptions={{ color: '#009728', fillColor: '#ffffff', fillOpacity: 1, weight: 2 }}
                eventHandlers={{
                  dblclick: () => handleRemoveVertex(idx),
                } as any}
              />
            ))}
            {clusters.map((cluster, clusterIdx) => {
              const isSameColor = cluster.colors.length === 1
              const isSelected = cluster.orders.some(m => effectiveSelectedGuids.includes(m.order.order_guid || ''))

              if (isSameColor) {
                // Same color cluster - show single marker with count badge if multiple
                const pinColor = cluster.colors[0]
                const count = cluster.orders.length

                const iconHtml = `
                  <svg xmlns='http://www.w3.org/2000/svg' width='40' height='50' viewBox='0 0 32 40'>
                    <path d='M16 0C9.4 0 4 5.4 4 12c0 8.4 9.1 16.9 11.9 19.3.6.5 1.5.5 2.1 0C18.9 28.9 28 20.4 28 12 28 5.4 22.6 0 16 0z' fill='${pinColor}' />
                    <circle cx='16' cy='13' r='8' fill='white' />
                    ${count > 1 ? `<text x='16' y='18' text-anchor='middle' font-size='12' font-weight='bold' fill='${pinColor}'>${count}</text>` : ''}
                  </svg>
                `

                const icon = L.divIcon({
                  className: isSelected ? 'shadow-lg rounded-full' : '',
                  html: iconHtml,
                  iconSize: [40, 50],
                  iconAnchor: [20, 50],
                  popupAnchor: [0, -50],
                }) as any

                return (
                  <Marker
                    key={`cluster-${clusterIdx}`}
                    {...({
                      position: cluster.position,
                      icon,
                    } as any)}
                  >
                    <Popup {...({ maxHeight: 300 } as any)} className="custom-popup">
                      <div className="max-h-60 overflow-y-auto scrollbar-custom text-xs">
                        {cluster.orders.map(({ order }, orderIdx) => (
                          <div key={orderIdx} className="p-2 border-b last:border-b-0">
                            <p className="font-semibold text-gray-800 mb-1">
                              Order: {order.phlebio_order_id || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              <strong>Patient Name:</strong> {[order.patient?.first_name, order.patient?.middle_name, order.patient?.last_name].filter(Boolean).join(' ') || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              <strong>DOB:</strong> {formatDate(order.patient?.date_of_birth)}
                            </p>
                            <p className="text-gray-600">
                              <strong>Address:</strong> {getAddress(order)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Popup>
                  </Marker>
                )
              } else {
                // Different colors - show overlapping markers with individual color counts
                const colorGroups = cluster.colors.map(color => {
                  const ordersOfColor = cluster.orders.filter(m => m.color === color)
                  return { color, count: ordersOfColor.length, orders: ordersOfColor }
                })

                return (
                  <React.Fragment key={`cluster-${clusterIdx}`}>
                    {colorGroups.map((colorGroup, idx) => {
                      const isPrimary = idx === 0
                      const iconSize = isPrimary ? [40, 50] : [32, 40]
                      const iconAnchor = isPrimary ? [20, 50] : [16, 40]
                      const offset = isPrimary ? [0, 0] : [idx * 0.0002, idx * 0.0002]
                      const position = [cluster.position[0] + offset[0], cluster.position[1] + offset[1]] as [number, number]
                      const circleRadius = isPrimary ? 7 : 6
                      const fontSize = isPrimary ? 12 : 10
                      const textY = isPrimary ? 18 : 17

                      const iconHtml = `
                        <svg xmlns='http://www.w3.org/2000/svg' width='${iconSize[0]}' height='${iconSize[1]}' viewBox='0 0 32 40'>
                          <path d='M16 0C9.4 0 4 5.4 4 12c0 8.4 9.1 16.9 11.9 19.3.6.5 1.5.5 2.1 0C18.9 28.9 28 20.4 28 12 28 5.4 22.6 0 16 0z' fill='${colorGroup.color}' />
                          <circle cx='16' cy='13' r='${circleRadius}' fill='white' />
                          ${colorGroup.count > 1 ? `<text x='16' y='${textY}' text-anchor='middle' font-size='${fontSize}' font-weight='bold' fill='${colorGroup.color}'>${colorGroup.count}</text>` : ''}
                        </svg>
                      `

                      return (
                        <Marker
                          key={`color-${idx}`}
                          {...({
                            position,
                            icon: L.divIcon({
                              className: isSelected ? 'shadow-lg rounded-full' : '',
                              html: iconHtml,
                              iconSize: iconSize as [number, number],
                              iconAnchor: iconAnchor as [number, number],
                              popupAnchor: [0, -iconSize[1] as number],
                            }) as any,
                          } as any)}
                        >
                          <Popup {...({ maxHeight: 300 } as any)} className="custom-popup">
                            <div className="max-h-60 overflow-y-auto scrollbar-custom text-xs">
                              <div className="mb-2 p-2 bg-gray-100 rounded">
                                <span className="font-semibold" style={{ color: colorGroup.color }}>
                                  {colorGroup.count} order(s)
                                </span>
                              </div>
                              {colorGroup.orders.map(({ order }, orderIdx) => (
                                <div key={orderIdx} className="p-2 border-b last:border-b-0">
                                  <p className="font-semibold text-gray-800 mb-1">
                                    Order: {order.phlebio_order_id || 'N/A'}
                                  </p>
                                  <p className="text-gray-600">
                                    <strong>Patient Name:</strong> {[order.patient?.first_name, order.patient?.middle_name, order.patient?.last_name].filter(Boolean).join(' ') || 'N/A'}
                                  </p>
                                  <p className="text-gray-600">
                                    <strong>DOB:</strong> {formatDate(order.patient?.date_of_birth)}
                                  </p>
                                  <p className="text-gray-600">
                                    <strong>Address:</strong> {getAddress(order)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}
                  </React.Fragment>
                )
              }
            })}
            <MapControls />
          </MapContainer>
        )}
      </div>

      <AssignOrderModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onConfirm={handleAssign}
        assigning={assigning}
      />
      <SuccessUpdateModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Orders Assign"
        heading="Orders assigned successfully"
      />
      <Toast
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
    </div>
  )
}

export default AssignMap
