import React from 'react';
import { RefreshCw, User, BookOpen } from 'lucide-react';

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <span className="font-extrabold text-2xl text-[#0058bd] tracking-tight">Nigraan</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-md border border-slate-200">
              Offline Clinical Copilot
            </span>
          </div>

          {/* Right Action Icons & User */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenGuide}
              className="p-2 text-slate-600 hover:text-[#0058bd] hover:bg-slate-100 rounded-lg transition"
              title="WHO IMNCI Rules Guide"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-slate-600 hover:text-[#0058bd] hover:bg-slate-100 rounded-lg transition"
              title="Sync / Connectivity Status"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm">
              <div className="w-8 h-8 rounded-full bg-[#0058bd] text-white flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Dr. Ahmed</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

