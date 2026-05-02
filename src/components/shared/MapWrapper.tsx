'use client';

import dynamic from 'next/dynamic';
import type { MapMarker } from './MapComponent';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 flex items-center justify-center animate-pulse">
      <div className="text-center p-6">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/30 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-white/30">Loading map...</p>
      </div>
    </div>
  ),
});

export interface MapWrapperProps {
  latitude?: number;
  longitude?: number;
  markers?: MapMarker[];
  height?: string;
  zoom?: number;
  clickable?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function MapWrapper({
  latitude,
  longitude,
  markers,
  height,
  zoom,
  clickable,
  onLocationSelect,
}: MapWrapperProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-1 backdrop-blur-sm overflow-hidden">
      <MapComponent
        latitude={latitude}
        longitude={longitude}
        markers={markers}
        height={height}
        zoom={zoom}
        clickable={clickable}
        onLocationSelect={onLocationSelect}
      />
    </div>
  );
}
