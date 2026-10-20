import React, { useState } from 'react';
import { Sparkles, Volume2 } from 'lucide-react';
import {
  formatINR,
  type FinancialSummary,
  type MascotMood,
} from '../utils/finance';

interface KokoMascotProps {
  mood: MascotMood;
  headline: string;
  subline: string;
  badgeText: string;
  summary: FinancialSummary;
  onQuickAddIncome: () => void;
  onOpenSplitup: () => void;
}

export const KokoMascot: React.FC<KokoMascotProps> = ({
  mood,
  headline,
  subline,
  badgeText,
  summary,
  onOpenSplitup,
}) => {
  const [pokeIndex, setPokeIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  const dynamicQuips = [
    subline,
    summary.topIncomeSource
      ? `Your #1 stream is ${summary.topIncomeSource.name} (${summary.topIncomeSource.percentageOfIncome}% of total earned).`
      : 'Log your Stipend or Consulting income to see your splitup.',
    summary.topExpenseCategory
      ? `Largest expense bucket: ${summary.topExpenseCategory.name} (${formatINR(summary.topExpenseCategory.totalAmount)}).`
      : 'No expenses logged yet — 100% of your income is untouched!',
    `Net retention rate: ${summary.retentionRatio}% kept (${formatINR(summary.balanceLeft)} balance left).`,
  ];

  const handlePokeMascot = () => {
    setIsBouncing(true);
    setPokeIndex((prev) => (prev + 1) % dynamicQuips.length);
    setTimeout(() => setIsBouncing(false), 550);
  };

  const activeMessage = dynamicQuips[pokeIndex % dynamicQuips.length];

  const moodPalette: Record<
    MascotMood,
    {
      bodyFill: string;
      bellyFill: string;
      haloColor: string;
      surfaceTint: string;
      borderTint: string;
      statusText: string;
    }
  > = {
    thriving: {
      bodyFill: '#10B981',
      bellyFill: '#ECFDF5',
      haloColor: '#34D399',
      surfaceTint: 'bg-[#ECFDF5]/85',
      borderTint: 'border-[#10B981]/25',
      statusText: 'text-[#047857]',
    },
    celebrating: {
      bodyFill: '#059669',
      bellyFill: '#FEF3C7',
      haloColor: '#F59E0B',
      surfaceTint: 'bg-[#FEF3C7]/85',
      borderTint: 'border-[#F59E0B]/30',
      statusText: 'text-[#B45309]',
    },
    steady: {
      bodyFill: '#3B82F6',
      bellyFill: '#EFF6FF',
      haloColor: '#60A5FA',
      surfaceTint: 'bg-[#EFF6FF]/85',
      borderTint: 'border-[#3B82F6]/25',
      statusText: 'text-[#1D4ED8]',
    },
    mindful: {
      bodyFill: '#F59E0B',
      bellyFill: '#FFFBEB',
      haloColor: '#FBBF24',
      surfaceTint: 'bg-[#FFFBEB]/90',
      borderTint: 'border-[#F59E0B]/30',
      statusText: 'text-[#B45309]',
    },
    overdrawn: {
      bodyFill: '#F43F5E',
      bellyFill: '#FFF1F2',
      haloColor: '#FB7185',
      surfaceTint: 'bg-[#FFF1F2]/90',
      borderTint: 'border-[#F43F5E]/30',
      statusText: 'text-[#BE123C]',
    },
  };

  const theme = moodPalette[mood];

  return (
    <section
      aria-label="Koko financial companion"
      className={`relative rounded-3xl border ${theme.borderTint} ${theme.surfaceTint} p-5 transition-colors duration-300`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handlePokeMascot}
          aria-label="Tap Koko mascot for financial insight"
          className={`group relative shrink-0 w-24 h-24 rounded-2xl bg-white/90 border border-black/5 shadow-sm flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141518] active:scale-95 transition-transform ${
            isBouncing || mood === 'celebrating' ? 'animate-mascot-celebrate' : 'animate-mascot-float'
          }`}
        >
          <svg
            viewBox="0 0 140 140"
            className="w-20 h-20 overflow-visible"
            role="img"
            aria-label={`Koko mascot in ${mood} mood`}
          >
            <ellipse cx="70" cy="126" rx="34" ry="6" fill="rgba(20,21,24,0.10)" />

            <g className="origin-bottom transition-transform duration-300 group-hover:rotate-6">
              <path
                d="M70 28 C70 12, 88 4, 98 11 C92 24, 80 28, 70 28 Z"
                fill={theme.haloColor}
              />
              <path
                d="M70 28 C70 14, 54 6, 44 13 C50 25, 60 28, 70 28 Z"
                fill={theme.bodyFill}
              />
              <path
                d="M70 33 V19"
                stroke="#141518"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>

            <path
              d="M24 78 C24 44, 44 28, 70 28 C96 28, 116 44, 116 78 C116 106, 100 120, 70 120 C40 120, 24 106, 24 78 Z"
              fill={theme.bodyFill}
              stroke="#141518"
              strokeWidth="3.5"
            />

            <ellipse
              cx="70"
              cy="82"
              rx="34"
              ry="29"
              fill={theme.bellyFill}
            />

            <path
              d={
                mood === 'celebrating' || mood === 'thriving'
                  ? 'M25 74 C14 64, 14 54, 23 52'
                  : 'M25 76 C16 80, 16 88, 25 90'
              }
              stroke="#141518"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={
                mood === 'celebrating' || mood === 'thriving'
                  ? 'M115 74 C126 64, 126 54, 117 52'
                  : 'M115 76 C124 80, 124 88, 115 90'
              }
              stroke="#141518"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {mood === 'celebrating' ? (
              <>
                <path
                  d="M49 72 Q55 63 61 72"
                  stroke="#141518"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M79 72 Q85 63 91 72"
                  stroke="#141518"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : mood === 'overdrawn' ? (
              <>
                <circle cx="55" cy="72" r="6.5" fill="#141518" />
                <circle cx="85" cy="72" r="6.5" fill="#141518" />
                <circle cx="53" cy="70" r="2.2" fill="#FFFFFF" />
                <circle cx="83" cy="70" r="2.2" fill="#FFFFFF" />
                <path
                  d="M103 48 C103 48, 108 56, 108 59 C108 62, 105.5 64, 103 64 C100.5 64, 98 62, 98 59 C98 56, 103 48, 103 48 Z"
                  fill="#38BDF8"
                />
              </>
            ) : (
              <>
                <circle cx="55" cy="72" r="6" fill="#141518" />
                <circle cx="85" cy="72" r="6" fill="#141518" />
                <circle cx="57" cy="70" r="2.2" fill="#FFFFFF" />
                <circle cx="87" cy="70" r="2.2" fill="#FFFFFF" />
              </>
            )}

            <ellipse cx="44" cy="80" rx="6" ry="3.5" fill="#F43F5E" fillOpacity="0.35" />
            <ellipse cx="96" cy="80" rx="6" ry="3.5" fill="#F43F5E" fillOpacity="0.35" />

            {mood === 'thriving' || mood === 'celebrating' ? (
              <path
                d="M62 82 Q70 91 78 82"
                stroke="#141518"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : mood === 'steady' ? (
              <path
                d="M64 83 Q70 87 76 83"
                stroke="#141518"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : mood === 'mindful' ? (
              <line
                x1="64"
                y1="84"
                x2="76"
                y2="84"
                stroke="#141518"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M63 87 Q70 80 77 87"
                stroke="#141518"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>

          <span className="absolute -bottom-1.5 px-2 py-0.5 rounded-md bg-[#141518] text-white text-[10px] font-medium tracking-tight whitespace-nowrap">
            Tap Koko
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap truncate">
              <span className={theme.statusText}>Koko</span>
              <span aria-hidden="true" className="text-black/30">·</span>
              <span className="text-[#5A5D65] truncate">{badgeText}</span>
            </div>
            <button
              type="button"
              onClick={handlePokeMascot}
              className="min-h-[30px] px-2 py-0.5 rounded-lg bg-white/80 hover:bg-white text-[11px] font-medium text-[#141518] border border-black/10 flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              aria-label="Next mascot tip"
            >
              <Volume2 className="w-3 h-3 text-[#5A5D65]" />
              <span>Tip {pokeIndex + 1}/{dynamicQuips.length}</span>
            </button>
          </div>

          <h2 className="font-display text-base sm:text-lg font-bold text-[#141518] leading-snug text-balance">
            {headline}
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-[#5A5D65] leading-relaxed">
            {activeMessage}
          </p>

          <div className="mt-2.5 flex items-center">
            <button
              type="button"
              onClick={onOpenSplitup}
              className="text-xs font-semibold text-[#141518] underline decoration-black/30 underline-offset-4 hover:decoration-black transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>View Stipend & Consulting Splitup</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
