'use client';

import { useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { getInitials, formatCurrency } from '@/lib/utils';
import {
  Mail,
  Phone,
  MapPin,
  Star,
  Edit3,
  Save,
  X,
  Camera,
  Briefcase,
  Building2,
  Loader2,
  User,
} from 'lucide-react';
import Image from 'next/image';

interface FormData {
  fullName: string;
  phone: string;
  bio: string;
  companyName: string;
  companyType: string;
  businessAddress: string;
  city: string;
  province: string;
  phoneOffice: string;
}

function buildFormData(
  profile: { full_name?: string | null; phone?: string | null } | null,
  employer: {
    bio?: string | null; company_name?: string | null; company_type?: string | null;
    business_address?: string | null; city?: string | null; province?: string | null;
    phone_office?: string | null;
  } | null
): FormData {
  return {
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: employer?.bio || '',
    companyName: employer?.company_name || '',
    companyType: employer?.company_type || '',
    businessAddress: employer?.business_address || '',
    city: employer?.city || '',
    province: employer?.province || '',
    phoneOffice: employer?.phone_office || '',
  };
}

export default function EmployerProfilePage() {
  const { employerProfile, profile, fetchProfiles } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editFormData, setEditFormData] = useState<FormData | null>(null);

  const derivedFormData = useMemo(() => buildFormData(profile, employerProfile), [profile, employerProfile]);
  const formData = editFormData ?? derivedFormData;

  const handleStartEdit = () => {
    setEditFormData(derivedFormData);
    setEditMode(true);
    setSaveMessage(null);
  };

  const handleCancelEdit = () => {
    setEditFormData(null);
    setEditMode(false);
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (!employerProfile?.user_id || !profile?.id || !editFormData) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.fullName.trim(),
          phone: editFormData.phone.trim(),
        })
        .eq('id', profile.id);

      if (profileError) {
        setSaveMessage({ type: 'error', text: profileError.message });
        setSaving(false);
        return;
      }

      const { error: employerError } = await supabase
        .from('employers')
        .update({
          bio: editFormData.bio.trim(),
          company_name: editFormData.companyName.trim(),
          company_type: editFormData.companyType.trim(),
          business_address: editFormData.businessAddress.trim(),
          city: editFormData.city.trim(),
          province: editFormData.province.trim(),
          phone_office: editFormData.phoneOffice.trim(),
        })
        .eq('user_id', employerProfile.user_id);

      if (employerError) {
        setSaveMessage({ type: 'error', text: employerError.message });
        setSaving(false);
        return;
      }

      await fetchProfiles();
      setEditFormData(null);
      setEditMode(false);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!employerProfile || !profile) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <User className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/40">Employer profile not found</p>
            <p className="text-white/20 text-sm mt-1">Please complete your registration</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Profile</h1>
          <p className="text-white/50 mt-1">Manage your employer profile and company details</p>
        </div>
        {!editMode ? (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20 transition-all text-sm font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-xl border ${
          saveMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <p className="text-sm">{saveMessage.text}</p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="glass-card p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-600/10 border border-blue-500/20 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              ) : (
                getInitials(profile.full_name || 'E')
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                {editMode ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="glass-input px-3 py-1.5 text-xl text-white"
                  />
                ) : (
                  profile.full_name || 'Employer'
                )}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-white/50">
                <Mail className="w-4 h-4" />
                <span>{profile.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/50">
                <Phone className="w-4 h-4" />
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="glass-input px-3 py-1 text-sm text-white w-36"
                    placeholder="Phone number"
                  />
                ) : (
                  <span>{profile.phone || 'No phone'}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="font-semibold">{employerProfile.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-white/30">({employerProfile.total_reviews || 0} reviews)</span>
              </div>
            </div>

            {/* Bio */}
            <div>
              {editMode ? (
                <div className="space-y-1">
                  <label className="text-xs text-white/40 font-medium">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, bio: e.target.value })}
                    className="glass-input w-full px-4 py-3 text-sm text-white resize-none"
                    rows={3}
                    placeholder="Tell workers about your company and what you do..."
                  />
                </div>
              ) : (
                <p className="text-sm text-white/60 max-w-2xl">
                  {employerProfile.bio || 'No bio yet. Click Edit Profile to add one.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Details Card */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Company Details
          </h3>
          <div className="space-y-4">
            {editMode ? (
              <>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Company Type</label>
                  <input
                    type="text"
                    value={formData.companyType}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, companyType: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white"
                    placeholder="e.g., Construction, IT Services"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Office Phone</label>
                  <input
                    type="tel"
                    value={formData.phoneOffice}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, phoneOffice: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white"
                    placeholder="Office phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Business Address</label>
                  <textarea
                    value={formData.businessAddress}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, businessAddress: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white resize-none"
                    rows={2}
                    placeholder="Full business address"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, city: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Province</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, province: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white"
                    placeholder="Province"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Building2 className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Company Name</p>
                    <p className="text-sm text-white/70">{employerProfile.company_name || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Briefcase className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Company Type</p>
                    <p className="text-sm text-white/70">{employerProfile.company_type || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Phone className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Office Phone</p>
                    <p className="text-sm text-white/70">{employerProfile.phone_office || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <MapPin className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Location</p>
                    <p className="text-sm text-white/70">
                      {[employerProfile.city, employerProfile.province].filter(Boolean).join(', ') || 'Not set'}
                    </p>
                  </div>
                </div>
                {employerProfile.business_address && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <MapPin className="w-4 h-4 text-white/50" />
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Business Address</p>
                      <p className="text-sm text-white/70">{employerProfile.business_address}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-400" />
            Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Briefcase className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/30">Total Jobs Posted</p>
                <p className="text-xl font-bold text-white">{employerProfile.total_posted_jobs || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <span className="text-lg font-bold text-emerald-400">₨</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/30">Total Spent</p>
                <p className="text-xl font-bold text-white">{formatCurrency(employerProfile.total_spent || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/30">Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-white">{employerProfile.rating?.toFixed(1) || '0.0'}</p>
                  <span className="text-sm text-white/40">({employerProfile.total_reviews || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-white/40 mb-3 font-medium">Rating Breakdown</p>
              {[5, 4, 3, 2, 1].map((star) => {
                const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                return (
                  <div key={star} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-white/40 w-3">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/30 w-8 text-right">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
