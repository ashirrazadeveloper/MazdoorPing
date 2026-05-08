'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Navigation, Loader2, MapPin, Search, Crosshair, AlertCircle, Briefcase, Expand } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { NearbyJobCard } from '@/components/shared/NearbyJobCard';
import type { Job } from '@/types';

// Dynamic import for the map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/shared/MapComponent'), { ssr: false });

interface NearbyJobWithDistance extends Job {
  distance: number;
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(((lat1) * Math.PI) / 180) * Math.cos(((lat2) * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mock jobs data for fallback
const MOCK_JOBS: NearbyJobWithDistance[] = [
  {
    id: 'mock-1',
    employer_id: 'e1',
    category_id: 'c1',
    title: 'Electrician Needed for House Wiring',
    description: 'Need an experienced electrician for complete house wiring in a newly constructed house.',
    budget_min: 15000,
    budget_max: 25000,
    budget_type: 'fixed',
    city: 'Lahore',
    province: 'Punjab',
    address: 'DHA Phase 5, Lahore',
    status: 'open',
    urgency: 'high',
    start_date: '2025-01-20',
    duration_days: 7,
    workers_needed: 1,
    requirements: ['Experienced', 'CNIC Verified'],
    is_featured: false,
    views_count: 45,
    bids_count: 3,
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    employer: { id: 'e1', user_id: 'u1', profile_id: 'p1', company_name: 'BuildRight Construction', company_type: 'Construction', business_address: 'DHA, Lahore', city: 'Lahore', province: 'Punjab', phone_office: '0321-1234567', bio: '', total_posted_jobs: 15, total_spent: 250000, rating: 4.5, total_reviews: 12, status: 'active', created_at: '', updated_at: '' },
    category: { id: 'c1', name: 'Electrician', name_ur: 'بجڑا ساز', icon: 'zap', description: '', is_active: true, created_at: '' },
    distance: 1.2,
  },
  {
    id: 'mock-2',
    employer_id: 'e2',
    category_id: 'c2',
    title: 'Plumber for Bathroom Renovation',
    description: 'Bathroom renovation requires skilled plumber for piping and fixture installation.',
    budget_min: 8000,
    budget_max: 12000,
    budget_type: 'fixed',
    city: 'Lahore',
    province: 'Punjab',
    address: 'Gulberg III, Lahore',
    status: 'open',
    urgency: 'medium',
    start_date: '2025-01-22',
    duration_days: 5,
    workers_needed: 1,
    requirements: ['License', 'Tools'],
    is_featured: false,
    views_count: 30,
    bids_count: 5,
    created_at: '2025-01-09T08:00:00Z',
    updated_at: '2025-01-09T08:00:00Z',
    employer: { id: 'e2', user_id: 'u2', profile_id: 'p2', company_name: 'HomeFix Solutions', company_type: 'Renovation', business_address: 'Gulberg, Lahore', city: 'Lahore', province: 'Punjab', phone_office: '0333-9876543', bio: '', total_posted_jobs: 8, total_spent: 120000, rating: 4.2, total_reviews: 6, status: 'active', created_at: '', updated_at: '' },
    category: { id: 'c2', name: 'Plumber', name_ur: 'پلمبر', icon: 'droplets', description: '', is_active: true, created_at: '' },
    distance: 2.8,
  },
  {
    id: 'mock-3',
    employer_id: 'e3',
    category_id: 'c3',
    title: 'Painter Needed for Office Building',
    description: 'Looking for an experienced painter for a 3-story office building exterior.',
    budget_min: 25000,
    budget_max: 40000,
    budget_type: 'fixed',
    city: 'Lahore',
    province: 'Punjab',
    address: 'Johar Town, Lahore',
    status: 'open',
    urgency: 'low',
    start_date: '2025-02-01',
    duration_days: 14,
    workers_needed: 2,
    requirements: ['Experienced', 'Own Equipment'],
    is_featured: true,
    views_count: 60,
    bids_count: 2,
    created_at: '2025-01-08T12:00:00Z',
    updated_at: '2025-01-08T12:00:00Z',
    employer: { id: 'e3', user_id: 'u3', profile_id: 'p3', company_name: 'PaintPro Services', company_type: 'Services', business_address: 'Johar Town, Lahore', city: 'Lahore', province: 'Punjab', phone_office: '0345-1112233', bio: '', total_posted_jobs: 22, total_spent: 380000, rating: 4.7, total_reviews: 18, status: 'active', created_at: '', updated_at: '' },
    category: { id: 'c3', name: 'Painter', name_ur: 'پینٹر', icon: 'paintbrush', description: '', is_active: true, created_at: '' },
    distance: 4.5,
  },
  {
    id: 'mock-4',
    employer_id: 'e4',
    category_id: 'c4',
    title: 'AC Repair Technician Required',
    description: 'Need AC repair technician for split AC unit not cooling properly.',
    budget_min: 3000,
    budget_max: 5000,
    budget_type: 'fixed',
    city: 'Lahore',
    province: 'Punjab',
    address: 'Model Town, Lahore',
    status: 'open',
    urgency: 'urgent',
    start_date: '2025-01-15',
    duration_days: 1,
    workers_needed: 1,
    requirements: ['Immediate'],
    is_featured: false,
    views_count: 20,
    bids_count: 8,
    created_at: '2025-01-11T06:00:00Z',
    updated_at: '2025-01-11T06:00:00Z',
    employer: { id: 'e4', user_id: 'u4', profile_id: 'p4', company_name: 'CoolAir Services', company_type: 'Services', business_address: 'Model Town, Lahore', city: 'Lahore', province: 'Punjab', phone_office: '0312-5556677', bio: '', total_posted_jobs: 10, total_spent: 80000, rating: 4.0, total_reviews: 4, status: 'active', created_at: '', updated_at: '' },
    category: { id: 'c4', name: 'AC Technician', name_ur: 'ایسی ٹیکنیشن', icon: 'wind', description: '', is_active: true, created_at: '' },
    distance: 6.1,
  },
  {
    id: 'mock-5',
    employer_id: 'e5',
    category_id: 'c5',
    title: 'Carpenter for Furniture Work',
    description: 'Custom furniture work including wardrobe and bookshelf installation.',
    budget_min: 10000,
    budget_max: 18000,
    budget_type: 'fixed',
    city: 'Lahore',
    province: 'Punjab',
    address: 'Bahria Town, Lahore',
    status: 'open',
    urgency: 'medium',
    start_date: '2025-01-25',
    duration_days: 10,
    workers_needed: 1,
    requirements: ['Own Tools', '5+ Years Experience'],
    is_featured: false,
    views_count: 35,
    bids_count: 4,
    created_at: '2025-01-07T14:00:00Z',
    updated_at: '2025-01-07T14:00:00Z',
    employer: { id: 'e5', user_id: 'u5', profile_id: 'p5', company_name: 'WoodCraft Studio', company_type: 'Furniture', business_address: 'Bahria Town, Lahore', city: 'Lahore', province: 'Punjab', phone_office: '0300-9998877', bio: '', total_posted_jobs: 5, total_spent: 65000, rating: 4.8, total_reviews: 3, status: 'active', created_at: '', updated_at: '' },
    category: { id: 'c5', name: 'Carpenter', name_ur: 'تارخان', icon: 'hammer', description: '', is_active: true, created_at: '' },
    distance: 8.3,
  },
];

export default function NearbyJobsPage() {
  const { t } = useLanguageStore();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'granted' | 'denied' | 'error'>('detecting');
  const [nearbyJobs, setNearbyJobs] = useState<NearbyJobWithDistance[]>([]);
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [filteredJobs, setFilteredJobs] = useState<NearbyJobWithDistance[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<{ lat: number; lng: number; label?: string; color?: string }[]>([]);

  const radiusOptions = [5, 10, 25, 50];

  // Detect geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setNearbyJobs(MOCK_JOBS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('granted');
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('denied');
            break;
          default:
            setLocationStatus('error');
        }
        // Use mock data with simulated location (Lahore)
        setNearbyJobs(MOCK_JOBS);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Filter jobs by radius and update markers
  useEffect(() => {
    const filtered = nearbyJobs.filter((job) => job.distance <= selectedRadius);
    filtered.sort((a, b) => a.distance - b.distance);
    setFilteredJobs(filtered);

    // Build map markers
    const markers: { lat: number; lng: number; label?: string; color?: string }[] = [];
    if (userLocation) {
      markers.push({ lat: userLocation.lat, lng: userLocation.lng, label: t('nearbyJobs.title'), color: '#3b82f6' });
    }
    filtered.forEach((job) => {
      // Use approximate coordinates from Lahore area for mock jobs
      const baseLat = userLocation?.lat ?? 31.5204;
      const baseLng = userLocation?.lng ?? 74.3587;
      const angle = (job.distance / 111) * (job.id.charCodeAt(job.id.length - 1) * 37 % 360) * (Math.PI / 180);
      const jobLat = baseLat + (job.distance * Math.cos(angle)) / 111;
      const jobLng = baseLng + (job.distance * Math.sin(angle)) / (111 * Math.cos(baseLat * Math.PI / 180));
      markers.push({
        lat: jobLat,
        lng: jobLng,
        label: `${job.title} - ${job.distance < 1 ? `${Math.round(job.distance * 1000)}m` : `${job.distance.toFixed(1)} km`}`,
        color: '#10b981',
      });
    });
    setMapMarkers(markers);
  }, [nearbyJobs, selectedRadius, userLocation, t]);

  const handleEnableLocation = useCallback(() => {
    setLocationStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationStatus('granted');
        },
        () => setLocationStatus('denied'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  }, []);

  const handleRetry = useCallback(() => {
    setNearbyJobs([]);
    setLocationStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationStatus('granted');
        },
        () => {
          setLocationStatus('error');
          setNearbyJobs(MOCK_JOBS);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Detecting location state
  if (locationStatus === 'detecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
            <Crosshair className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-emerald-500/20 animate-pulse-ring" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{t('nearbyJobs.detectingLocation')}</h2>
        <p className="text-white/40 text-sm">GPS...</p>
      </div>
    );
  }

  // Location denied state
  if (locationStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-4">
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{t('nearbyJobs.locationDenied')}</h2>
        <p className="text-white/40 text-sm text-center max-w-md mb-6">
          {t('nearbyJobs.locationDeniedDesc')}
        </p>
        <button onClick={handleRetry} className="px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-medium">
          <Crosshair className="w-4 h-4 inline mr-2" />
          {t('nearbyJobs.enableLocation')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('nearbyJobs.title')}</h1>
        <p className="text-white/50 mt-1">{t('nearbyJobs.subtitle')}</p>
      </div>

      {/* Radius Filter */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-white/60 font-medium">{t('nearbyJobs.radiusFilter')}:</span>
        {radiusOptions.map((radius) => (
          <button
            key={radius}
            onClick={() => setSelectedRadius(radius)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedRadius === radius
                ? 'bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            {radius} km
          </button>
        ))}
        {userLocation && (
          <p className="text-xs text-white/40 ml-auto">
            {t('nearbyJobs.employersNearby')}
          </p>
        )}
      </div>

      {/* Map */}
      <div className="glass-card p-3 overflow-hidden">
        <div className="rounded-xl overflow-hidden">
          <MapComponent
            latitude={userLocation?.lat ?? 31.5204}
            longitude={userLocation?.lng ?? 74.3587}
            markers={mapMarkers}
            height="350px"
            zoom={userLocation ? 12 : 10}
          />
        </div>
        {userLocation && (
          <p className="text-xs text-white/30 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Blue dot = Your Location &bull;
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Emerald pin = Job Location
          </p>
        )}
      </div>

      {/* Jobs count */}
      {filteredJobs.length > 0 && (
        <p className="text-sm text-white/40">
          {filteredJobs.length} {t('common.jobs').toLowerCase()} {selectedRadius} km {t('cards.within').toLowerCase()}
        </p>
      )}

      {/* Expand Search */}
      {filteredJobs.length === 0 && nearbyJobs.length > 0 && (
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center animate-scale-in">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <Briefcase className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('nearbyJobs.noJobsFound')}</h3>
          <p className="text-white/40 text-sm max-w-md mb-4">{t('nearbyJobs.noJobsFoundDesc')}</p>
          <button
            onClick={() => setSelectedRadius((prev) => Math.min(prev + 10, 100))}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all"
          >
            <Expand className="w-4 h-4" />
            {t('nearbyJobs.expandSearch')}
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {locationStatus === 'granted' && nearbyJobs.length === 0 && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {nearbyJobs.length === 0 && locationStatus !== 'granted' && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-scale-in">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <MapPin className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('nearbyJobs.noJobsFound')}</h3>
          <p className="text-white/40 text-sm max-w-md">{t('nearbyJobs.noJobsFoundDesc')}</p>
        </div>
      )}

      {/* Job list */}
      {filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <div key={job.id} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
              <NearbyJobCard job={job} distance={job.distance} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
