'use client';

import { useState } from 'react';
import { X, Upload, ImageIcon } from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';

interface PortfolioUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; description: string; isFeatured: boolean }) => void;
}

export function PortfolioUpload({ isOpen, onClose, onUpload }: PortfolioUploadProps) {
  const { t } = useLanguageStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onUpload({ title: title.trim(), description: description.trim(), isFeatured });
    setTitle('');
    setDescription('');
    setIsFeatured(false);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setIsFeatured(false);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card-premium p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{t('portfolio.uploadWork')}</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
            isDragging
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.02]'
          }`}
        >
          <div className="p-3 rounded-2xl bg-white/5">
            <Upload className="w-8 h-8 text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-sm text-white/60">{t('portfolio.clickOrDrag')}</p>
            <p className="text-xs text-white/30 mt-1">{t('portfolio.jpgPngMax5')}</p>
          </div>
        </div>

        {/* Title Input */}
        <div className="mt-4">
          <label className="block text-xs text-white/50 mb-1.5">{t('portfolio.addTitle')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('portfolio.addTitle')}
            className="glass-input w-full px-3 py-2.5 text-sm text-white placeholder-white/30"
          />
        </div>

        {/* Description Textarea */}
        <div className="mt-4">
          <label className="block text-xs text-white/50 mb-1.5">{t('portfolio.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('portfolio.addDescription')}
            rows={3}
            className="glass-input w-full px-3 py-2.5 text-sm text-white placeholder-white/30 resize-none"
          />
        </div>

        {/* Set as Featured Toggle */}
        <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/70">{t('portfolio.setAsFeatured')}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsFeatured(!isFeatured)}
            className={`toggle-switch ${isFeatured ? 'active' : ''}`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
          >
            {t('portfolio.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {t('portfolio.upload')}
          </button>
        </div>
      </div>
    </div>
  );
}
