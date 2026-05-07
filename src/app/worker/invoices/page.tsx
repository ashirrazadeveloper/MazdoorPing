'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import {
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Wallet,
  Banknote,
  X,
  Download,
  Printer,
  Eye,
  Copy,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { InvoiceCard } from '@/components/shared/InvoiceCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Job } from '@/types';

type InvoiceStatus = 'all' | 'sent' | 'paid' | 'draft';

interface Invoice {
  id: string;
  invoiceNumber: string;
  from: string;
  to: string;
  amount: number;
  tax: number;
  commission: number;
  total: number;
  status: 'paid' | 'sent' | 'draft' | 'cancelled';
  dueDate: string;
  paidAt: string | null;
  jobTitle: string;
  items: InvoiceItem[];
  notes: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const TAX_RATE = 0.05; // 5% tax
const COMMISSION_RATE = 0.05; // 5% commission

let invoiceCounter = 7;

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const num = String(invoiceCounter++).padStart(3, '0');
  return `INV-${year}-${num}`;
}

export default function InvoicesPage() {
  const { t } = useLanguageStore();
  const { workerProfile } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);

  // Create modal state
  const [formClientName, setFormClientName] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1', invoiceNumber: 'INV-2025-001', from: 'MazdoorPing', to: 'ABC Construction',
      amount: 15000, tax: 750, commission: 750, total: 16500, status: 'paid',
      dueDate: '2025-03-15', paidAt: '2025-03-14', jobTitle: 'House Wiring',
      items: [{ description: 'Complete House Wiring (3-Bedroom)', quantity: 1, rate: 15000, amount: 15000 }],
      notes: 'Completed on time. Excellent work.',
    },
    {
      id: '2', invoiceNumber: 'INV-2025-002', from: 'MazdoorPing', to: 'XYZ Builders',
      amount: 25000, tax: 1250, commission: 1250, total: 27500, status: 'sent',
      dueDate: '2025-04-01', paidAt: null, jobTitle: 'Office Renovation',
      items: [
        { description: 'Electrical Panel Upgrade', quantity: 1, rate: 15000, amount: 15000 },
        { description: 'AC Installation (2 Units)', quantity: 2, rate: 5000, amount: 10000 },
      ],
      notes: 'Payment expected by April 1st.',
    },
    {
      id: '3', invoiceNumber: 'INV-2025-003', from: 'MazdoorPing', to: 'Fast Homes',
      amount: 8000, tax: 400, commission: 400, total: 8800, status: 'paid',
      dueDate: '2025-02-20', paidAt: '2025-02-19', jobTitle: 'Bathroom Plumbing',
      items: [{ description: 'Bathroom Plumbing Renovation', quantity: 1, rate: 8000, amount: 8000 }],
      notes: '',
    },
    {
      id: '4', invoiceNumber: 'INV-2025-004', from: 'MazdoorPing', to: 'Green Builders',
      amount: 35000, tax: 1750, commission: 1750, total: 38500, status: 'draft',
      dueDate: '2025-04-15', paidAt: null, jobTitle: 'Complete Home Wiring',
      items: [
        { description: 'Complete Home Wiring (10-Marla)', quantity: 1, rate: 30000, amount: 30000 },
        { description: 'Generator Room Wiring', quantity: 1, rate: 5000, amount: 5000 },
      ],
      notes: 'Pending client approval.',
    },
    {
      id: '5', invoiceNumber: 'INV-2025-005', from: 'MazdoorPing', to: 'Al-Noor Traders',
      amount: 12000, tax: 600, commission: 600, total: 13200, status: 'sent',
      dueDate: '2025-03-30', paidAt: null, jobTitle: 'AC Installation',
      items: [{ description: 'Split AC Installation (3 Units)', quantity: 3, rate: 4000, amount: 12000 }],
      notes: '',
    },
    {
      id: '6', invoiceNumber: 'INV-2025-006', from: 'MazdoorPing', to: 'City Developers',
      amount: 45000, tax: 2250, commission: 2250, total: 49500, status: 'paid',
      dueDate: '2025-03-10', paidAt: '2025-03-08', jobTitle: 'Generator Room Wiring',
      items: [
        { description: 'ATS Panel Installation', quantity: 1, rate: 20000, amount: 20000 },
        { description: 'Generator Wiring', quantity: 1, rate: 15000, amount: 15000 },
        { description: 'Copper Wiring & Accessories', quantity: 1, rate: 10000, amount: 10000 },
      ],
      notes: 'Premium quality copper wire used.',
    },
  ]);

  const filteredInvoices = activeFilter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === activeFilter);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);

  // Invoice item management
  const updateFormItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setFormItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'description') item.description = value as string;
      else if (field === 'quantity') { item.quantity = Number(value) || 0; item.amount = item.quantity * item.rate; }
      else if (field === 'rate') { item.rate = Number(value) || 0; item.amount = item.quantity * item.rate; }
      updated[index] = item;
      return updated;
    });
  };

  const addFormItem = () => {
    setFormItems(prev => [...prev, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeFormItem = (index: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  const formSubtotal = formItems.reduce((sum, item) => sum + item.amount, 0);
  const formTax = formSubtotal * TAX_RATE;
  const formCommission = formSubtotal * COMMISSION_RATE;
  const formTotal = formSubtotal + formTax + formCommission;

  // Auto-generate invoice from completed jobs
  const handleAutoGenerate = async () => {
    if (autoGenerating) return;
    setAutoGenerating(true);
    try {
      const { data: completedBids } = await supabase
        .from('bids')
        .select('*, job:jobs(*)')
        .eq('worker_id', workerProfile?.id || '')
        .eq('status', 'accepted')
        .limit(5);

      if (completedBids && completedBids.length > 0) {
        const bid = completedBids[0] as unknown as { job?: Job };
        if (bid.job) {
          setFormJobTitle(bid.job.title);
          setFormAmount(String(bid.job.budget_max));
          setFormItems([{
            description: bid.job.title,
            quantity: 1,
            rate: bid.job.budget_max,
            amount: bid.job.budget_max,
          }]);
        }
      }
    } catch (err) {
      console.error('Error auto-generating invoice:', err);
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleCreateInvoice = () => {
    if (!formClientName.trim() || !formJobTitle.trim() || formTotal <= 0) return;

    setCreating(true);
    setTimeout(() => {
      const newInvoice: Invoice = {
        id: String(Date.now()),
        invoiceNumber: generateInvoiceNumber(),
        from: 'MazdoorPing',
        to: formClientName,
        amount: formSubtotal,
        tax: formTax,
        commission: formCommission,
        total: formTotal,
        status: 'draft',
        dueDate: formDueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidAt: null,
        jobTitle: formJobTitle,
        items: formItems.filter(i => i.description.trim()),
        notes: formNotes,
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setShowCreateModal(false);
      resetForm();
      setCreating(false);
    }, 800);
  };

  const resetForm = () => {
    setFormClientName('');
    setFormJobTitle('');
    setFormAmount('');
    setFormDueDate('');
    setFormNotes('');
    setFormItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const openPreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPreviewModal(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filterTabs: { key: InvoiceStatus; labelKey: string; icon: typeof FileText }[] = [
    { key: 'all', labelKey: 'invoice.all', icon: Filter },
    { key: 'draft', labelKey: 'invoice.draft', icon: FileText },
    { key: 'sent', labelKey: 'invoice.sent', icon: Clock },
    { key: 'paid', labelKey: 'invoice.paid', icon: CheckCircle },
  ];

  const filterCounts = {
    all: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('invoice.title')}</h1>
            <p className="text-white/50 mt-0.5 text-sm">{t('invoice.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('invoice.createInvoice')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-white/40">{t('invoice.totalInvoiced')}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(totalInvoiced)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-white/40">{t('invoice.pendingAmount')}</p>
              <p className="text-lg font-bold text-amber-400">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15">
              <Banknote className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-white/40">{t('invoice.paidAmount')}</p>
              <p className="text-lg font-bold text-emerald-400">{formatCurrency(paidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === tab.key
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {t(tab.labelKey)}
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
              activeFilter === tab.key ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'
            }`}>
              {filterCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Invoice Cards List */}
      {filteredInvoices.length > 0 ? (
        <div className="space-y-3">
          {filteredInvoices.map((invoice, index) => (
            <div key={invoice.id} className="animate-fade-in" style={{ animationDelay: `${300 + index * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}>
              <InvoiceCard
                invoice={{
                  id: invoice.id,
                  invoiceNumber: invoice.invoiceNumber,
                  amount: invoice.amount,
                  total: invoice.total,
                  status: invoice.status,
                  dueDate: invoice.dueDate,
                  paidAt: invoice.paidAt,
                  jobTitle: invoice.jobTitle,
                  toName: invoice.to,
                }}
                onPreview={() => openPreview(invoice)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <FileText className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('invoice.noInvoices')}</h3>
          <p className="text-white/40 text-sm max-w-md">{t('invoice.noInvoicesSub')}</p>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowCreateModal(false); resetForm(); }} />
          <div className="relative w-full max-w-2xl glass-card-premium p-6 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/15">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t('invoice.createInvoice')}</h2>
                  <p className="text-xs text-white/40">{t('invoice.mazdoorPingBranded')}</p>
                </div>
              </div>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto-generate button */}
            <button
              onClick={handleAutoGenerate}
              disabled={autoGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:from-emerald-500/20 hover:to-teal-500/20 transition-all mb-4 disabled:opacity-50"
            >
              {autoGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {t('invoice.autoGenerate') || 'Auto-Generate from Completed Job'}
            </button>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium">{t('invoice.clientName') || 'Client Name'}</label>
                  <input type="text" value={formClientName} onChange={(e) => setFormClientName(e.target.value)} placeholder="e.g. ABC Construction" className="glass-input w-full px-3 py-2.5 text-sm text-white placeholder-white/30" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium">{t('invoice.jobTitle') || 'Job Title'}</label>
                  <input type="text" value={formJobTitle} onChange={(e) => setFormJobTitle(e.target.value)} placeholder="e.g. House Wiring" className="glass-input w-full px-3 py-2.5 text-sm text-white placeholder-white/30" />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50 font-medium">{t('invoice.lineItems') || 'Line Items'}</label>
                  <button onClick={addFormItem} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Plus className="w-3 h-3" /> {t('invoice.addLineItem') || 'Add Item'}
                  </button>
                </div>
                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input type="text" value={item.description} onChange={(e) => updateFormItem(idx, 'description', e.target.value)} placeholder={t('invoice.description') || 'Description'} className="glass-input w-full px-3 py-2 text-xs text-white placeholder-white/30" />
                      </div>
                      <div className="w-16">
                        <input type="number" value={item.quantity || ''} onChange={(e) => updateFormItem(idx, 'quantity', e.target.value)} placeholder="Qty" className="glass-input w-full px-2 py-2 text-xs text-white text-center placeholder-white/30" />
                      </div>
                      <div className="w-24">
                        <input type="number" value={item.rate || ''} onChange={(e) => updateFormItem(idx, 'rate', e.target.value)} placeholder="Rate" className="glass-input w-full px-2 py-2 text-xs text-white text-center placeholder-white/30" />
                      </div>
                      <div className="w-24 text-right py-2 text-xs text-emerald-400 font-medium">
                        {formatCurrency(item.amount)}
                      </div>
                      {formItems.length > 1 && (
                        <button onClick={() => removeFormItem(idx)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t('invoice.subtotal') || 'Subtotal'}</span>
                  <span className="text-white font-medium">{formatCurrency(formSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t('invoice.tax5') || 'Tax (5%)'}</span>
                  <span className="text-white/70">{formatCurrency(formTax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t('invoice.commission5') || 'Platform Fee (5%)'}</span>
                  <span className="text-white/70">{formatCurrency(formCommission)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-white/[0.08]">
                  <span className="text-white font-bold">{t('invoice.total') || 'Total'}</span>
                  <span className="text-emerald-400 font-bold text-lg">{formatCurrency(formTotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium">{t('invoice.dueDate') || 'Due Date'}</label>
                  <input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} className="glass-input w-full px-3 py-2.5 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5 font-medium">{t('invoice.notes') || 'Notes'}</label>
                  <input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional notes..." className="glass-input w-full px-3 py-2.5 text-sm text-white placeholder-white/30" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 hover:text-white transition-all">
                {t('invoice.cancel') || 'Cancel'}
              </button>
              <button onClick={handleCreateInvoice} disabled={!formClientName.trim() || !formJobTitle.trim() || formTotal <= 0 || creating} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t('invoice.generateInvoice') || 'Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in print:p-0" id="invoice-preview">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm print:bg-white" onClick={() => setShowPreviewModal(false)} />
          <div className="relative w-full max-w-2xl bg-gray-950 rounded-2xl overflow-hidden animate-scale-in print:rounded-none print:animate-none print:max-w-none print:h-screen">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 print:bg-emerald-600 print:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">MazdoorPing</h1>
                  <p className="text-emerald-100/70 text-sm mt-0.5">Pakistan&apos;s Premier Workers Platform</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{selectedInvoice.invoiceNumber}</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${
                    selectedInvoice.status === 'paid' ? 'bg-emerald-400/20 text-emerald-100' :
                    selectedInvoice.status === 'sent' ? 'bg-blue-400/20 text-blue-100' :
                    'bg-gray-400/20 text-gray-100'
                  }`}>
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-6 print:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">From</p>
                  <p className="text-sm font-semibold text-white">MazdoorPing</p>
                  <p className="text-xs text-white/50">www.mazdoorping.vercel.app</p>
                  <p className="text-xs text-white/50">support@mazdoorping.pk</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">To</p>
                  <p className="text-sm font-semibold text-white">{selectedInvoice.to}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Job</p>
                  <p className="text-sm text-white">{selectedInvoice.jobTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Due Date</p>
                  <p className="text-sm text-white">{formatDate(selectedInvoice.dueDate)}</p>
                  {selectedInvoice.paidAt && (
                    <p className="text-xs text-emerald-400 mt-0.5">{t('invoice.paidOn') || 'Paid on'}: {formatDate(selectedInvoice.paidAt)}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/40 font-medium py-2">Description</th>
                    <th className="text-center text-xs text-white/40 font-medium py-2">Qty</th>
                    <th className="text-right text-xs text-white/40 font-medium py-2">Rate</th>
                    <th className="text-right text-xs text-white/40 font-medium py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoice.items || [{ description: selectedInvoice.jobTitle, quantity: 1, rate: selectedInvoice.amount, amount: selectedInvoice.amount }]).map((item, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-2 text-sm text-white/80">{item.description}</td>
                      <td className="py-2 text-sm text-white/60 text-center">{item.quantity}</td>
                      <td className="py-2 text-sm text-white/60 text-right">{formatCurrency(item.rate)}</td>
                      <td className="py-2 text-sm text-white/80 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="space-y-1.5 pl-auto" style={{ maxWidth: '250px', marginLeft: 'auto' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t('invoice.subtotal') || 'Subtotal'}</span>
                  <span className="text-white">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t('invoice.tax5') || 'Tax (5%)'}</span>
                  <span className="text-white/70">{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t('invoice.commission5') || 'Platform Fee (5%)'}</span>
                  <span className="text-white/70">{formatCurrency(selectedInvoice.commission)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-white/10">
                  <span className="text-white font-bold">{t('invoice.total')}</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-white/40 mb-1">{t('invoice.notes')}</p>
                  <p className="text-sm text-white/60">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-white/[0.06] text-center">
                <p className="text-xs text-white/30">Generated by MazdoorPing - Pakistan&apos;s Premier Workers Platform</p>
                <p className="text-[10px] text-white/20 mt-0.5">This is a computer-generated invoice. No signature required.</p>
              </div>
            </div>

            {/* Close / Print buttons */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-white/[0.06] print:hidden">
              <button onClick={handlePrintInvoice} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 text-sm transition-all">
                <Printer className="w-4 h-4" />
                {t('invoice.print') || 'Print'}
              </button>
              <button onClick={() => setShowPreviewModal(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-sm transition-all">
                {t('invoice.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
