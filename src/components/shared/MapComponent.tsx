'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

interface MapComponentProps {
  latitude?: number;
  longitude?: number;
  markers?: MapMarker[];
  height?: string;
  zoom?: number;
  clickable?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

// Fix Leaflet default marker icon issue with bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function createColoredIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
    <path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0zm0 17c-2.5 0-4.5-2-4.5-4.5S10 8 12.5 8 17 10 17 12.5 15 17 12.5 17z"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'custom-marker',
  });
}

function createSvgMarker(color: string) {
  return createColoredIcon(color);
}

export default function MapComponent({
  latitude = 30.3753,
  longitude = 69.3451,
  markers = [],
  height = '300px',
  zoom = 12,
  clickable = false,
  onLocationSelect,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [latitude, longitude],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // CartoDB dark matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    // Add markers
    if (markers.length > 0) {
      markers.forEach((m) => {
        const icon = m.color ? createSvgMarker(m.color) : DefaultIcon;
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        if (m.label) {
          marker.bindPopup(
            `<div style="color: #333; font-family: system-ui; font-size: 13px; padding: 2px 4px;">
              <strong>${m.label}</strong>
              <br/>
              <span style="font-size: 11px; color: #666;">${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}</span>
            </div>`
          );
        }
        markersLayerRef.current!.addLayer(marker);
      });
      // Fit bounds to show all markers
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      // Add a single marker at center
      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(
        `<div style="color: #333; font-family: system-ui; font-size: 13px;">
          ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
        </div>`
      );
      markersLayerRef.current!.addLayer(marker);
    }

    // Click handler for location picking
    if (clickable) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Remove previous click marker
        if (clickMarkerRef.current) {
          markersLayerRef.current!.removeLayer(clickMarkerRef.current);
        }

        // Add new marker
        const icon = createSvgMarker('#22c55e');
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(
          `<div style="color: #333; font-family: system-ui; font-size: 13px;">
            <strong>Selected Location</strong><br/>
            ${lat.toFixed(4)}, ${lng.toFixed(4)}
          </div>`
        ).openPopup();
        markersLayerRef.current!.addLayer(marker);
        clickMarkerRef.current = marker;

        onLocationSelect?.(lat, lng);
      });
    }

    mapInstanceRef.current = map;

    // Fix tile rendering issues
    setTimeout(() => map.invalidateSize(), 100);
  }, [latitude, longitude, markers, zoom, clickable, onLocationSelect]);

  useEffect(() => {
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        clickMarkerRef.current = null;
      }
    };
  }, [initMap]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full rounded-2xl overflow-hidden"
        style={{ height, minHeight: '200px' }}
      />
      {clickable && (
        <p className="text-xs text-white/30 mt-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Click on the map to select a location
        </p>
      )}
    </div>
  );
}
