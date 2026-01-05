"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import type { LatLngBounds } from 'leaflet';
import LegendBox from './LegendBox';

interface Order {
  order_guid?: string;
  urgency?: string | null;
  fasting?: boolean;
  status?: string | null;
  patient_address?: {
    latitude?: number | null;
    longitude?: number | null;
    address_line1?: string | null;
    city?: string | null;
    state?: string | null;
    zipcode?: string | null;
  } | null;
  patient?: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    date_of_birth?: string | null;
  } | null;
  phlebio_order_id?: string;
  service_address?: string | null;
}

interface TechMapProps {
  orders?: Order[];
  loading?: boolean;
}

// Component to handle auto-zoom to bounds
const AutoZoomToBounds: React.FC<{ bounds: [[number, number], [number, number]] | null }> = ({ bounds }) => {
  const map = useMap();
  const hasZoomedRef = useRef(false);

  useEffect(() => {
    if (bounds && !hasZoomedRef.current) {
      // Add padding to bounds
      const padding = 0.1; // 10% padding for better view
      const latDiff = bounds[1][0] - bounds[0][0];
      const lngDiff = bounds[1][1] - bounds[0][1];

      // Handle case where all points are at same location
      const effectiveLatDiff = latDiff > 0 ? latDiff : 0.01;
      const effectiveLngDiff = lngDiff > 0 ? lngDiff : 0.01;

      const paddedBounds: LatLngBounds = L.latLngBounds(
        [bounds[0][0] - effectiveLatDiff * padding, bounds[0][1] - effectiveLngDiff * padding],
        [bounds[1][0] + effectiveLatDiff * padding, bounds[1][1] + effectiveLngDiff * padding]
      );

      map.fitBounds(paddedBounds, { padding: [50, 50], maxZoom: 15 });
      hasZoomedRef.current = true;
    }
  }, [bounds, map]);

  // Reset zoom flag when bounds change significantly (new orders loaded)
  useEffect(() => {
    hasZoomedRef.current = false;
  }, [bounds?.[0]?.[0], bounds?.[1]?.[0]]); // Reset when bounds change

  return null;
};

const MapControls: React.FC = () => {
  const map = useMap();

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={zoomIn}
        className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 text-xl font-semibold"
      >
        +
      </button>
      <button
        type="button"
        onClick={zoomOut}
        className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 text-xl font-semibold"
      >
        −
      </button>
    </div>
  );
};

