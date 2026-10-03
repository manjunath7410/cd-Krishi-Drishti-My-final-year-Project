import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calculator,
  ShieldCheck,
  AlertCircle,
  BarChart2,
  Info,
} from 'lucide-react';

interface CommodityTrend {
  crop: string;
  mandi: string;
  currentPrice: number; // per quintal
  projectedPrice: number; // in 10-14 days
  msp: number; // govt minimum support price
  recommendation: 'HOLD' | 'SELL';
  gainPercent: number;
  confidence: number;
  forecastWindow: string;
  source: string;
  updatedAt: string;
  reason: string;
  trend: number[]; // 7-day sparkline prices
}

const COMMODITY_TRENDS: CommodityTrend[] = [
  {
    crop: 'Cotton (Kapas)',
    mandi: 'Wardha APMC',
    currentPrice: 7150,
    projectedPrice: 7680,
    msp: 7121,
    recommendation: 'HOLD',
    gainPercent: 7.4,
    confidence: 89,
    forecastWindow: '10–14 Days',
    source: 'Agmarknet / APMC Wardha Daily Board',
    updatedAt: 'Today 08:30 AM',
    reason: 'Spinning mill demand rebounding + delayed export arrivals from Gujarat.',
    trend: [6980, 7050, 7120, 7150, 7290, 7450, 7680],
  },
  {
    crop: 'Soybean (Yellow)',
    mandi: 'Nagpur APMC',
    currentPrice: 4720,
    projectedPrice: 5080,
    msp: 4892,
    recommendation: 'HOLD',
    gainPercent: 7.6,
    confidence: 86,
    forecastWindow: '7–12 Days',
    source: 'Agmarknet / APMC Nagpur Daily Board',
    updatedAt: 'Today 09:15 AM',
    reason: 'Import duty hikes on crude palm oil supporting domestic soymeal demand.',
    trend: [4620, 4650, 4700, 4720, 4850, 4960, 5080],
  },
  {
    crop: 'Onion (Red)',
    mandi: 'Nashik / Lasalgaon',
    currentPrice: 2450,
    projectedPrice: 2180,
    msp: 1950,
    recommendation: 'SELL',
    gainPercent: -11.0,
    confidence: 91,
    forecastWindow: '5–10 Days',
    source: 'Agmarknet / Lasalgaon APMC Board',
    updatedAt: 'Today 08:00 AM',
    reason: 'Heavy late Kharif arrivals entering market this week. Price softening expected.',
    trend: [2650, 2600, 2520, 2450, 2350, 2260, 2180],
  },
  {
    crop: 'Wheat (Sharbati)',
    mandi: 'Sehore APMC',
    currentPrice: 2850,
    projectedPrice: 2980,
    msp: 2275,
    recommendation: 'HOLD',
    gainPercent: 4.5,
    confidence: 82,
    forecastWindow: '14 Days',
    source: 'Agmarknet / Sehore APMC Board',
    updatedAt: 'Today 10:00 AM',
    reason: 'FCI buffer stocks tight; private flour mills bidding above state MSP.',
    trend: [2780, 2810, 2830, 2850, 2890, 2940, 2980],
  },
  {
    crop: 'Tomato (Hybrid)',
    mandi: 'Kolar APMC',
    currentPrice: 1650,
    projectedPrice: 1920,
    msp: 1200,
    recommendation: 'HOLD',
    gainPercent: 16.3,
    confidence: 85,
    forecastWindow: '7–10 Days',
    source: 'Agmarknet / Kolar Market Yard',
    updatedAt: 'Today 07:45 AM',
    reason: 'Heavy rainfall in Southern belts damaged standing nursery transplants.',
    trend: [1420, 1500, 1580, 1650, 1730, 1840, 1920],
  },
];

