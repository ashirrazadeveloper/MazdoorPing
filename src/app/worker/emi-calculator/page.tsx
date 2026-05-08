'use client';

import { useState, useMemo } from 'react';
import { useLanguageStore } from '@/store/language-store';
import { formatCurrency } from '@/lib/utils';
import {
  Calculator,
  RotateCcw,
  Percent,
  Calendar,
  Info,
  Banknote,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6'];

export default function EMICalculatorPage() {
  const { t } = useLanguageStore();
  const [amount, setAmount] = useState<string>('500000');
  const [rate, setRate] = useState<string>('12');
  const [tenure, setTenure] = useState<string>('12');
  const [showResults, setShowResults] = useState(false);

  const [amountSlider, setAmountSlider] = useState(500000);
  const [tenureSlider, setTenureSlider] = useState(12);

  const results = useMemo(() => {
    const P = parseFloat(amount) || 0;
    const annualRate = parseFloat(rate) || 0;
    const N = parseFloat(tenure) || 0;

    if (P <= 0 || annualRate <= 0 || N <= 0) return null;

    const R = annualRate / 12 / 100; // Monthly interest rate
    const power = Math.pow(1 + R, N);
    const emi = (P * R * power) / (power - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      principal: P,
    };
  }, [amount, rate, tenure]);

  const pieData = results
    ? [
        { name: t('emi.principalAmount'), value: results.principal },
        { name: t('emi.totalInterest'), value: results.totalInterest },
      ]
    : [];

  const handleAmountChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setAmount(val);
    setAmountSlider(Math.min(Math.max(num, 10000), 10000000));
  };

  const handleTenureChange = (val: string) => {
    const num = parseFloat(val) || 0;
    setTenure(val);
    setTenureSlider(Math.min(Math.max(num, 1), 360));
  };

  const handleSliderAmount = (val: number) => {
    setAmountSlider(val);
    setAmount(String(val));
  };

  const handleSliderTenure = (val: number) => {
    setTenureSlider(val);
    setTenure(String(val));
  };

  const handleCalculate = () => {
    if (results) setShowResults(true);
  };

  const handleReset = () => {
    setAmount('500000');
    setRate('12');
    setTenure('12');
    setAmountSlider(500000);
    setTenureSlider(12);
    setShowResults(false);
  };

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 15, 25, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '13px',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('emi.title')}</h1>
        <p className="text-white/50 mt-1 text-sm lg:text-base">{t('emi.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="glass-card p-6 space-y-6">
          {/* Project Amount */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Banknote className="w-4 h-4 text-emerald-400" />
              </div>
              <label className="text-sm font-medium text-white/70">{t('emi.projectAmount')}</label>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 font-medium">Rs.</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={t('emi.enterAmount')}
                className="glass-input w-full pl-12 pr-4 py-3 text-lg text-white font-semibold placeholder:text-white/30"
                min="10000"
                max="10000000"
                step="10000"
              />
            </div>
            <input
              type="range"
              min={10000}
              max={10000000}
              step={10000}
              value={amountSlider}
              onChange={(e) => handleSliderAmount(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-white/30">
              <span>Rs. 10,000</span>
              <span>Rs. 10,000,000</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Percent className="w-4 h-4 text-blue-400" />
              </div>
              <label className="text-sm font-medium text-white/70">{t('emi.interestRate')}</label>
            </div>
            <div className="relative">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder={t('emi.enterRate')}
                className="glass-input w-full px-4 py-3 text-lg text-white font-semibold placeholder:text-white/30"
                min="1"
                max="50"
                step="0.5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/30">%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <label className="text-sm font-medium text-white/70">{t('emi.tenure')}</label>
            </div>
            <div className="relative">
              <input
                type="number"
                value={tenure}
                onChange={(e) => handleTenureChange(e.target.value)}
                placeholder={t('emi.enterTenure')}
                className="glass-input w-full px-4 py-3 text-lg text-white font-semibold placeholder:text-white/30"
                min="1"
                max="360"
              />
            </div>
            <input
              type="range"
              min={1}
              max={360}
              step={1}
              value={tenureSlider}
              onChange={(e) => handleSliderTenure(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-purple-500"
            />
            <div className="flex justify-between text-xs text-white/30">
              <span>1 {t('emi.monthly').toLowerCase()}</span>
              <span>360 {t('emi.monthly').toLowerCase()}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCalculate}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all text-sm font-semibold min-h-[44px]"
            >
              <Calculator className="w-4 h-4" />
              {t('emi.calculate')}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              {t('emi.reset')}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {showResults && results ? (
            <>
              {/* Monthly EMI - Highlighted */}
              <div className="glass-card p-6 relative overflow-hidden glow-green">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 text-center">
                  <p className="text-sm text-white/50 uppercase tracking-wider mb-2">{t('emi.monthlyEmi')}</p>
                  <p className="text-4xl lg:text-5xl font-bold text-emerald-400">
                    {formatCurrency(results.emi)}
                  </p>
                  <p className="text-xs text-white/30 mt-2">/ {t('emi.monthly').toLowerCase()}</p>
                </div>
              </div>

              {/* Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="glass-card p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                  <p className="text-xs text-white/40 mb-1">{t('emi.principalAmount')}</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(results.principal)}</p>
                </div>
                <div className="glass-card p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <p className="text-xs text-white/40 mb-1">{t('emi.totalInterest')}</p>
                  <p className="text-lg font-bold text-blue-400">{formatCurrency(results.totalInterest)}</p>
                </div>
                <div className="glass-card p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <p className="text-xs text-white/40 mb-1">{t('emi.totalPayment')}</p>
                  <p className="text-lg font-bold text-purple-400">{formatCurrency(results.totalPayment)}</p>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-white mb-4">{t('emi.breakdown')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((_entry, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [formatCurrency(Number(value)), ''] as unknown as [string, string]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string) => (
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Formula Display */}
              <div className="glass-card p-4 bg-white/[0.02]">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white/70">{t('emi.formula')}</p>
                    <p className="text-sm font-mono text-emerald-400 bg-white/5 px-3 py-2 rounded-lg">
                      {t('emi.formulaDesc')}
                    </p>
                    <div className="text-xs text-white/40 space-y-0.5">
                      <p>{t('emi.whereP')}</p>
                      <p>{t('emi.whereR')}</p>
                      <p>{t('emi.whereN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Placeholder */
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Calculator className="w-10 h-10 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">{t('emi.title')}</p>
              <p className="text-white/20 text-xs mt-1">
                {t('emi.projectAmount')}, {t('emi.interestRate')}, {t('emi.tenure')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
