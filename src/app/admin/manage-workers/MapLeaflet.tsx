'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in bundled environments
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapLeafletProps {
  latitude: number;
  longitude: number;
  name?: string;
}

export default function MapLeaflet({ latitude, longitude, name }: MapLeafletProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([latitude, longitude], 14);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Orange marker
    const orangeIcon = L.divIcon({
      html: `<div style="width:24px;height:24px;background:#f97316;border-radius:50%;border:3px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(249,115,22,0.5);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    });

    L.marker([latitude, longitude], { icon: orangeIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family:sans-serif;font-size:13px;font-weight:600;color:#333;">${name || 'Worker Location'}</div>`);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [latitude, longitude, name]);

  return <div ref={mapRef} className="w-full h-full" />;
}
