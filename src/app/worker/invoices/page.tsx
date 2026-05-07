'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/store/language-store';
import {
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Wallet,
  Banknote,
} from 'lucide-react';
import { InvoiceCard } from '@/components/shared/InvoiceCard';
import { formatCurrency } from '@/lib/utils';

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
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    from: 'MazdoorPing',
    to: 'ABC Construction',
    amount: 15000,
    tax: 1500,
    commission: 750,
    total: 17250,
    status: 'paid',
    dueDate: '2024-03-15',
    paidAt: '2024-03-14',
    jobTitle: 'House Wiring',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    from: 'MazdoorPing',
    to: 'XYZ Builders',
    amount: 25000,
    tax: 2500,
    commission: 1250,
    total: 28750,
    status: 'sent',
    dueDate: '2024-04-01',
    paidAt: null,
    jobTitle: 'Office Renovation',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    from: 'MazdoorPing',
    to: 'Fast Homes',
    amount: 8000,
    tax: 800,
    commission: 400,
    total: 9200,
    status: 'paid',
    dueDate: '2024-02-20',
    paidAt: '2024-02-19',
    jobTitle: 'Bathroom Plumbing',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    from: 'MazdoorPing',
    to: 'Green Builders',
    amount: 35000,
    tax: 3500,
    commission: 1750,
    total: 40250,
    status: 'draft',
    dueDate: '2024-04-15',
    paidAt: null,
    jobTitle: 'Complete Home Wiring',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    from: 'MazdoorPing',
    to: 'Al-Noor Traders',
    amount: 12000,
    tax: 1200,
    commission: 600,
    total: 13800,
    status: 'sent',
    dueDate: '2024-03-30',
    paidAt: null,
    jobTitle: 'AC Installation',
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-006',
    from: 'MazdoorPing',
    to: 'City Developers',
    amount: 45000,
    tax: 4500,
    commission: 2250,
    total: 51750,
    status: 'paid',
    dueDate: '2024-03-10',
    paidAt: '2024-03-08',
    jobTitle: 'Generator Room Wiring',
  },
];

export default function InvoicesPage() {
  const { t } = useLanguageStore();
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus>('all');

  const filteredInvoices = activeFilter === 'all'
    ? mockInvoices
    : mockInvoices.filter(inv => inv.status === activeFilter);

  const totalInvoiced = mockInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = mockInvoices
    .filter(inv => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = mockInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const filterTabs: { key: InvoiceStatus; labelKey: string; icon: typeof FileText }[] = [
    { key: 'all', labelKey: 'invoice.all', icon: Filter },
    { key: 'draft', labelKey: 'invoice.draft', icon: FileText },
    { key: 'sent', labelKey: 'invoice.sent', icon: Clock },
    { key: 'paid', labelKey: 'invoice.paid', icon: CheckCircle },
  ];

  const filterCounts = {
    all: mockInvoices.length,
    draft: mockInvoices.filter(i => i.status === 'draft').length,
    sent: mockInvoices.filter(i => i.status === 'sent').length,
    paid: mockInvoices.filter(i => i.status === 'paid').length,
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
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all">
          <Plus className="w-4 h-4" />
          {t('invoice.createInvoice')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="glass-card p-4 animate-fade-in"
          style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}
        >
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
        <div
          className="glass-card p-4 animate-fade-in"
          style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}
        >
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
        <div
          className="glass-card p-4 animate-fade-in"
          style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}
        >
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
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        style={{ animationDelay: '250ms' }}
      >
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
              activeFilter === tab.key
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/5 text-white/40'
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
            <div
              key={invoice.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${300 + index * 80}ms`,
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
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
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className="glass-card p-12 flex flex-col items-center justify-center text-center"
          style={{ animationDelay: '300ms' }}
        >
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <FileText className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('invoice.noInvoices')}</h3>
          <p className="text-white/40 text-sm max-w-md">
            {t('invoice.noInvoicesSub')}
          </p>
        </div>
      )}
    </div>
  );
}
