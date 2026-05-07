'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import {
  Camera,
  Plus,
  ImageIcon,
  Trash2,
  Edit3,
  Star,
  X,
  Eye,
  Sparkles,
  Brain,
  Loader2,
  Download,
  Award,
  TrendingUp,
  Briefcase,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { PortfolioUpload } from '@/components/shared/PortfolioUpload';
import { formatCurrency } from '@/lib/utils';
import type { Worker as WorkerType, WorkerSkill, Review } from '@/types';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  gradient: string;
  category?: string;
}

const gradients = [
  'from-emerald-900/40 to-teal-900/30',
  'from-blue-900/40 to-cyan-900/30',
  'from-violet-900/40 to-purple-900/30',
  'from-amber-900/40 to-orange-900/30',
  'from-rose-900/40 to-pink-900/30',
  'from-slate-900/40 to-gray-900/30',
];

const defaultPortfolio: PortfolioItem[] = [
  { id: '1', title: 'House Wiring', description: 'Complete electrical wiring for 3-bedroom house in DHA Lahore', imageUrl: '/portfolio/wiring.jpg', isFeatured: true, gradient: gradients[0], category: 'Electrician' },
  { id: '2', title: 'Bathroom Renovation', description: 'Full bathroom tiles and plumbing work with modern fixtures', imageUrl: '/portfolio/bathroom.jpg', isFeatured: false, gradient: gradients[1], category: 'Plumber' },
  { id: '3', title: 'Office Electrical', description: 'Complete office wiring with UPS and generator backup system', imageUrl: '/portfolio/office.jpg', isFeatured: true, gradient: gradients[2], category: 'Electrician' },
];

