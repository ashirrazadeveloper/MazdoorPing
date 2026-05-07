'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language-store';
import {
  Camera,
  Plus,
  ImageIcon,
  Trash2,
  Edit3,
  Star,
  X,
  Eye,
} from 'lucide-react';
import { PortfolioUpload } from '@/components/shared/PortfolioUpload';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  gradient: string;
}

const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'House Wiring',
    description: 'Complete electrical wiring for 3-bedroom house in DHA Lahore',
    imageUrl: '/portfolio/wiring.jpg',
    isFeatured: true,
    gradient: 'from-emerald-900/40 to-teal-900/30',
  },
  {
    id: '2',
    title: 'Bathroom Renovation',
    description: 'Full bathroom tiles and plumbing work with modern fixtures',
    imageUrl: '/portfolio/bathroom.jpg',
    isFeatured: false,
    gradient: 'from-blue-900/40 to-cyan-900/30',
  },
  {
    id: '3',
    title: 'Office Electrical',
    description: 'Complete office wiring with UPS and generator backup system',
    imageUrl: '/portfolio/office.jpg',
    isFeatured: true,
    gradient: 'from-violet-900/40 to-purple-900/30',
  },
  {
    id: '4',
    title: 'Kitchen Plumbing',
    description: 'New kitchen sink installation with hot/cold water lines',
    imageUrl: '/portfolio/kitchen.jpg',
    isFeatured: false,
    gradient: 'from-amber-900/40 to-orange-900/30',
  },
  {
    id: '5',
    title: 'AC Installation',
    description: 'Split AC installation with copper piping and drainage',
    imageUrl: '/portfolio/ac.jpg',
    isFeatured: false,
    gradient: 'from-rose-900/40 to-pink-900/30',
  },
  {
    id: '6',
    title: 'Generator Setup',
    description: 'Automatic transfer switch and generator room wiring',
    imageUrl: '/portfolio/generator.jpg',
    isFeatured: false,
    gradient: 'from-slate-900/40 to-gray-900/30',
  },
];

export default function PortfolioPage() {
  const { t } = useLanguageStore();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(mockPortfolioItems);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);

  const featuredCount = portfolioItems.filter(item => item.isFeatured).length;
  const totalViews = '2.4k';

  const handleUpload = (data: { title: string; description: string; isFeatured: boolean }) => {
    const gradients = [
      'from-emerald-900/40 to-teal-900/30',
      'from-blue-900/40 to-cyan-900/30',
      'from-violet-900/40 to-purple-900/30',
      'from-amber-900/40 to-orange-900/30',
      'from-rose-900/40 to-pink-900/30',
      'from-slate-900/40 to-gray-900/30',
    ];
    const newItem: PortfolioItem = {
      id: String(Date.now()),
      title: data.title,
      description: data.description,
      imageUrl: `/portfolio/${data.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      isFeatured: data.isFeatured,
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    };
    setPortfolioItems(prev => [newItem, ...prev]);
    setShowUploadModal(false);
  };

  const handleDelete = (id: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15">
            <Camera className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('portfolio.title')}</h1>
            <p className="text-white/50 mt-0.5 text-sm">{t('portfolio.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('portfolio.addPhotos')}
        </button>
      </div>

      {/* Stats Bar */}
      <div
        className="flex items-center gap-4 text-sm text-white/50"
        style={{ animationDelay: '100ms' }}
      >
        <span className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" />
          <strong className="text-white">{portfolioItems.length}</strong> {t('portfolio.photos')}
        </span>
        <span className="text-white/20">|</span>
        <span className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-emerald-400" />
          <strong className="text-white">{featuredCount}</strong> {t('portfolio.featured')}
        </span>
        <span className="text-white/20">|</span>
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          <strong className="text-white">{totalViews}</strong> {t('portfolio.views')}
        </span>
      </div>

      {/* Photo Grid */}
      {portfolioItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portfolioItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in group rounded-xl overflow-hidden glass-card hover:border-emerald-500/20"
              style={{
                animationDelay: `${150 + index * 80}ms`,
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              {/* Image Area */}
              <button
                onClick={() => setSelectedPhoto(item)}
                className={`relative w-full h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center cursor-pointer`}
              >
                <div className={`w-full h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <Camera className="w-10 h-10 text-white/20" />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white/80" />
                </div>
                {/* Featured badge */}
                {item.isFeatured && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-400">
                    <Star className="w-3 h-3" />
                    {t('portfolio.featured')}
                  </div>
                )}
              </button>

              {/* Card Body */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06]">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <Edit3 className="w-3 h-3" />
                    {t('portfolio.editItem')}
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all ml-auto"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    {t('portfolio.deleteItem')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className="glass-card p-12 flex flex-col items-center justify-center text-center"
          style={{ animationDelay: '200ms' }}
        >
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <Camera className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('portfolio.noPortfolio')}</h3>
          <p className="text-white/40 text-sm max-w-md mb-4">
            {t('portfolio.noPortfolioSub')}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('portfolio.addPhotos')}
          </button>
        </div>
      )}

      {/* Upload Modal */}
      <PortfolioUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className={`w-full h-64 sm:h-96 rounded-2xl bg-gradient-to-br ${selectedPhoto.gradient} flex items-center justify-center overflow-hidden`}>
              <Camera className="w-16 h-16 text-white/15" />
            </div>

            {/* Info */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{selectedPhoto.title}</h3>
                {selectedPhoto.isFeatured && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-400">
                    <Star className="w-3 h-3" />
                    {t('portfolio.featured')}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60">{selectedPhoto.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
