import React from 'react';
import { X, AlertOctagon, HeartPulse, BookOpen } from 'lucide-react';
import { IMNCI_CUTOFFS } from '../data/imnciRules';

interface IMNCIGuideModalProps {
  onClose: () => void;
}

export const IMNCIGuideModal: React.FC<IMNCIGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0058bd] flex items-center justify-center border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">WHO IMNCI Clinical Protocol Guide</h2>
              <p className="text-xs text-slate-500 font-medium">Official Decision Protocol for Field Assessments</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Respiratory Cutoffs */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-[#0058bd] uppercase tracking-wider flex items-center space-x-1.5">
            <HeartPulse className="w-4 h-4" />
            <span>Fast Breathing Cutoff Criteria (Pneumonia Detection)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="font-bold text-slate-900 block">Infant (2 to 11 months)</span>
              <span className="text-amber-600 font-black text-sm block mt-1">
                ≥ {IMNCI_CUTOFFS.INFANT_FAST_BREATHING_BPM} breaths / min
              </span>
              <span className="text-slate-500 text-[11px]">Classify as Pneumonia (Yellow)</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="font-bold text-slate-900 block">Child (12 to 59 months)</span>
              <span className="text-amber-600 font-black text-sm block mt-1">
                ≥ {IMNCI_CUTOFFS.CHILD_FAST_BREATHING_BPM} breaths / min
              </span>
              <span className="text-slate-500 text-[11px]">Classify as Pneumonia (Yellow)</span>
            </div>
          </div>
        </div>

        {/* Danger Signs Breakdown */}
        <div className="space-y-3 text-xs">
          <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4" />
            <span>General Danger Signs (Require Immediate RED Triage)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <strong className="text-red-900 block font-bold">1. Unable to drink or breastfeed</strong>
              <span className="text-xs text-red-800">Child is too weak to suck or swallow fluids.</span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <strong className="text-red-900 block font-bold">2. Vomits everything</strong>
              <span className="text-xs text-red-800">Child cannot keep any food or fluid in the stomach.</span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <strong className="text-red-900 block font-bold">3. Convulsions / Seizures</strong>
              <span className="text-xs text-red-800">History of fits or abnormal jerking during illness.</span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <strong className="text-red-900 block font-bold">4. Lethargic or Unconscious</strong>
              <span className="text-xs text-red-800">Child does not respond to voice, touch, or pain.</span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl col-span-1 sm:col-span-2">
              <strong className="text-red-900 block font-bold">5. Lower Chest Indrawing</strong>
              <span className="text-xs text-red-800">Lower chest wall moves inward during inhalation. Strong indicator of severe pneumonia.</span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0058bd] hover:bg-[#004899] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