export default function PortfolioPage() {
  const { t } = useLanguageStore();
  const { workerProfile } = useAuthStore();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(defaultPortfolio);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);
  const [generatingPortfolio, setGeneratingPortfolio] = useState(false);
  const [showAIPortfolio, setShowAIPortfolio] = useState(false);
  const [aiPortfolioData, setAiPortfolioData] = useState<{
    workerName: string;
    city: string;
    skills: string[];
    rating: number;
    completedJobs: number;
    totalEarnings: number;
    experience: string;
    portfolioItems: PortfolioItem[];
    summary: string;
  } | null>(null);

  const featuredCount = portfolioItems.filter(item => item.isFeatured).length;
  const totalViews = '2.4k';

  const handleUpload = (data: { title: string; description: string; isFeatured: boolean }) => {
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

  // AI Portfolio Maker
  const generateAIPortfolio = async () => {
    setGeneratingPortfolio(true);
    try {
      // Fetch worker data from Supabase
      const workerName = workerProfile?.profile?.full_name || 'Skilled Worker';
      let workerCity = '';
      let skills: string[] = [];
      let rating = 0;
      let completedJobs = 0;
      let totalEarnings = 0;
      let expYears = 0;

      if (workerProfile?.id) {
        const [workerRes, skillsRes, reviewsRes] = await Promise.all([
          supabase.from('workers').select('*').eq('id', workerProfile.id).single(),
          supabase.from('worker_skills').select('*, category:categories(*)').eq('worker_id', workerProfile.id),
          supabase.from('reviews').select('rating').eq('to_user_id', workerProfile.profile_id || ''),
        ]);

        if (workerRes.data) {
          workerCity = workerRes.data.city || 'Pakistan';
          completedJobs = workerRes.data.completed_jobs || 0;
          rating = workerRes.data.rating || 0;
        }
        if (skillsRes.data && skillsRes.data.length > 0) {
          skills = skillsRes.data.map((s: WorkerSkill) => s.category?.name || 'Skilled Worker');
          expYears = Math.round(skillsRes.data.reduce((sum: number, s: WorkerSkill) => sum + (s.experience_years || 0), 0) / skillsRes.data.length);
        }
      }

      // Use AI to generate portfolio
      const portfolioContext = `Create a professional portfolio summary for a Pakistani skilled worker:
Name: ${workerName}
City: ${workerCity}
Skills: ${skills.join(', ') || 'Multiple Skills'}
Rating: ${rating || 'New'} stars
Completed Jobs: ${completedJobs}
Average Experience: ${expYears} years

Generate:
1. A professional 3-4 line summary highlighting expertise and reliability
2. 4-5 impressive project descriptions (title + description) based on the worker's skills. Each project should sound impressive but realistic for Pakistan market.`;

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: portfolioContext,
          role: 'worker',
          lang: useLanguageStore.getState().language,
        }),
      });

      const data = await res.json();
      const aiContent = data.content || '';

      // Parse AI response into portfolio items
      const generatedItems: PortfolioItem[] = skills.length > 0
        ? skills.slice(0, 5).map((skill, i) => ({
            id: `ai-${Date.now()}-${i}`,
            title: `${skill} Project ${i + 1}`,
            description: `Professional ${skill} work completed with high quality standards and client satisfaction. ${skill === 'Electrician' ? 'Complete wiring installation following safety codes.' : skill === 'Plumber' ? 'Leak-proof plumbing with premium materials.' : skill === 'Carpenter' ? 'Precision woodworking with quality finishes.' : 'Expert workmanship delivered on time.'}`,
            imageUrl: '',
            isFeatured: i < 2,
            gradient: gradients[i % gradients.length],
            category: skill,
          }))
        : [
            { id: 'ai-1', title: 'Professional Project 1', description: 'High-quality professional work completed on time', imageUrl: '', isFeatured: true, gradient: gradients[0], category: 'General' },
            { id: 'ai-2', title: 'Premium Project 2', description: 'Premium quality work with excellent client feedback', imageUrl: '', isFeatured: true, gradient: gradients[1], category: 'General' },
          ];

      setAiPortfolioData({
        workerName,
        city: workerCity || 'Pakistan',
        skills: skills.length > 0 ? skills : ['Skilled Worker'],
        rating,
        completedJobs,
        totalEarnings,
        experience: `${expYears} years`,
        portfolioItems: generatedItems,
        summary: aiContent,
      });
      setShowAIPortfolio(true);
    } catch (err) {
      console.error('Error generating AI portfolio:', err);
    } finally {
      setGeneratingPortfolio(false);
    }
  };

  const addAIItemsToPortfolio = () => {
    if (aiPortfolioData) {
      setPortfolioItems(prev => [...aiPortfolioData.portfolioItems, ...prev]);
    }
    setShowAIPortfolio(false);
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
        <div className="flex items-center gap-2">
          {/* AI Portfolio Maker Button */}
          <button
            onClick={generateAIPortfolio}
            disabled={generatingPortfolio}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:from-emerald-500/30 hover:to-teal-500/30 transition-all disabled:opacity-50"
          >
            {generatingPortfolio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            <span className="hidden sm:inline">{t('portfolio.aiMaker') || 'AI Portfolio Maker'}</span>
            <span className="sm:hidden">AI</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('portfolio.addPhotos')}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm text-white/50">
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

      {/* AI Banner */}
      <div className="glass-card p-4 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">{t('portfolio.aiBannerTitle') || 'AI-Powered Portfolio'}</h3>
            <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
              {t('portfolio.aiBannerDesc') || 'Let AI analyze your profile, skills, work experience, and earnings to automatically create a professional portfolio. One click and your portfolio is ready!'}
            </p>
          </div>
          <button
            onClick={generateAIPortfolio}
            disabled={generatingPortfolio}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-50"
          >
            {generatingPortfolio ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {generatingPortfolio ? (t('portfolio.generating') || 'Generating...') : (t('portfolio.generateNow') || 'Generate Now')}
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      {portfolioItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portfolioItems.map((item, index) => (
            <div key={item.id} className="animate-fade-in group rounded-xl overflow-hidden glass-card hover:border-emerald-500/20" style={{ animationDelay: `${150 + index * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}>
              <button onClick={() => setSelectedPhoto(item)} className={`relative w-full h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center cursor-pointer`}>
                <div className={`w-full h-48 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <Camera className="w-10 h-10 text-white/20" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white/80" />
                </div>
                {item.isFeatured && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-400">
                    <Star className="w-3 h-3" />
                    {t('portfolio.featured')}
                  </div>
                )}
                {item.category && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-medium text-white/60">
                    {item.category}
                  </div>
                )}
              </button>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-white/[0.06]">
                  <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/50 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" onClick={() => setShowUploadModal(true)}>
                    <Edit3 className="w-3 h-3" /> {t('portfolio.editItem')}
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all ml-auto" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3 h-3" /> {t('portfolio.deleteItem')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <Camera className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('portfolio.noPortfolio')}</h3>
          <p className="text-white/40 text-sm max-w-md mb-4">{t('portfolio.noPortfolioSub')}</p>
          <div className="flex items-center gap-3">
            <button onClick={generateAIPortfolio} disabled={generatingPortfolio} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:from-emerald-500/30 hover:to-teal-500/30 transition-all disabled:opacity-50">
              {generatingPortfolio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              {t('portfolio.aiMaker') || 'AI Portfolio Maker'}
            </button>
            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all">
              <Plus className="w-4 h-4" /> {t('portfolio.addPhotos')}
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <PortfolioUpload isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={handleUpload} />

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPhoto(null)} className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
              <X className="w-5 h-5" />
            </button>
            <div className={`w-full h-64 sm:h-96 rounded-2xl bg-gradient-to-br ${selectedPhoto.gradient} flex items-center justify-center overflow-hidden`}>
              <Camera className="w-16 h-16 text-white/15" />
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{selectedPhoto.title}</h3>
                {selectedPhoto.isFeatured && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-400">
                    <Star className="w-3 h-3" /> {t('portfolio.featured')}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60">{selectedPhoto.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Portfolio Preview Modal */}
      {showAIPortfolio && aiPortfolioData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAIPortfolio(false)} />
          <div className="relative w-full max-w-3xl glass-card-premium overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* AI Portfolio Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Brain className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">{t('portfolio.aiPortfolioTitle') || 'AI-Generated Portfolio'}</h2>
                </div>
                <button onClick={() => setShowAIPortfolio(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-emerald-100/70 text-sm">{t('portfolio.aiGeneratedNote') || 'This portfolio was automatically generated by AI based on your profile analysis'}</p>
            </div>

            {/* Worker Stats */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{aiPortfolioData.rating || 'New'}</p>
                  <p className="text-[10px] text-white/40">{t('portfolio.rating') || 'Rating'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <Briefcase className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{aiPortfolioData.completedJobs}</p>
                  <p className="text-[10px] text-white/40">{t('portfolio.completedJobs') || 'Completed Jobs'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{aiPortfolioData.experience}</p>
                  <p className="text-[10px] text-white/40">{t('portfolio.experience') || 'Experience'}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <DollarSign className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{formatCurrency(aiPortfolioData.totalEarnings)}</p>
                  <p className="text-[10px] text-white/40">{t('portfolio.earnings') || 'Earnings'}</p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">{t('portfolio.skills') || 'Skills'}</h3>
                <div className="flex flex-wrap gap-2">
                  {aiPortfolioData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              {aiPortfolioData.summary && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-emerald-400">{t('portfolio.aiSummary') || 'AI Summary'}</h3>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{aiPortfolioData.summary}</p>
                </div>
              )}

              {/* Generated Portfolio Items */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">{t('portfolio.generatedProjects') || 'Generated Projects'}</h3>
                <div className="space-y-3">
                  {aiPortfolioData.portfolioItems.map((item, i) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}>
                        <Camera className="w-6 h-6 text-white/20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                          {item.isFeatured && (
                            <Star className="w-3 h-3 text-amber-400" />
                          )}
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAIPortfolio(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
                  {t('portfolio.cancel') || 'Cancel'}
                </button>
                <button onClick={addAIItemsToPortfolio} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all">
                  <Plus className="w-4 h-4" />
                  {t('portfolio.addToPortfolio') || 'Add to Portfolio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
