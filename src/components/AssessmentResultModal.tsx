import React, { useState } from 'react';
import { Visit, Child } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, Volume2, VolumeX, FileText, ArrowLeft, Calendar, Shield, X } from 'lucide-react';

interface AssessmentResultModalProps {
  visit: Visit;
  child: Child;
  onClose: () => void;
  onGenerateReferral: () => void;
}

export const AssessmentResultModal: React.FC<AssessmentResultModalProps> = ({
  visit,
  child,
  onClose,
  onGenerateReferral,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { classification, dangerSigns, explanationUrdu, explanationEnglish, recheckDueDate } = visit.assessment;

  const isRed = classification === 'RED';
  const isYellow = classification === 'YELLOW';
  const isGreen = classification === 'GREEN';

  const handleSpeechPlay = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(explanationUrdu);
      utterance.lang = 'ur-PK';
      utterance.rate = 0.9;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0058bd] border border-blue-100">
              <Shield className="w-5 h-5 text-[#0058bd]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assessment Result • IMNCI Triage</h2>
              <p className="text-xs text-slate-500 font-medium">
                Patient: <strong className="text-slate-800">{child.name}</strong> ({child.ageMonths}m) • Guardian: {child.guardianName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Triage Badge */}
        <div
          className={`rounded-2xl p-6 text-center border shadow-xs relative overflow-hidden ${
            isRed
              ? 'bg-red-50 border-red-200 text-red-950'
              : isYellow
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            {isRed && <ShieldAlert className="w-14 h-14 text-red-600 animate-pulse" />}
            {isYellow && <AlertTriangle className="w-14 h-14 text-amber-600" />}
            {isGreen && <CheckCircle2 className="w-14 h-14 text-emerald-600" />}

            <div className="text-[11px] tracking-widest font-extrabold uppercase mt-1">
              {isRed ? 'RED TRIAGE • URGENT HOSPITAL REFERRAL' : isYellow ? 'YELLOW TRIAGE • BHU FACILITY & RECHECK' : 'GREEN TRIAGE • HOME CARE ADVICE'}
            </div>

            <h3 className="text-xl sm:text-2xl font-black">
              {isRed ? 'شدید خطرناک - فوری ہسپتال منتقل کریں' : isYellow ? 'درمیانہ درجہ - ۲ دن میں دوبارہ معائنہ لازمی' : 'معمول کی دیکھ بھال - گھر پر علاج'}
            </h3>
          </div>
        </div>

        {/* Plain Urdu Explanation Box with TTS */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Caregiver Explanation</span>
            </span>

            <button
              onClick={handleSpeechPlay}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                isPlayingAudio
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-[#0058bd] border border-slate-200 shadow-xs'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Stop Voice' : 'Play Urdu Voice'}</span>
            </button>
          </div>

          <p className="text-base text-slate-900 font-semibold leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
            "{explanationUrdu}"
          </p>

          <p className="text-xs text-slate-500 italic">
            Translation: {explanationEnglish}
          </p>

          {/* Attached Clinical Photo Thumbnail */}
          {visit.photoUrl && (
            <div className="pt-2 border-t border-slate-200 flex items-center space-x-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                <img src={visit.photoUrl} alt="Clinical photo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">📷 Attached Clinical Image</span>
                <span className="text-[11px] text-slate-500 block">Assessed via WHO IMNCI Vision Model</span>
              </div>
            </div>
          )}
        </div>

        {/* Detected Danger Signs List */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Detected Danger Signs & Criteria:
          </h4>

          {dangerSigns.length > 0 ? (
            <div className="space-y-2">
              {dangerSigns.map((ds) => (
                <div
                  key={ds.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{ds.nameUr}</span>
                    <span className="text-xs text-slate-500 block">{ds.nameEn}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      ds.severity === 'RED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ds.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white text-xs text-slate-500 italic border border-slate-200">
              No severe danger signs detected. Follow routine guidance.
            </div>
          )}

          {recheckDueDate && (
            <div className="flex items-center space-x-2 text-amber-900 text-xs font-bold bg-amber-50 p-3 rounded-xl border border-amber-200">
              <Calendar className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Mandatory Follow-up / Recheck Due Date: {recheckDueDate}</span>
            </div>
          )}
        </div>

        {/* Recommended Actions & Referral Slip Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {(isRed || isYellow) && (
            <button
              onClick={onGenerateReferral}
              className={`w-full sm:w-auto px-6 py-3 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 ${
                isRed
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Generate Referral Slip</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

