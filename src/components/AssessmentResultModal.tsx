import React, { useState } from 'react';
import { Visit, Child } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, Volume2, VolumeX, FileText, ArrowLeft, Calendar, Building, Info, Shield } from 'lucide-react';

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

  const { classification, dangerSigns, explanationUrdu, explanationEnglish, recommendedActionUrdu, recheckDueDate } = visit.assessment;

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
      utterance.lang = 'ur-PK'; // Urdu
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Assessment Result • IMNCI Triage</h2>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{child.name}</strong> ({child.ageMonths}m) • Guardian: {child.guardianName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-xl transition"
          >
            Close
          </button>
        </div>

        {/* Triage Badge */}
        <div
          className={`rounded-2xl p-6 text-center border-2 shadow-xl relative overflow-hidden ${
            isRed
              ? 'bg-red-950/60 border-red-500 text-red-100 shadow-red-900/30'
              : isYellow
              ? 'bg-amber-950/60 border-amber-500 text-amber-100 shadow-amber-900/30'
              : 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-emerald-900/30'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            {isRed && <ShieldAlert className="w-16 h-16 text-red-400 animate-pulse" />}
            {isYellow && <AlertTriangle className="w-16 h-16 text-amber-400" />}
            {isGreen && <CheckCircle2 className="w-16 h-16 text-emerald-400" />}

            <div className="text-xs tracking-widest font-extrabold uppercase mt-1">
              {isRed ? 'RED TRIAGE • URGENT HOSPITAL REFERRAL' : isYellow ? 'YELLOW TRIAGE • BHU FACILITY & RECHECK' : 'GREEN TRIAGE • HOME CARE ADVICE'}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black">
              {isRed ? 'شدید خطرناک - فوری ہسپتال منتقل کریں' : isYellow ? 'درمیانہ درجہ - ۲ دن میں دوبارہ معائنہ لازمی' : 'معمول کی دیکھ بھال - گھر پر علاج'}
            </h3>
          </div>
        </div>

        {/* Plain Urdu Explanation Box with TTS */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>سادہ اردو وضاحت (Plain Urdu Caregiver Explanation)</span>
            </span>

            <button
              onClick={handleSpeechPlay}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                isPlayingAudio
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-700 hover:bg-slate-600 text-emerald-300 border border-slate-600'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Stop Voice' : 'Play Urdu Voice (آواز سنیں)'}</span>
            </button>
          </div>

          <p className="text-base text-slate-100 font-medium leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            "{explanationUrdu}"
          </p>

          <p className="text-xs text-slate-400 italic">
            English translation: {explanationEnglish}
          </p>
        </div>

        {/* Detected Danger Signs List */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Detected WHO IMNCI Danger Signs & Criteria:
          </h4>

          {dangerSigns.length > 0 ? (
            <div className="space-y-2">
              {dangerSigns.map((ds) => (
                <div
                  key={ds.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-bold text-white block">{ds.nameUr}</span>
                    <span className="text-xs text-slate-400 block">{ds.nameEn}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      ds.severity === 'RED'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {ds.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/40 text-xs text-slate-400 italic">
              No severe danger signs detected. Follow routine guidance.
            </div>
          )}

          {recheckDueDate && (
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold bg-amber-950/30 p-3 rounded-xl border border-amber-500/30">
              <Calendar className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Mandatory Follow-up / Recheck Due Date: {recheckDueDate}</span>
            </div>
          )}
        </div>

        {/* Recommended Actions & Referral Slip Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {(isRed || isYellow) && (
            <button
              onClick={onGenerateReferral}
              className={`w-full sm:w-auto px-6 py-3 font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2 ${
                isRed
                  ? 'bg-red-500 hover:bg-red-400 text-slate-950 shadow-red-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Generate Referral Slip (ریفرل سلپ بنائیں)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
