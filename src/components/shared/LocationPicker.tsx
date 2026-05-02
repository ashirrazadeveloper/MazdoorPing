'use client';

import { useState, useCallback } from 'react';
import { MapPin, Crosshair, Search, Loader2 } from 'lucide-react';
import MapWrapper from './MapWrapper';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  height = '350px',
}: LocationPickerProps) {
  const [lat, setLat] = useState<number | null>(initialLat ?? null);
  const [lng, setLng] = useState<number | null>(initialLng ?? null);
  const [searchText, setSearchText] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const handleMapClick = useCallback(
    (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      onLocationSelect(newLat, newLng);
    },
    [onLocationSelect]
  );

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by this browser.');
      return;
    }

    setDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
        onLocationSelect(latitude, longitude);
        setDetecting(false);
      },
      (error) => {
        setDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setDetectError('Location permission denied. Please allow location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setDetectError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setDetectError('Location request timed out.');
            break;
          default:
            setDetectError('An unknown error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onLocationSelect]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search for a location..."
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Simple placeholder - in production, integrate with a geocoding API
                e.preventDefault();
              }
            }}
          />
        </div>

        {/* Detect My Location Button */}
        <button
          onClick={handleDetectLocation}
          disabled={detecting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-medium disabled:opacity-50 shrink-0"
        >
          {detecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
          {detecting ? 'Detecting...' : 'My Location'}
        </button>
      </div>

      {/* Detect Error */}
      {detectError && (
        <p className="text-xs text-red-400/80 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          {detectError}
        </p>
      )}

      {/* Map */}
      <MapWrapper
        latitude={lat ?? 30.3753}
        longitude={lng ?? 69.3451}
        height={height}
        zoom={lat ? 15 : 5}
        clickable
        onLocationSelect={handleMapClick}
      />

      {/* Coordinates Display */}
      {lat !== null && lng !== null && (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="text-white/40">
              Latitude: <span className="text-white/70 font-mono">{lat.toFixed(6)}</span>
            </span>
            <span className="text-white/40">
              Longitude: <span className="text-white/70 font-mono">{lng.toFixed(6)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
