import React from 'react';
import { Visit, Child } from '../types';
import { Clock, AlertTriangle, ArrowRight, Calendar, Phone, Home, ShieldAlert } from 'lucide-react';

interface RecheckListProps {
  visits: Visit[];
  children: Child[];
  onSelectVisit: (visit: Visit) => void;
  onNewVisit: () => void;
}

export const RecheckList: React.FC<RecheckListProps> = ({
  visits,
  children,
  onSelectVisit,
  onNewVisit,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingRechecks = visits.filter(
    (v) => v.status === 'recheck_pending' || v.assessment.classification === 'YELLOW'
  );

  const getChildForVisit = (childId: string) => children.find((c) => c.id === childId);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Recheck Due Tracker (دوبارہ معائنہ کی فہرست)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory 2-day follow-up assessments for Yellow-classified cases (pneumonia, prolonged fever, diarrhoea).
          </p>
        </div>

        <button
          onClick={onNewVisit}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
        >
          + New Assessment
        </button>
      </div>

      <div className="space-y-4">
        {pendingRechecks.length > 0 ? (
          pendingRechecks.map((visit) => {
            const child = getChildForVisit(visit.childId);
            const isDueToday = visit.assessment.recheckDueDate === todayStr;

            return (
              <div
                key={visit.id}
                onClick={() => onSelectVisit(visit)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-md ${
                  isDueToday
                    ? 'bg-amber-950/30 border-amber-500/80 hover:border-amber-400'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-white">{child?.name || 'Child'}</span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {child?.ageMonths} months
                      </span>
                      {isDueToday && (
                        <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">
                          DUE TODAY!
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 flex items-center space-x-4">
                      <span>Guardian: <strong>{child?.guardianName}</strong></span>
                      <span>Household: <strong>{child?.householdId}</strong></span>
                      {child?.phone && <span className="flex items-center space-x-1"><Phone className="w-3 h-3 text-slate-400" /><span>{child.phone}</span></span>}
                    </div>

                    <p className="text-xs text-slate-400 italic bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 mt-2">
                      "{visit.assessment.explanationUrdu}"
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end space-y-2 shrink-0">
                    <div className="text-xs text-amber-300 font-bold bg-amber-950/50 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recheck Due: {visit.assessment.recheckDueDate || 'Pending'}</span>
                    </div>

                    <button className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
                      <span>Inspect Visit Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center text-slate-400 text-sm space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="font-semibold">No pending rechecks due today.</p>
            <p className="text-xs text-slate-500">All Yellow-classified cases have been followed up or resolved.</p>
          </div>
        )}
      </div>
    </div>
  );
};
