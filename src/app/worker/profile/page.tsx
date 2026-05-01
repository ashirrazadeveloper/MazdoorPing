'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';
import {
  Mail,
  Phone,
  MapPin,
  Star,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Plus,
  Trash2,
  Briefcase,
  Calendar,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import type { Category } from '@/types';

interface FormData {
  fullName: string;
  phone: string;
  bio: string;
  city: string;
  province: string;
  address: string;
  hourlyRate: string;
  gender: string;
  dateOfBirth: string;
}

function buildFormData(profile: { full_name?: string | null; phone?: string | null } | null, worker: {
  bio?: string | null; city?: string | null; province?: string | null; address?: string | null;
  hourly_rate?: number | null; gender?: string | null; date_of_birth?: string | null;
} | null): FormData {
  return {
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    bio: worker?.bio || '',
    city: worker?.city || '',
    province: worker?.province || '',
    address: worker?.address || '',
    hourlyRate: worker?.hourly_rate?.toString() || '',
    gender: worker?.gender || '',
    dateOfBirth: worker?.date_of_birth ? worker.date_of_birth.split('T')[0] : '',
  };
}

export default function ProfilePage() {
  const { workerProfile, profile, fetchProfiles } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillExperience, setNewSkillExperience] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);
  // Edit form state: null means not editing, FormData means editing
  const [editFormData, setEditFormData] = useState<FormData | null>(null);

  // Always-derived display data from profile/worker
  const derivedFormData = useMemo(() => buildFormData(profile, workerProfile), [profile, workerProfile]);

  // Form values: edit state when editing, derived values when not
  const formData = editFormData ?? derivedFormData;

  // Fetch categories on mount
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (data) setCategories(data);
    })();
  }, []);

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
    if (!workerProfile?.user_id || !profile?.id || !editFormData) return;
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

      const { error: workerError } = await supabase
        .from('workers')
        .update({
          bio: editFormData.bio.trim(),
          city: editFormData.city.trim(),
          province: editFormData.province.trim(),
          address: editFormData.address.trim(),
          hourly_rate: parseFloat(editFormData.hourlyRate) || 0,
          gender: editFormData.gender || null,
          date_of_birth: editFormData.dateOfBirth || null,
        })
        .eq('user_id', workerProfile.user_id);

      if (workerError) {
        setSaveMessage({ type: 'error', text: workerError.message });
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

  const handleAddSkill = async () => {
    if (!workerProfile?.id || !newSkillCategory || !newSkillExperience) return;
    setAddingSkill(true);

    try {
      const { error } = await supabase.from('worker_skills').insert({
        worker_id: workerProfile.id,
        category_id: newSkillCategory,
        experience_years: parseFloat(newSkillExperience),
        is_primary: (workerProfile.skills?.length || 0) === 0,
      });

      if (error) {
        console.error('Error adding skill:', error);
        return;
      }

      await fetchProfiles();
      setShowAddSkill(false);
      setNewSkillCategory('');
      setNewSkillExperience('');
    } catch (err) {
      console.error('Failed to add skill:', err);
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!workerProfile?.id) return;

    try {
      const { error } = await supabase
        .from('worker_skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        console.error('Error removing skill:', error);
        return;
      }

      await fetchProfiles();
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const statusBadgeClass =
    workerProfile?.status === 'active'
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      : workerProfile?.status === 'pending'
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        : 'bg-red-500/20 text-red-400 border-red-500/30';

  const skills = workerProfile?.skills || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Profile</h1>
          <p className="text-white/50 mt-1">Manage your worker profile and skills</p>
        </div>
        {!editMode ? (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-medium"
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-medium disabled:opacity-50"
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              ) : (
                getInitials(profile?.full_name || 'Worker')
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
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
                  profile?.full_name || 'Worker'
                )}
              </h2>
              <span className={`badge ${statusBadgeClass}`}>
                {(workerProfile?.status ?? '').charAt(0).toUpperCase() + (workerProfile?.status ?? '').slice(1)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-white/50">
                <Mail className="w-4 h-4" />
                <span>{profile?.email || 'No email'}</span>
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
                  <span>{profile?.phone || 'No phone'}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span className="font-semibold">{workerProfile?.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-white/30">({workerProfile?.total_reviews || 0} reviews)</span>
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
                    placeholder="Tell employers about yourself and your experience..."
                  />
                </div>
              ) : (
                <p className="text-sm text-white/60 max-w-2xl">
                  {workerProfile?.bio || 'No bio yet. Click Edit Profile to add one.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Details Card */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
          <div className="space-y-4">
            {editMode ? (
              <>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => editFormData && setEditFormData({ ...editFormData, city: e.target.value })}
                      className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white"
                      placeholder="Your city"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Province</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, province: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white"
                    placeholder="Your province"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, address: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white resize-none"
                    rows={2}
                    placeholder="Your full address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5 font-medium">Hourly Rate (PKR)</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => editFormData && setEditFormData({ ...editFormData, hourlyRate: e.target.value })}
                      className="glass-input w-full px-4 py-2.5 text-sm text-white"
                      placeholder="e.g. 500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5 font-medium">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => editFormData && setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="glass-input w-full px-4 py-2.5 text-sm text-white appearance-none"
                    >
                      <option value="" className="bg-gray-900">Select</option>
                      <option value="male" className="bg-gray-900">Male</option>
                      <option value="female" className="bg-gray-900">Female</option>
                      <option value="other" className="bg-gray-900">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                    className="glass-input w-full px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <MapPin className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Location</p>
                    <p className="text-sm text-white/70">
                      {[workerProfile?.city, workerProfile?.province].filter(Boolean).join(', ') || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Briefcase className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Hourly Rate</p>
                    <p className="text-sm text-white/70">
                      {workerProfile?.hourly_rate ? `PKR ${workerProfile.hourly_rate.toLocaleString()}` : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Calendar className="w-4 h-4 text-white/50" />
                  </div>
                  <div>
                    <p className="text-xs text-white/30">Completed Jobs</p>
                    <p className="text-sm text-white/70">{workerProfile?.completed_jobs || 0}</p>
                  </div>
                </div>
                {workerProfile?.address && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <MapPin className="w-4 h-4 text-white/50" />
                    </div>
                    <div>
                      <p className="text-xs text-white/30">Address</p>
                      <p className="text-sm text-white/70">{workerProfile.address}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Skills Card */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Skills</h3>
            {!showAddSkill && (
              <button
                onClick={() => setShowAddSkill(true)}
                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            )}
          </div>

          {showAddSkill && (
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 mb-4 space-y-3 animate-fade-in">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-sm text-white appearance-none"
                >
                  <option value="" className="bg-gray-900">Select a skill</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">Experience (years)</label>
                <input
                  type="number"
                  value={newSkillExperience}
                  onChange={(e) => setNewSkillExperience(e.target.value)}
                  className="glass-input w-full px-4 py-2.5 text-sm text-white"
                  placeholder="e.g. 3"
                  min="0"
                  max="50"
                  step="0.5"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddSkill(false);
                    setNewSkillCategory('');
                    setNewSkillExperience('');
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSkill}
                  disabled={addingSkill || !newSkillCategory || !newSkillExperience}
                  className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 text-sm font-medium transition-all disabled:opacity-50"
                >
                  {addingSkill ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {skills.length === 0 && !showAddSkill ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/40 text-sm">No skills added yet</p>
              <p className="text-white/20 text-xs mt-1">Add your skills to attract employers</p>
            </div>
          ) : (
            <div className="space-y-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{skill.category?.name || 'Skill'}</p>
                        {skill.is_primary && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40">
                        {skill.experience_years} year{skill.experience_years !== 1 ? 's' : ''} experience
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verification Status Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Verification Status</h3>
        </div>

        {workerProfile?.status === 'active' ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-emerald-400">Verified Account</p>
              <p className="text-xs text-white/40">Your account has been verified. You can place bids on jobs.</p>
            </div>
          </div>
        ) : workerProfile?.status === 'pending' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-yellow-400">Pending Verification</p>
                <p className="text-xs text-white/40">Your documents are being reviewed. This usually takes 24-48 hours.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <p className="text-xs text-white/40 mb-2">CNIC Number</p>
                <p className="text-sm text-white/70">
                  {workerProfile.cnic_number
                    ? workerProfile.cnic_number.replace(/(\d{5})(\d{7})(\d+)/, '$1-$2-$3')
                    : 'Not provided'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <p className="text-xs text-white/40 mb-2">CNIC Documents</p>
                <div className="flex gap-2">
                  {workerProfile.cnic_front_url ? (
                    <span className="text-sm text-emerald-400">Front uploaded ✓</span>
                  ) : (
                    <span className="text-sm text-yellow-400">Front pending</span>
                  )}
                  {workerProfile.cnic_back_url ? (
                    <span className="text-sm text-emerald-400">Back uploaded ✓</span>
                  ) : (
                    <span className="text-sm text-yellow-400">Back pending</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : workerProfile?.status === 'rejected' ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">Verification Rejected</p>
              <p className="text-xs text-white/40">Your verification was rejected. Please contact support or re-upload your documents.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">Account Suspended</p>
              <p className="text-xs text-white/40">Your account has been suspended. Please contact support for assistance.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
