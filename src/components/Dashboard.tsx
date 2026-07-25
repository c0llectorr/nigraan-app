import React from 'react';
import { Visit, Child } from '../types';
import { LayoutDashboard, Users, FileText, Settings, Plus, RotateCcw, Calendar, MapPin, Radio, Smile } from 'lucide-react';

interface DashboardProps {
  visits: Visit[];
  children: Child[];
  onNewVisit: () => void;
  onSelectVisit: (visit: Visit) => void;
  onGoToRecheck: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  visits,
  children,
  onNewVisit,
  onSelectVisit,
  onGoToRecheck,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const rechecksDueToday = visits.filter(
    (v) => v.assessment.recheckDueDate === todayStr || v.status === 'recheck_pending'
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Sidebar Drawer */}
      <aside className="w-full lg:w-64 bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shrink-0 shadow-xs space-y-6">
        <div className="space-y-6">
          {/* User Profile Badge */}
          <div className="flex items-center space-x-3 bg-slate-200/60 p-3 rounded-xl border border-slate-300/40">
            <div className="w-10 h-10 rounded-xl bg-[#0058bd] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
              HW
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Health Worker</h3>
              <p className="text-[11px] text-slate-500 font-medium">Offline Mode Active</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-[#86f898] text-[#004a1b] shadow-xs">
              <LayoutDashboard className="w-4 h-4 text-[#004a1b]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onGoToRecheck()}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Patients</span>
            </button>

            <button
              onClick={() => onGoToRecheck()}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Referrals</span>
            </button>

            <button
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200/60 transition"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Start New Visit Action Button */}
        <button
          onClick={onNewVisit}
          className="w-full py-3 bg-[#0058bd] hover:bg-[#004899] text-white font-bold text-xs rounded-full shadow-md transition flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Visit</span>
        </button>
      </aside>

      {/* Main Right Content Panel */}
      <div className="flex-1 w-full space-y-6">
        {/* Top Hero Banner & Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Hero Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0058bd] tracking-tight">
                Nigraan
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                Your AI-driven clinical partner, providing diagnostic support and patient tracking even in zero-connectivity environments.
              </p>
            </div>

            <div>
              <button
                onClick={onNewVisit}
                className="px-6 py-3 bg-[#0058bd] hover:bg-[#004899] text-white font-bold text-xs rounded-full shadow-md transition inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Visit</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="space-y-4">
            {/* Patients Today Card */}
            <div className="bg-[#86f898] border border-emerald-300/60 rounded-2xl p-5 text-[#004018] shadow-xs flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">PATIENTS TODAY</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black">12</span>
                <span className="text-xs font-semibold opacity-90">visits completed</span>
              </div>
            </div>

            {/* Pending Tasks Card */}
            <div className="bg-[#866a00] border border-amber-600/40 rounded-2xl p-5 text-white shadow-xs flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-90">PENDING TASKS</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black">{rechecksDueToday.length || 3}</span>
                <span className="text-xs font-semibold opacity-90">rechecks due</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recheck Due Today Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recheck Due Today</h2>
            <button
              onClick={onGoToRecheck}
              className="text-xs font-bold text-[#0058bd] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recheck Card 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Smile className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Stable
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ahmad</h3>
                  <p className="text-xs text-slate-500 font-medium">2y • Male</p>
                </div>

                <div className="text-xs text-slate-500 flex items-center space-x-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last Visit: Oct 24, 2023</span>
                </div>
              </div>

              <button
                onClick={onGoToRecheck}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recheck</span>
              </button>
            </div>

            {/* Recheck Card 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Smile className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Follow-up
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">Sara</h3>
                  <p className="text-xs text-slate-500 font-medium">18m • Female</p>
                </div>

                <div className="text-xs text-slate-500 flex items-center space-x-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last Visit: Oct 25, 2023</span>
                </div>
              </div>

              <button
                onClick={onGoToRecheck}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recheck</span>
              </button>
            </div>

            {/* Recheck Card 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Smile className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Stable
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">Zain</h3>
                  <p className="text-xs text-slate-500 font-medium">3y • Male</p>
                </div>

                <div className="text-xs text-slate-500 flex items-center space-x-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last Visit: Oct 22, 2023</span>
                </div>
              </div>

              <button
                onClick={onGoToRecheck}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recheck</span>
              </button>
            </div>
          </div>
        </div>

        {/* Community Coverage Map Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-xs h-48 bg-slate-800 text-white p-6 flex flex-col justify-between">
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>

          <div className="relative z-10 flex justify-end">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-slate-700 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE TRACKING</span>
            </span>
          </div>

          <div className="relative z-10 space-y-1">
            <h3 className="text-xl font-bold text-white tracking-wide">Community Coverage</h3>
            <p className="text-xs text-slate-300 font-medium">
              Currently monitoring 42 households in Sectors G-9 and G-10.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