const TechMap: React.FC<TechMapProps> = ({ orders = [], loading = false }) => {
  // Extract markers with color logic
  const markers = useMemo(() => {
    return orders
      .map((o) => {
        const lat = o.patient_address?.latitude;
        const lng = o.patient_address?.longitude;
        if (lat == null || lng == null) return null;

        const urgency = (o.urgency || '').toUpperCase();
        const fasting = !!o.fasting;

        let color = '#007BFF'; // Default: Routine (Blue)
        if (urgency === 'STAT' && fasting) color = '#009728'; // STAT + Fasting (Green)
        else if (urgency === 'STAT') color = '#FF3B30'; // STAT (Red)
        else if (fasting) color = '#FFC107'; // Fasting only (Yellow)

        return {
          order: o,
          position: [lat, lng] as [number, number],
          color,
        };
      })
      .filter(Boolean) as { order: Order; position: [number, number]; color: string }[];
  }, [orders]);

  // Calculate center point
  const center = useMemo(() => {
    if (!markers.length) return [17.385044, 78.486671] as [number, number]; // Default: Hyderabad
    const lat = markers.reduce((sum, m) => sum + m.position[0], 0) / markers.length;
    const lng = markers.reduce((sum, m) => sum + m.position[1], 0) / markers.length;
    return [lat, lng] as [number, number];
  }, [markers]);

  // Calculate bounds for auto-zoom
  const bounds = useMemo(() => {
    if (!markers.length) return null;
    const lats = markers.map((m) => m.position[0]);
    const lngs = markers.map((m) => m.position[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return [[minLat, minLng], [maxLat, maxLng]] as [[number, number], [number, number]];
  }, [markers]);

  // Clustering logic: group markers by location and color
  interface ClusterGroup {
    position: [number, number]
    orders: Array<{ order: Order; color: string }>
    colors: string[]
  }

  const clusters = useMemo(() => {
    const tolerance = 0.0001 // Approximately 11 meters

    return markers.reduce((acc, marker) => {
      // Find existing cluster at same location
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
        order.patient_address.state,
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

  return (
    <div className="bg-white rounded-2xl relative h-full  z-[9]">
      <LegendBox />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600 z-[1000] bg-white/80 rounded-2xl">
          Loading orders...
        </div>
      )}

      {!loading && markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 z-[1000]">
          No orders with valid coordinates to display
        </div>
      )}

      <MapContainer
        {...({
          center,
          zoom: bounds ? undefined : 12,
          style: { width: '100%', height: '100%', borderRadius: '1rem' },
          zoomControl: false,
        } as unknown as React.ComponentProps<typeof MapContainer>)}
      >
        <TileLayer
          {...({
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          } as unknown as React.ComponentProps<typeof TileLayer>)}
        />
        {bounds && <AutoZoomToBounds bounds={bounds} />}

        {clusters.map((cluster, clusterIdx) => {
          const isSameColor = cluster.colors.length === 1
          const count = cluster.orders.length

          if (isSameColor) {
            // Same color cluster - show single marker with count badge if multiple
            const pinColor = cluster.colors[0]

            const iconHtml = count > 1
              ? `
                <svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'>
                  <path d='M16 0C9.4 0 4 5.4 4 12c0 8.4 9.1 16.9 11.9 19.3.6.5 1.5.5 2.1 0C18.9 28.9 28 20.4 28 12 28 5.4 22.6 0 16 0z' fill='${pinColor}' />
                  <circle cx='16' cy='13' r='6' fill='white' />
                  <text x='16' y='17' text-anchor='middle' font-size='10' font-weight='bold' fill='${pinColor}'>${count}</text>
                </svg>
              `
              : `
                <svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'>
                  <path d='M16 0C9.4 0 4 5.4 4 12c0 8.4 9.1 16.9 11.9 19.3.6.5 1.5.5 2.1 0C18.9 28.9 28 20.4 28 12 28 5.4 22.6 0 16 0z' fill='${pinColor}' />
                  <circle cx='16' cy='13' r='6' fill='white' />
                </svg>
              `

            const icon = L.divIcon({
              className: '',
              html: iconHtml,
              iconSize: [32, 40],
              iconAnchor: [16, 40],
              popupAnchor: [0, -40],
            })

            return (
              <Marker
                key={`cluster-${clusterIdx}`}
                {...({
                  position: cluster.position,
                  icon,
                } as any)}
              >
                <Popup {...({ maxHeight: 300 } as any)} className="custom-popup">
                  <div className="max-h-60 overflow-y-auto text-xs">
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
            // Different colors - show overlapping markers (big + small)
            const primaryColor = cluster.colors[0]
            const secondaryColor = cluster.colors[1]

            return (
              <React.Fragment key={`cluster-${clusterIdx}`}>
                {/* Primary (big) marker */}
                <Marker
                  {...({
                    position: cluster.position,
                    icon: L.divIcon({
                      className: '',
                      html: `
                        <svg xmlns='http://www.w3.org/2000/svg' width='32' height='40' viewBox='0 0 32 40'>
                          <path d='M16 0C9.4 0 4 5.4 4 12c0 8.4 9.1 16.9 11.9 19.3.6.5 1.5.5 2.1 0C18.9 28.9 28 20.4 28 12 28 5.4 22.6 0 16 0z' fill='${primaryColor}' />
                          <circle cx='16' cy='13' r='6' fill='white' />
                        </svg>
                      `,
                      iconSize: [32, 40],
                      iconAnchor: [16, 40],
                      popupAnchor: [0, -40],
                    }),
                  } as any)}
                >
                  <Popup {...({ maxHeight: 300 } as any)} className="custom-popup">
                    <div className="max-h-60 overflow-y-auto text-xs">
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
                {/* Secondary (small) marker - offset slightly */}
                <Marker
                  {...({
                    position: [cluster.position[0] + 0.0002, cluster.position[1] + 0.0002] as [number, number],
                    icon: L.divIcon({
                      className: '',
                      html: `
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='30' viewBox='0 0 32 40'>
                          <path d='M16 0C9.4 0 4 5.4 4 12c0 8.4 9.1 16.9 11.9 19.3.6.5 1.5.5 2.1 0C18.9 28.9 28 20.4 28 12 28 5.4 22.6 0 16 0z' fill='${secondaryColor}' />
                          <circle cx='16' cy='13' r='6' fill='white' />
                        </svg>
                      `,
                      iconSize: [24, 30],
                      iconAnchor: [12, 30],
                    }),
                  } as any)}
                />
              </React.Fragment>
            )
          }
        })}

        <MapControls />
      </MapContainer>
    </div>
  );
};

export default TechMap;
