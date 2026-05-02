'use client';

import { useState, useCallback, useRef } from 'react';
import { MapPin, Crosshair, Search, Loader2 } from 'lucide-react';
import MapWrapper from './MapWrapper';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchReverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.display_name) {
        setSearchText(data.display_name);
      }
    } catch {
      // Silently fail - location still works
    }
  }, []);

  const handleMapClick = useCallback(
    (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      onLocationSelect(newLat, newLng);
      // Reverse geocode to get name
      fetchReverseGeocode(newLat, newLng);
    },
    [onLocationSelect, fetchReverseGeocode]
  );

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Pakistan')}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSearchResults(data);
      setShowResults(data.length > 0);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 600);
  };

  const selectSearchResult = (result: SearchResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    setLat(newLat);
    setLng(newLng);
    setSearchText(result.display_name);
    setShowResults(false);
    onLocationSelect(newLat, newLng);
  };

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
        fetchReverseGeocode(latitude, longitude);
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
  }, [onLocationSelect, fetchReverseGeocode]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Box with Results */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for a city or area in Pakistan..."
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30"
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {searching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
          )}
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-white/10 max-h-48 overflow-y-auto z-50 custom-scrollbar">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => selectSearchResult(result)}
                  className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    <span className="line-clamp-1">{result.display_name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
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
              Lat: <span className="text-white/70 font-mono">{lat.toFixed(4)}</span>
            </span>
            <span className="text-white/40">
              Lng: <span className="text-white/70 font-mono">{lng.toFixed(4)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
