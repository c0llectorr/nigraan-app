import React from 'react';
import { Visit, Child } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, Plus, ArrowRight, UserPlus, FileText, Activity, RefreshCw } from 'lucide-react';

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
    (v) => v.assessment.recheckDueDate === todayStr && v.status === 'recheck_pending'
  );

  const redCount = visits.filter((v) => v.assessment.classification === 'RED').length;
  const yellowCount = visits.filter((v) => v.assessment.classification === 'YELLOW').length;
  const greenCount = visits.filter((v) => v.assessment.classification === 'GREEN').length;

  const getChildForVisit = (childId: string) => {
    return children.find((c) => c.id === childId);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-medium text-xs tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Lady Health Worker Assistant • UC-14 Rahim Yar Khan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              خوش آمدید، بی بی آمنہ (LHW-3094)
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Nigraan is active in <strong>100% Offline Mode</strong>. All WHO IMNCI assessments and referral slips run locally on your device without internet.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNewVisit}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center space-x-2 text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Start New Visit (نیا معائنہ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Recheck Banner */}
      {rechecksDueToday.length > 0 && (
        <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-5 text-amber-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-amber-100">
                  {rechecksDueToday.length} Child Due for Recheck Today (آج دوبارہ معائنہ لازمی)
                </span>
                <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                  URGENT FOLLOW-UP
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Yellow-classified pneumonia/fever case requires mandatory 2-day follow up visit to prevent escalation.
              </p>
            </div>
          </div>

          <button
            onClick={onGoToRecheck}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1 shrink-0"
          >
            <span>View Recheck List</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Field Visits</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{visits.length}</div>
          <span className="text-[11px] text-slate-400">Logged locally on device</span>
        </div>

        <div className="bg-red-950/20 border border-red-800/40 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-300 uppercase">Urgent Referrals (RED)</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 mt-2">{redCount}</div>
          <span className="text-[11px] text-red-300/80">Immediate hospital referral</span>
        </div>

        <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase">Recheck Cases (YELLOW)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{yellowCount}</div>
          <span className="text-[11px] text-amber-300/80">BHU Visit & 2-day recheck</span>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300 uppercase">Home Care (GREEN)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{greenCount}</div>
          <span className="text-[11px] text-emerald-300/80">Standard home guidance</span>
        </div>
      </div>

      {/* Recent Visits Section */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Field Visit Assessments</h2>
            <p className="text-xs text-slate-400">Click any assessment to inspect details or generate/reprint referral slip</p>
          </div>

          <button
            onClick={onNewVisit}
            className="text-xs bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-medium transition"
          >
            + Add Visit
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Child & Demographics</th>
                <th className="py-3 px-3">Vitals (Temp / Resp)</th>
                <th className="py-3 px-3">Triage Classification</th>
                <th className="py-3 px-3">Action / Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {visits.map((visit) => {
                const child = getChildForVisit(visit.childId);
                const isRed = visit.assessment.classification === 'RED';
                const isYellow = visit.assessment.classification === 'YELLOW';

                return (
                  <tr
                    key={visit.id}
                    className="hover:bg-slate-700/40 transition-colors cursor-pointer"
                    onClick={() => onSelectVisit(visit)}
                  >
                    <td className="py-3.5 px-3 text-xs text-slate-300 whitespace-nowrap">
                      {new Date(visit.visitDate).toLocaleDateString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-white">{child?.name || 'Child'}</div>
                      <div className="text-xs text-slate-400">
                        {child?.ageMonths}m • {child?.guardianName} • {child?.householdId}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-xs font-mono font-medium text-slate-200">
                        {visit.vitals.temperatureC}°C | {visit.vitals.respiratoryRateBpm} bpm
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Fever: {visit.vitals.feverDays}d
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {isRed && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                          <span>RED (Urgent Hospital)</span>
                        </span>
                      )}
                      {isYellow && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>YELLOW (BHU & Recheck)</span>
                        </span>
                      )}
                      {!isRed && !isYellow && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>GREEN (Home Care)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-xs">
                      {visit.referralGenerated ? (
                        <span className="text-indigo-300 font-medium flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Referral Slip Created</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Home Care Advised</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline">
                        View & Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
