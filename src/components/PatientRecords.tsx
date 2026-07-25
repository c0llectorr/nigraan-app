import React, { useState } from 'react';
import { Visit, Child } from '../types';
import { Search, ShieldAlert, AlertTriangle, CheckCircle2, User } from 'lucide-react';

interface PatientRecordsProps {
  visits: Visit[];
  children: Child[];
  onSelectVisit: (visit: Visit) => void;
}

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  visits,
  children,
  onSelectVisit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');

  const getChildForVisit = (childId: string) => children.find((c) => c.id === childId);

  const filteredVisits = visits.filter((v) => {
    const child = getChildForVisit(v.childId);
    const matchesSearch =
      child?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child?.guardianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child?.householdId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterLevel === 'ALL' || v.assessment.classification === filterLevel;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-[#0058bd]" />
            <span>Patient Records & Field History</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete database of assessed children and past visit logs.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search child name, guardian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#0058bd] w-48 sm:w-64"
            />
          </div>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium rounded-xl px-3 py-1.5 outline-none focus:border-[#0058bd]"
          >
            <option value="ALL">All Triage Colors</option>
            <option value="RED">RED Only</option>
            <option value="YELLOW">YELLOW Only</option>
            <option value="GREEN">GREEN Only</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Child & Demographics</th>
              <th className="py-3 px-3">Vitals</th>
              <th className="py-3 px-3">Classification</th>
              <th className="py-3 px-3">Detected Danger Signs</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredVisits.map((visit) => {
              const child = getChildForVisit(visit.childId);
              const isRed = visit.assessment.classification === 'RED';
              const isYellow = visit.assessment.classification === 'YELLOW';

              return (
                <tr
                  key={visit.id}
                  onClick={() => onSelectVisit(visit)}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                >
                  <td className="py-3.5 px-3 text-xs text-slate-600 font-medium whitespace-nowrap">
                    {new Date(visit.visitDate).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{child?.name}</div>
                    <div className="text-xs text-slate-500">
                      {child?.ageMonths}m • {child?.guardianName} ({child?.householdId})
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-xs font-mono text-slate-700">
                    {visit.vitals.temperatureC}°C | {visit.vitals.respiratoryRateBpm} bpm
                  </td>

                  <td className="py-3.5 px-3">
                    {isRed && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>RED</span>
                      </span>
                    )}
                    {isYellow && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>YELLOW</span>
                      </span>
                    )}
                    {!isRed && !isYellow && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>GREEN</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-xs text-slate-600">
                    {visit.assessment.dangerSigns.length > 0 ? (
                      visit.assessment.dangerSigns.map(d => d.nameEn).join(', ')
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button className="text-xs font-bold text-[#0058bd] hover:underline">
                      View Slip
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

