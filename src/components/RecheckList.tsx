import React from 'react';
import { Visit, Child } from '../types';
import { Clock, ArrowRight, Calendar, Phone, Plus } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#0058bd]" />
            <span>Recheck Due Tracker</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Mandatory 2-day follow-up assessments for Yellow-classified cases.
          </p>
        </div>

        <button
          onClick={onNewVisit}
          className="px-4 py-2 bg-[#0058bd] hover:bg-[#004899] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
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
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isDueToday
                    ? 'bg-amber-50/60 border-amber-300 hover:border-amber-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-slate-900">{child?.name || 'Child'}</span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {child?.ageMonths} months
                      </span>
                      {isDueToday && (
                        <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          DUE TODAY!
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex items-center space-x-4">
                      <span>Guardian: <strong className="text-slate-800">{child?.guardianName}</strong></span>
                      <span>Household: <strong className="text-slate-800">{child?.householdId}</strong></span>
                      {child?.phone && <span className="flex items-center space-x-1"><Phone className="w-3 h-3 text-slate-400" /><span>{child.phone}</span></span>}
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
                      "{visit.assessment.explanationUrdu}"
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end space-y-2 shrink-0">
                    <div className="text-xs text-amber-900 font-bold bg-amber-100 px-3 py-1 rounded-xl border border-amber-200 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>Recheck Due: {visit.assessment.recheckDueDate || 'Pending'}</span>
                    </div>

                    <button className="text-xs font-bold text-[#0058bd] hover:underline flex items-center space-x-1">
                      <span>Inspect Visit Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700">No pending rechecks due today.</p>
            <p className="text-xs text-slate-500">All Yellow-classified cases have been followed up or resolved.</p>
          </div>
        )}
      </div>
    </div>
  );
};

