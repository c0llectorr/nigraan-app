import React from 'react';
import { Shield, WifiOff, Clock, UserCheck, Award, FileText, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'new-visit' | 'recheck' | 'records' | 'guide';
  setActiveTab: (tab: 'dashboard' | 'new-visit' | 'recheck' | 'records' | 'guide') => void;
  recheckCount: number;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  recheckCount,
  onOpenGuide,
}) => {
  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white font-sans">Nigraan</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  نگران • IMNCI AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Offline Clinical Triage Companion • LHW Union Council 14
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="hidden lg:flex items-center space-x-4 text-xs">
            {/* Offline Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="font-medium">100% On-Device (Offline)</span>
            </div>

            {/* LHW Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Amina Bibi (LHW-3094)</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('new-visit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                activeTab === 'new-visit'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'
              }`}
            >
              <span>+ New Visit</span>
            </button>

            <button
              onClick={() => setActiveTab('recheck')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative flex items-center space-x-1 ${
                activeTab === 'recheck'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Rechecks</span>
              {recheckCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                  {recheckCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'records'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              History
            </button>

            <button
              onClick={onOpenGuide}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
              title="WHO IMNCI Clinical Reference"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">IMNCI Rules</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
