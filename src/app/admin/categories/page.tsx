'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  Tag, Plus, Briefcase, Pencil, X, Check, ToggleLeft, ToggleRight,
  Search, Save, Trash2,
} from 'lucide-react';
import type { Category } from '@/types';

interface CategoryWithCount extends Category {
  jobs_count: number;
}

const EMPTY_CATEGORY = {
  name: '',
  name_ur: '',
  icon: 'briefcase',
  description: '',
};

const ICON_OPTIONS = [
  { value: 'briefcase', label: '💼 Briefcase' },
  { value: 'wrench', label: '🔧 Wrench' },
  { value: 'hammer', label: '🔨 Hammer' },
  { value: 'paint', label: '🎨 Paint' },
  { value: 'zap', label: '⚡ Zap' },
  { value: 'droplet', label: '💧 Droplet' },
  { value: 'home', label: '🏠 Home' },
  { value: 'car', label: '🚗 Car' },
  { value: 'cpu', label: '💻 Computer' },
  { value: 'shield', label: '🛡️ Shield' },
  { value: 'truck', label: '🚚 Truck' },
  { value: 'leaf', label: '🌿 Garden' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState(EMPTY_CATEGORY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState(EMPTY_CATEGORY);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchCategories() {
      setLoading(true);
      try {
        const [catRes, jobRes] = await Promise.all([
          supabase
            .from('categories')
            .select('*')
            .order('name'),
          supabase
            .from('jobs')
            .select('category_id, status'),
        ]);

        const cats = (catRes.data as Category[]) || [];
        const jobs = jobRes.data || [];

        const jobCounts: Record<string, number> = {};
        jobs.forEach((j) => {
          if (j.category_id) {
            jobCounts[j.category_id] = (jobCounts[j.category_id] || 0) + 1;
          }
        });

        const catsWithCount: CategoryWithCount[] = cats.map((c) => ({
          ...c,
          jobs_count: jobCounts[c.id] || 0,
        }));

        if (!cancelled) setCategories(catsWithCount);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCategories();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase.from('categories').insert({
        name: newCategory.name.trim(),
        name_ur: newCategory.name_ur.trim() || newCategory.name.trim(),
        icon: newCategory.icon || 'briefcase',
        description: newCategory.description.trim(),
        is_active: true,
      });

      if (error) throw error;

      showToast(`Category "${newCategory.name}" created`, 'success');
      setNewCategory(EMPTY_CATEGORY);
      setShowAddForm(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to create category:', err);
      showToast('Failed to create category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editData.name.trim(),
          name_ur: editData.name_ur.trim() || editData.name.trim(),
          icon: editData.icon || 'briefcase',
          description: editData.description.trim(),
        })
        .eq('id', id);

      if (error) throw error;

      showToast(`Category "${editData.name}" updated`, 'success');
      setEditingId(null);
      setEditData(EMPTY_CATEGORY);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to update category:', err);
      showToast('Failed to update category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (cat: CategoryWithCount) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !cat.is_active })
        .eq('id', cat.id);

      if (error) throw error;

      showToast(`Category "${cat.name}" ${cat.is_active ? 'deactivated' : 'activated'}`, 'success');
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to toggle category:', err);
      showToast('Failed to update category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryWithCount) => {
    if (cat.jobs_count > 0) {
      showToast('Cannot delete category with existing jobs', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', cat.id);

      if (error) throw error;

      showToast(`Category "${cat.name}" deleted`, 'success');
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to delete category:', err);
      showToast('Failed to delete category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (cat: CategoryWithCount) => {
    setEditingId(cat.id);
    setEditData({
      name: cat.name,
      name_ur: cat.name_ur,
      icon: cat.icon,
      description: cat.description,
    });
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.name_ur.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in',
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        )}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Category Management</h1>
          <p className="text-white/50 mt-1">{categories.length} categories on the platform</p>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setNewCategory(EMPTY_CATEGORY); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/20 font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input w-full pl-10 pr-4 py-2.5 text-sm text-white"
        />
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">New Category</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Name (English) *</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Electrician"
                className="glass-input w-full px-4 py-2.5 text-sm text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Name (Urdu)</label>
              <input
                type="text"
                value={newCategory.name_ur}
                onChange={(e) => setNewCategory({ ...newCategory, name_ur: e.target.value })}
                placeholder="e.g., برق کار"
                className="glass-input w-full px-4 py-2.5 text-sm text-white"
                dir="rtl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Icon</label>
              <select
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                className="glass-input w-full px-4 py-2.5 text-sm text-white"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Brief description"
                className="glass-input w-full px-4 py-2.5 text-sm text-white"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.name.trim() || actionLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {actionLoading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-5 w-32 mb-3" />
              <div className="skeleton h-3 w-24 mb-2" />
              <div className="skeleton h-3 w-48 mb-4" />
              <div className="flex gap-2">
                <div className="skeleton h-8 w-20 rounded-lg" />
                <div className="skeleton h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Tag className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No categories found</p>
          <p className="text-white/20 text-sm mt-1">
            {search ? 'Try a different search term' : 'Create your first category to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                'glass-card p-6 transition-all',
                !cat.is_active && 'opacity-60'
              )}
            >
              {editingId === cat.id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="glass-input w-full px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Name (Urdu)</label>
                    <input
                      type="text"
                      value={editData.name_ur}
                      onChange={(e) => setEditData({ ...editData, name_ur: e.target.value })}
                      className="glass-input w-full px-3 py-2 text-sm text-white"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Icon</label>
                    <select
                      value={editData.icon}
                      onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
                      className="glass-input w-full px-3 py-2 text-sm text-white"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 uppercase tracking-wider">Description</label>
                    <input
                      type="text"
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="glass-input w-full px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUpdateCategory(cat.id)}
                      disabled={!editData.name.trim() || actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 text-xs font-medium transition-all disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditData(EMPTY_CATEGORY); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-xs font-medium transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-lg">
                        {ICON_OPTIONS.find((o) => o.value === cat.icon)?.label.split(' ')[0] || '📁'}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                        {cat.name_ur && (
                          <p className="text-xs text-white/30" dir="rtl">{cat.name_ur}</p>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      cat.is_active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    )}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-white/40 mb-3 line-clamp-2">{cat.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
                    <Briefcase className="w-3.5 h-3.5" />
                    {cat.jobs_count} jobs
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white text-xs transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(cat)}
                      disabled={actionLoading}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-xs transition-all"
                    >
                      {cat.is_active ? (
                        <>
                          <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-red-400">Inactive</span>
                        </>
                      )}
                    </button>
                    {cat.jobs_count === 0 && (
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 text-xs transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
