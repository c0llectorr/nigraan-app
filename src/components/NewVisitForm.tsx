import React, { useState, useEffect } from 'react';
import { Child, Vitals, AssessmentResult } from '../types';
import { DANGER_SIGNS_CATALOG, IMNCI_CUTOFFS } from '../data/imnciRules';
import { Mic, MicOff, Camera, AlertCircle, Sparkles, Check, User, Activity, FileText, ArrowRight } from 'lucide-react';

interface NewVisitFormProps {
  childrenList: Child[];
  onAddChild: (child: Child) => void;
  onSubmitVisit: (childId: string, vitals: Vitals, symptomNotes: string, selectedDangerKeys: string[], photoUrl?: string) => Promise<void>;
  isLoading: boolean;
}

export const NewVisitForm: React.FC<NewVisitFormProps> = ({
  childrenList,
  onAddChild,
  onSubmitVisit,
  isLoading,
}) => {
  // Active child selection
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [showAddChildModal, setShowAddChildModal] = useState<boolean>(false);

  // New child form fields
  const [newChildName, setNewChildName] = useState('');
  const [newChildAgeMonths, setNewChildAgeMonths] = useState<number>(12);
  const [newChildGender, setNewChildGender] = useState<'male' | 'female'>('female');
  const [newChildGuardian, setNewChildGuardian] = useState('');
  const [newChildHousehold, setNewChildHousehold] = useState('');

  // Vitals State
  const [vitals, setVitals] = useState<Vitals>({
    temperatureC: 38.0,
    weightKg: 8.5,
    respiratoryRateBpm: 44,
    feverDays: 2,
    diarrhoeaDays: 0,
  });

  // Symptom notes and selected danger sign checkboxes
  const [symptomNotes, setSymptomNotes] = useState<string>('');
  const [selectedDangerKeys, setSelectedDangerKeys] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // Speech Recognition (Voice Input)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const handleToggleVoiceRecord = () => {
    if (!speechSupported) {
      alert('Web Speech API is not supported in this browser. Please type symptoms in Urdu or English.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ur-PK'; // Urdu (Pakistan) or fallback to 'en-US'
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSymptomNotes(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsRecording(false);
    }
  };

  const toggleDangerKey = (key: string) => {
    setSelectedDangerKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleRegisterNewChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildGuardian.trim()) return;

    const created: Child = {
      id: `c-${Date.now().toString().slice(-4)}`,
      name: newChildName,
      ageMonths: Number(newChildAgeMonths),
      gender: newChildGender,
      guardianName: newChildGuardian,
      householdId: newChildHousehold || `HH-UC14-${Math.floor(100 + Math.random() * 800)}`,
      villageUC: 'UC-14, Rahim Yar Khan',
      createdAt: new Date().toISOString(),
    };

    onAddChild(created);
    setSelectedChildId(created.id);
    setShowAddChildModal(false);
    setNewChildName('');
    setNewChildGuardian('');
  };

  const selectedChild = childrenList.find(c => c.id === selectedChildId);

  // Check respiratory cutoff helper
  const isFastBreathingThreshold = selectedChild
    ? (selectedChild.ageMonths < 12
        ? vitals.respiratoryRateBpm >= IMNCI_CUTOFFS.INFANT_FAST_BREATHING_BPM
        : vitals.respiratoryRateBpm >= IMNCI_CUTOFFS.CHILD_FAST_BREATHING_BPM)
    : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) {
      alert('Please select or register a child first.');
      return;
    }
    await onSubmitVisit(selectedChildId, vitals, symptomNotes, selectedDangerKeys, photoUrl);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>New Patient Field Visit Assessment</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                IMNCI Protocol
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select child, measure vitals, and describe symptoms via voice or text.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddChildModal(true)}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 border border-slate-600"
          >
            <User className="w-4 h-4 text-emerald-400" />
            <span>+ Register New Child</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Child Selector */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md space-y-4">
          <label className="block text-sm font-bold text-slate-200">
            1. Select Patient / Child (بچے کا انتخاب)
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {childrenList.map((child) => (
              <div
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedChildId === child.id
                    ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                    : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">{child.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                    {child.ageMonths}m
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Guardian: {child.guardianName}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID: {child.householdId}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Vitals Form */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>2. Measured Vitals (بچے کی معلومات / طبعی علامات)</span>
            </h2>
            {selectedChild && (
              <span className="text-xs text-slate-400">
                Pneumonia Threshold: {selectedChild.ageMonths < 12 ? '>= 50 bpm (Infant)' : '>= 40 bpm (Child)'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Temperature (°C) (درجہ حرارت)
              </label>
              <input
                type="number"
                step="0.1"
                value={vitals.temperatureC}
                onChange={(e) => setVitals({ ...vitals, temperatureC: parseFloat(e.target.value) || 37.0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 block">
                {(vitals.temperatureC * 9/5 + 32).toFixed(1)}°F {vitals.temperatureC >= 37.5 ? '• Fever' : '• Normal'}
              </span>
            </div>

            {/* Respiratory Rate */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Respiratory Rate (breaths/min) (سانس کی رفتار)
              </label>
              <input
                type="number"
                value={vitals.respiratoryRateBpm}
                onChange={(e) => setVitals({ ...vitals, respiratoryRateBpm: parseInt(e.target.value, 10) || 30 })}
                className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2 font-mono font-bold text-base outline-none ${
                  isFastBreathingThreshold
                    ? 'border-amber-500 text-amber-300 bg-amber-950/20'
                    : 'border-slate-700 text-white focus:border-emerald-500'
                }`}
                required
              />
              {isFastBreathingThreshold ? (
                <span className="text-[11px] text-amber-400 font-semibold block">
                  ⚠️ FAST BREATHING DETECTED!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 block">Normal rate</span>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Weight (kg) (وزن)
              </label>
              <input
                type="number"
                step="0.1"
                value={vitals.weightKg}
                onChange={(e) => setVitals({ ...vitals, weightKg: parseFloat(e.target.value) || 5.0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 block">Target growth scale</span>
            </div>

            {/* Fever Days */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Fever Duration (Days) (بخار کے دن)
              </label>
              <input
                type="number"
                value={vitals.feverDays}
                onChange={(e) => setVitals({ ...vitals, feverDays: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono font-bold text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
              <span className="text-[11px] text-slate-400 block">
                {vitals.feverDays > 7 ? '⚠️ Prolonged > 7d (Red)' : 'Standard duration'}
              </span>
            </div>
          </div>
        </div>

        {/* Symptoms Voice / Text Input */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">
                3. Spoken or Typed Symptoms (علامات کا بیان)
              </h2>
              <p className="text-xs text-slate-400">
                Speak in Urdu or English. AI will extract structured danger signs per IMNCI protocol.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Listening (سن رہا ہے)...' : 'Voice Input (اردو بولیں)'}</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={symptomNotes}
            onChange={(e) => setSymptomNotes(e.target.value)}
            placeholder="مثال: بچے کو دو دن سے تیز بخار ہے، سانس تیز چل رہی ہے اور دودھ نہیں پی رہا..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed"
          ></textarea>
        </div>

        {/* Quick Danger Signs Checkable Grid */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-md space-y-3">
          <label className="block text-sm font-bold text-slate-200">
            4. Quick IMNCI Danger Signs Checklist (شدید خطرے کی علامات)
          </label>
          <p className="text-xs text-slate-400">
            Check any observable danger signs manually to override or confirm AI extraction:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DANGER_SIGNS_CATALOG.map((ds) => {
              const isChecked = selectedDangerKeys.includes(ds.key);
              const isRed = ds.severity === 'RED';

              return (
                <div
                  key={ds.key}
                  onClick={() => toggleDangerKey(ds.key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    isChecked
                      ? isRed
                        ? 'bg-red-950/40 border-red-500 text-red-200'
                        : 'bg-amber-950/40 border-amber-500 text-amber-200'
                      : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by div click
                    className="mt-1 accent-emerald-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-xs">{ds.nameUr}</div>
                    <div className="text-[11px] text-slate-400">{ds.nameEn}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 flex items-center justify-center space-x-3"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Evaluating IMNCI Triage Rules...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Run Offline Triage (تشخیص کریں)</span>
                <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Register Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Register New Patient Record</h3>

            <form onSubmit={handleRegisterNewChild} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Child Name (بچے کا نام)</label>
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="e.g. Bilal Ahmed"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Months)</label>
                  <input
                    type="number"
                    required
                    value={newChildAgeMonths}
                    onChange={(e) => setNewChildAgeMonths(parseInt(e.target.value, 10) || 12)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                  <select
                    value={newChildGender}
                    onChange={(e) => setNewChildGender(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Guardian Name (والدین)</label>
                <input
                  type="text"
                  required
                  value={newChildGuardian}
                  onChange={(e) => setNewChildGuardian(e.target.value)}
                  placeholder="e.g. Rashida Bibi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Household ID (گھر نمبر)</label>
                <input
                  type="text"
                  value={newChildHousehold}
                  onChange={(e) => setNewChildHousehold(e.target.value)}
                  placeholder="e.g. HH-UC14-204"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
