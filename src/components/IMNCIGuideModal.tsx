import React from 'react';
import { Activity, X, AlertOctagon, HeartPulse, ShieldCheck, BookOpen } from 'lucide-react';
import { IMNCI_CUTOFFS } from '../data/imnciRules';

interface IMNCIGuideModalProps {
  onClose: () => void;
}

export const IMNCIGuideModal: React.FC<IMNCIGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">WHO IMNCI Clinical Protocol Guide</h2>
              <p className="text-xs text-slate-400">Official Decision Protocol for Lady Health Workers (Field Standard)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Respiratory Cutoffs */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4" />
            <span>Fast Breathing Cutoff Criteria (Pneumonia Detection)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
              <span className="font-bold text-white block">Infant (2 to 11 months)</span>
              <span className="text-amber-400 font-extrabold text-sm block mt-1">
                ≥ {IMNCI_CUTOFFS.INFANT_FAST_BREATHING_BPM} breaths / min
              </span>
              <span className="text-slate-400 text-[11px]">Classify as Pneumonia (Yellow)</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
              <span className="font-bold text-white block">Child (12 to 59 months)</span>
              <span className="text-amber-400 font-extrabold text-sm block mt-1">
                ≥ {IMNCI_CUTOFFS.CHILD_FAST_BREATHING_BPM} breaths / min
              </span>
              <span className="text-slate-400 text-[11px]">Classify as Pneumonia (Yellow)</span>
            </div>
          </div>
        </div>

        {/* Danger Signs Breakdown */}
        <div className="space-y-3 text-xs">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4" />
            <span>General Danger Signs (Require Immediate RED Triage)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
              <strong className="text-red-300 block">1. Unable to drink or breastfeed</strong>
              <span>Child is too weak to suck or swallow fluids.</span>
            </div>
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
              <strong className="text-red-300 block">2. Vomits everything</strong>
              <span>Child cannot keep any food or fluid in the stomach.</span>
            </div>
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
              <strong className="text-red-300 block">3. Convulsions / Seizures</strong>
              <span>History of fits or abnormal jerking during illness.</span>
            </div>
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
              <strong className="text-red-300 block">4. Lethargic or Unconscious</strong>
              <span>Child does not respond to voice, touch, or pain.</span>
            </div>
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl col-span-1 sm:col-span-2">
              <strong className="text-red-300 block">5. Lower Chest Indrawing (پسلی دھنسنا)</strong>
              <span>Lower chest wall moves inward during inhalation. Strong indicator of severe pneumonia.</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:bg-emerald-400 transition"
          >
            Understood (سمجھ آ گیا)
          </button>
        </div>
      </div>
    </div>
  );
};