export const MandiPricePredictor: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<CommodityTrend>(COMMODITY_TRENDS[0]);
  const [quantityQuintals, setQuantityQuintals] = useState<number>(35);

  const priceDiffPerQtl = selectedCrop.projectedPrice - selectedCrop.currentPrice;
  const estimatedDiffTotal = priceDiffPerQtl * quantityQuintals;
  const isPositiveGain = priceDiffPerQtl > 0;

  const quickQuantities = [10, 25, 35, 50, 100];

  return (
    <div
      className="bg-white rounded-2xl border border-[#E3EBE6] p-5 shadow-[0_1px_3px_rgba(16,35,29,0.04)]"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* 1. Header: AI Mandi Price Forecast */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#10231D]">AI Mandi Price Forecast</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8FBF3] text-[#007A48] border border-[#B3F0D2]">
              Live APMC
            </span>
          </div>
          <p className="text-xs text-[#68756F] mt-0.5">
            Source: {selectedCrop.source} • {selectedCrop.updatedAt}
          </p>
        </div>

        {/* Confidence Badge */}
        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-[#68756F] block">Confidence</span>
          <span className="text-sm font-extrabold text-[#003D2B]">
            {selectedCrop.confidence}% Match
          </span>
        </div>
      </div>

      {/* 2. Crop Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {COMMODITY_TRENDS.map((c) => {
          const isSelected = selectedCrop.crop === c.crop;
          return (
            <button
              key={c.crop}
              onClick={() => setSelectedCrop(c)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#003D2B] text-white border-[#003D2B] shadow-sm'
                  : 'bg-[#F7FAF8] text-[#10231D] border-[#E3EBE6] hover:bg-[#EBF1EE]'
              }`}
            >
              {c.crop.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* 3. APMC Card: Today's Rate, Projected, Govt MSP, Market Insight */}
      <div className="bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl p-3.5 mb-4">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E3EBE6]">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#68756F] tracking-wider block">
              {selectedCrop.mandi}
            </span>
            <h4 className="text-base font-bold text-[#10231D]">{selectedCrop.crop}</h4>
          </div>

          {/* Action Recommendation Tag */}
          <div
            className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 border ${
              selectedCrop.recommendation === 'HOLD'
                ? 'bg-[#E8FBF3] text-[#007A48] border-[#B3F0D2]'
                : 'bg-[#FFF9E6] text-[#996B00] border-[#FCE39E]'
            }`}
          >
            {selectedCrop.recommendation === 'HOLD' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>
              {selectedCrop.recommendation} ({selectedCrop.gainPercent > 0 ? `+${selectedCrop.gainPercent}%` : `${selectedCrop.gainPercent}%`})
            </span>
          </div>
        </div>

        {/* 3 Distinct Metric Blocks: Today's Rate, Projected, Govt MSP */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* A. TODAY'S RATE */}
          <div className="bg-white rounded-xl p-2.5 border border-[#E3EBE6]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B86B]" />
              <span className="text-[10px] font-bold text-[#68756F] uppercase">Today's Rate</span>
            </div>
            <div className="text-base font-bold text-[#10231D]">
              ₹{selectedCrop.currentPrice.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#68756F]">per quintal</span>
          </div>

          {/* B. PROJECTED */}
          <div className="bg-white rounded-xl p-2.5 border-2 border-[#00B86B] relative">
            <div className="text-[10px] font-bold text-[#007A48] uppercase mb-1">
              Projected ({selectedCrop.forecastWindow})
            </div>
            <div className="text-base font-extrabold text-[#003D2B]">
              ₹{selectedCrop.projectedPrice.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#007A48] font-semibold">
              {priceDiffPerQtl >= 0 ? `+₹${priceDiffPerQtl}` : `-₹${Math.abs(priceDiffPerQtl)}`}
            </span>
          </div>

          {/* C. GOVT MSP */}
          <div className="bg-white rounded-xl p-2.5 border border-[#E3EBE6]">
            <div className="text-[10px] font-bold text-[#68756F] uppercase mb-1">Govt MSP</div>
            <div className="text-base font-bold text-[#68756F]">
              ₹{selectedCrop.msp.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#68756F]">Official floor</span>
          </div>
        </div>

        {/* Market Insight */}
        <div className="mt-3 bg-white p-2.5 rounded-lg border border-[#E3EBE6] text-xs text-[#68756F]">
          <strong className="text-[#10231D]">Market Insight: </strong>
          {selectedCrop.reason}
        </div>
      </div>

      {/* 4. Farmer Net Profit Calculator */}
      <div className="bg-white border border-[#E3EBE6] rounded-xl p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Calculator size={16} className="text-[#00B86B]" />
            <h5 className="text-xs font-bold text-[#10231D]">Farmer Net Profit Calculator</h5>
          </div>
          <span className="text-[11px] text-[#68756F] font-medium">
            ≈ {(quantityQuintals * 100).toLocaleString()} kg
          </span>
        </div>

        {/* Obvious & Editable Input Field + Quick Quantity Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
          <div className="flex items-center border border-[#E3EBE6] rounded-xl px-3 py-1.5 bg-[#F7FAF8] flex-1">
            <span className="text-xs font-bold text-[#68756F] mr-2">Quantity:</span>
            <input
              type="number"
              min="1"
              max="1000"
              value={quantityQuintals}
              onChange={(e) => setQuantityQuintals(Math.max(1, Number(e.target.value) || 1))}
              className="w-full bg-transparent font-bold text-sm text-[#10231D] outline-none"
            />
            <span className="text-xs font-bold text-[#68756F] ml-2">Quintals</span>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-1">
            {quickQuantities.map((q) => (
              <button
                key={q}
                onClick={() => setQuantityQuintals(q)}
                className={`min-h-[36px] px-2.5 rounded-lg text-xs font-bold transition-all border ${
                  quantityQuintals === q
                    ? 'bg-[#E8FBF3] text-[#007A48] border-[#B3F0D2]'
                    : 'bg-[#F7FAF8] text-[#68756F] border-[#E3EBE6] hover:bg-[#EBF1EE]'
                }`}
              >
                {q}q
              </button>
            ))}
          </div>
        </div>

        {/* Transparent Calculation Breakdown */}
        <div className="bg-[#F7FAF8] p-3 rounded-xl border border-[#E3EBE6] text-xs">
          <div className="flex items-center justify-between text-[#68756F] mb-1">
            <span>Calculation Formula:</span>
            <span className="font-mono text-[11px]">
              (₹{selectedCrop.projectedPrice} - ₹{selectedCrop.currentPrice}) × {quantityQuintals} qtl
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E3EBE6] text-xs">
            <span className="font-semibold text-[#10231D]">
              Estimated Differential if Held:
            </span>
            <span
              className={`font-black text-sm ${
                isPositiveGain ? 'text-[#007A48]' : 'text-[#D64545]'
              }`}
            >
              {isPositiveGain ? `+₹${estimatedDiffTotal.toLocaleString()}` : `-₹${Math.abs(estimatedDiffTotal).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Disclaimer: Never imply guaranteed profit */}
        <div className="flex items-start gap-1.5 mt-2.5 text-[11px] text-[#68756F] leading-tight">
          <Info size={12} className="shrink-0 mt-0.5 text-[#E6A000]" />
          <span>
            Market estimate based on historical APMC arrivals and weather models. Commodity prices fluctuate with real market conditions and are not guaranteed.
          </span>
        </div>
      </div>
    </div>
  );
};

export default MandiPricePredictor;
