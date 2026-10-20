import React, { useState } from 'react';
import {
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  Download,
  RotateCcw,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { IncomeSourceConfig, LedgerEntry } from '../utils/finance';

interface IOS27SettingsViewProps {
  currencySymbol: string;
  onChangeCurrency: (symbol: string) => void;
  entries: LedgerEntry[];
  incomeSources: IncomeSourceConfig[];
  onResetDemoData: () => void;
  onClearAllData: () => void;
}

const CURRENCY_OPTIONS = [
  { symbol: '$', label: 'USD ($)' },
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: '€', label: 'EUR (€)' },
  { symbol: '£', label: 'GBP (£)' },
  { symbol: '¥', label: 'JPY (¥)' },
];

export const IOS27SettingsView: React.FC<IOS27SettingsViewProps> = ({
  currencySymbol,
  onChangeCurrency,
  entries,
  incomeSources,
  onResetDemoData,
  onClearAllData,
}) => {
  const { isInstallable, isInstalled, isIOS, isOnline, swRegistered, install } = usePWAInstall();
  const [showIOSInstallSheet, setShowIOSInstallSheet] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const handleExportJSON = () => {
    const payload = {
      app: 'Koko iOS 27 Salary & Expense PWA',
      exportedAt: new Date().toISOString(),
      currencySymbol,
      incomeSources,
      entries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `koko-salary-expenses-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusFeedback('Exported ledger backup as JSON.');
  };

  return (
    <div className="space-y-6">
      {/* iOS 27 PWA Architecture & Home Screen Install Card */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#141518] text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#5A5D65]">
                <span>Apple WebKit Standalone</span>
                <span aria-hidden="true">·</span>
                <span>iOS 27 Spec</span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[#141518]">
                iPhone PWA & iOS 27 Settings
              </h1>
            </div>
          </div>

          {/* In-App Install Action Button */}
          {!isInstalled && (
            <button
              type="button"
              onClick={async () => {
                if (isInstallable) {
                  await install();
                } else {
                  setShowIOSInstallSheet(true);
                }
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>{isIOS ? 'Install on iPhone' : 'Install App to Home Screen'}</span>
            </button>
          )}
        </div>

        {statusFeedback && (
          <div className="rounded-2xl bg-[#ECFDF5] border border-[#10B981]/30 px-4 py-3 text-xs font-medium text-[#047857]">
            {statusFeedback}
          </div>
        )}

        {/* Active iOS 27 Meta & Manifest Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-[#F6F5F0] border border-black/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#141518]">Full-Screen Viewport Cover</span>
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="font-mono-num text-[11px] text-[#5A5D65] mt-1">
              viewport-fit=cover + env(safe-area-inset-*)
            </p>
            <p className="text-xs text-[#5A5D65] mt-1">
              Extends edge-to-edge behind the iPhone Dynamic Island and Home Indicator bar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F5F0] border border-black/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#141518]">Apple Web App Capable</span>
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="font-mono-num text-[11px] text-[#5A5D65] mt-1">
              apple-mobile-web-app-status-bar-style: black-translucent
            </p>
            <p className="text-xs text-[#5A5D65] mt-1">
              Launches standalone from iOS 27 Home Screen without Safari address or bottom bars.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F5F0] border border-black/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#141518]">Offline Service Worker & Icons</span>
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="font-mono-num text-[11px] text-[#5A5D65] mt-1">
              180px Apple Touch PNG · 192px & 512px Maskable
            </p>
            <p className="text-xs text-[#5A5D65] mt-1">
              {swRegistered ? 'Service worker active' : 'Local storage persistence active'} ·{' '}
              {isOnline ? 'Online' : 'Offline Mode'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F5F0] border border-black/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#141518]">iOS 27 Safari Setup Steps</span>
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            </div>
            <p className="text-xs text-[#5A5D65] mt-1">
              In iOS 27 Settings &gt; Apps &gt; Safari, ensure Web Apps / Standalone mode is enabled,
              then tap Share &gt; Add to Home Screen.
            </p>
          </div>
        </div>
      </div>

      {/* Currency & Preferences */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#141518]" />
          <h2 className="font-display text-lg font-bold text-[#141518]">
            Currency Symbol
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {CURRENCY_OPTIONS.map((opt) => (
            <button
              key={opt.symbol}
              type="button"
              onClick={() => {
                onChangeCurrency(opt.symbol);
                setStatusFeedback(`Currency switched to ${opt.label}`);
              }}
              className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                currencySymbol === opt.symbol
                  ? 'bg-[#141518] text-white'
                  : 'bg-[#F6F5F0] text-[#141518] hover:bg-[#EFECE6]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Backup & Reset */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#141518]">
          Vault Data & Demo Controls
        </h2>
        <p className="text-xs text-[#5A5D65]">
          All salaries, income sources, and expenses are persisted automatically in your device&apos;s
          local storage.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-xs font-semibold text-[#141518] flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onResetDemoData();
              setStatusFeedback('Restored realistic multi-income demo entries.');
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#F6F5F0] hover:bg-[#EFECE6] text-xs font-semibold text-[#141518] flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClearAllData();
              setStatusFeedback('Cleared all entries. Ready for a fresh start!');
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-xs font-semibold text-[#BE123C] flex items-center gap-2 cursor-pointer"
          >
            <span>Zero Out All Entries</span>
          </button>
        </div>
      </div>

      {/* Guided iOS 27 Add to Home Screen Modal */}
      {showIOSInstallSheet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-guide-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 border border-black/10 shadow-xl space-y-4">
            <h3 id="ios-install-guide-title" className="font-display text-lg font-bold text-[#141518]">
              Install Koko on iPhone (iOS 27)
            </h3>
            <ol className="space-y-3 text-xs sm:text-sm text-[#5A5D65]">
              <li className="flex items-start gap-2.5">
                <Share className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  1. Tap the <strong>Share</strong> icon in the bottom iOS 27 Safari floating bar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <PlusSquare className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  2. Scroll down and select <strong>Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  3. Ensure <strong>Open as Web App</strong> toggle is turned ON and tap{' '}
                  <strong>Add</strong>.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSInstallSheet(false)}
              className="w-full min-h-[44px] rounded-2xl bg-[#141518] text-white text-xs font-semibold cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
