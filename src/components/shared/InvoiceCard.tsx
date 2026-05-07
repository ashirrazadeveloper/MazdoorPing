'use client';

import {
  Download,
  Eye,
  Calendar,
  Briefcase,
  Building2,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language-store';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    total: number;
    status: string;
    dueDate: string;
    paidAt: string | null;
    jobTitle?: string;
    toName?: string;
  };
  onPreview?: () => void;
}

function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'paid':
      return '✓';
    case 'sent':
      return '↑';
    case 'draft':
      return '✎';
    case 'cancelled':
      return '✕';
    default:
      return '•';
  }
}

export function InvoiceCard({ invoice, onPreview }: InvoiceCardProps) {
  const { t } = useLanguageStore();
  const statusColor = getInvoiceStatusColor(invoice.status);

  return (
    <div className="glass-card p-4 hover:border-white/15 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Left: Invoice Info */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Invoice # + Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">{invoice.invoiceNumber}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}>
              <span className="text-xs">{getStatusIcon(invoice.status)}</span>
              {t(`invoice.${invoice.status}`)}
            </span>
          </div>

          {/* Job Title */}
          {invoice.jobTitle && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Briefcase className="w-3 h-3 text-white/30 shrink-0" />
              <span className="text-xs text-white/60 truncate">{invoice.jobTitle}</span>
            </div>
          )}

          {/* To/From */}
          {invoice.toName && (
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="w-3 h-3 text-white/30 shrink-0" />
              <span className="text-xs text-white/40 truncate">
                {t('invoice.to')}: {invoice.toName}
              </span>
            </div>
          )}

          {/* Due Date */}
          <div className="flex items-center gap-1.5 mt-1">
            <Calendar className="w-3 h-3 text-white/30 shrink-0" />
            <span className="text-xs text-white/40">
              {t('invoice.dueDate')}: {formatDate(invoice.dueDate)}
            </span>
            {invoice.paidAt && (
              <span className="text-xs text-emerald-400/60 ml-1">
                &middot; {t('invoice.paidAt')}: {formatDate(invoice.paidAt)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Amount + Actions */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(invoice.total)}</p>
            <p className="text-[10px] text-white/30">
              {t('invoice.amount')}: {formatCurrency(invoice.amount)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onPreview} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" title={t('invoice.viewDetails')}>
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title={t('invoice.downloadPdf')}>
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
