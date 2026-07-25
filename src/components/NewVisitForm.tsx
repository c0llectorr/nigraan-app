import React, { useState, useEffect } from 'react';
import { Child, Vitals } from '../types';
import { DANGER_SIGNS_CATALOG } from '../data/imnciRules';
import { Search, UserPlus, Mic, MicOff, Edit3, Thermometer, Weight, Activity, Clock, Cpu, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  // Step state: 'select-patient' or 'record-visit'
  const [step, setStep] = useState<'select-patient' | 'record-visit'>('select-patient');
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddChildModal, setShowAddChildModal] = useState<boolean>(false);

  // New child form fields
  const [newChildName, setNewChildName] = useState('');
  const [newChildAgeMonths, setNewChildAgeMonths] = useState<number>(28);
  const [newChildGender, setNewChildGender] = useState<'male' | 'female'>('female');
  const [newChildGuardian, setNewChildGuardian] = useState('');
  const [newChildHousehold, setNewChildHousehold] = useState('');

  // Vitals State
  const [vitals, setVitals] = useState<Vitals>({
    temperatureC: 38.5,
    weightKg: 12.0,
    respiratoryRateBpm: 42,
    feverDays: 3,
    diarrhoeaDays: 0,
  });

  // Symptom notes and selected danger sign checkboxes
  const [symptomNotes, setSymptomNotes] = useState<string>('');
  const [selectedDangerKeys, setSelectedDangerKeys] = useState<string[]>([]);
  
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
      alert('Web Speech API is not supported in this browser. Please type symptoms manually.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
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

      recognition.onerror = () => {
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

  const handleRegisterNewChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildGuardian.trim()) return;

    const created: Child = {
      id: `c-${Date.now().toString().slice(-4)}`,
      name: newChildName,
      ageMonths: Number(newChildAgeMonths),
      gender: newChildGender,
      guardianName: newChildGuardian,
      householdId: newChildHousehold || `Block C, Sector 4`,
      villageUC: 'Sector G-9, Islamabad',
      createdAt: new Date().toISOString(),
    };

    onAddChild(created);
    setSelectedChildId(created.id);
    setShowAddChildModal(false);
    setStep('record-visit');
    setNewChildName('');
    setNewChildGuardian('');
  };

  const selectedChild = childrenList.find(c => c.id === selectedChildId) || childrenList[0];

  const filteredChildren = childrenList.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.householdId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) {
      alert('Please select or register a child first.');
      return;
    }
    await onSubmitVisit(selectedChild.id, vitals, symptomNotes, selectedDangerKeys);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {step === 'select-patient' ? (
        /* Patient Selection & Search Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Start a New Visit</h1>
              <p className="text-sm text-slate-500">
                Search for an existing patient or register a new one to begin assessment.
              </p>
            </div>

            {/* Search Bar & Add Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Patient Name, National ID, or Phone Number"
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#0058bd] transition shadow-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddChildModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0058bd] hover:bg-[#004899] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register New Patient</span>
              </button>
            </div>

            {/* Recent Patients Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recent Patients</h2>
                <button className="text-xs font-bold text-[#0058bd]">View All Patients</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredChildren.map((child, idx) => (
                  <div
                    key={child.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                          {child.name.charAt(0)}
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          idx % 3 === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : idx % 3 === 1
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {idx % 3 === 0 ? 'Active Record' : idx % 3 === 1 ? 'Routine Checkup' : 'Pending Referral'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{child.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          ID: #{child.id.slice(-6)} • {Math.floor(child.ageMonths / 12) > 0 ? `${Math.floor(child.ageMonths / 12)} yrs` : `${child.ageMonths}m`} • {child.villageUC}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedChildId(child.id);
                        setStep('record-visit');
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <span>Start Visit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Widgets */}
          <div className="space-y-6">
            {/* Daily Progress Widget */}
            <div className="bg-[#0058bd] rounded-2xl p-6 text-white shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold">Daily Progress</h3>
                <p className="text-xs text-blue-100 font-medium tracking-wide uppercase">WORKER: HEALTH UNIT 04</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black">12</span>
                    <span className="text-xs text-blue-100 ml-2">Visits Today</span>
                  </div>
                  <span className="text-xs font-bold text-blue-100">75%</span>
                </div>

                <div className="w-full h-2 bg-blue-900/60 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-200 w-[75%] rounded-full"></div>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-400/30">
                <p className="text-xs font-semibold text-blue-100">Upcoming Schedule</p>
              </div>
            </div>

            {/* Area Map Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Area Map</h3>
                <p className="text-xs text-slate-500">Showing patients in your current vicinity</p>
              </div>

              <div className="h-40 rounded-xl overflow-hidden relative bg-slate-100 border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80"
                  alt="Area map"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Voice Assessment & Vitals Input Screen */
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('select-patient')}
              className="text-slate-700 font-bold text-sm flex items-center space-x-2 hover:text-[#0058bd] transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>New Visit</span>
            </button>
          </div>

          {/* Patient Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg">
                  {selectedChild.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedChild.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    ID: #{selectedChild.id.slice(-6)} • {Math.floor(selectedChild.ageMonths / 12)} Years {selectedChild.ageMonths % 12} Months
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('select-patient')}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PARENT</span>
                <span className="text-xs font-semibold text-slate-800">{selectedChild.guardianName}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">LOCATION</span>
                <span className="text-xs font-semibold text-slate-800">{selectedChild.householdId}</span>
              </div>
            </div>
          </div>

          {/* Voice Assessment Circle Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Voice Assessment</h3>
              <p className="text-xs text-slate-500">
                Describe symptoms like cough, difficulty breathing, or lethargy.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-3">
              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-100'
                    : 'bg-[#0058bd] hover:bg-[#004899] text-white ring-8 ring-blue-50'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <span className="text-[11px] font-bold tracking-wider text-[#0058bd] uppercase">
                • {isRecording ? 'RECORDING IN PROGRESS...' : 'TAP TO START RECORDING'}
              </span>
            </div>
          </div>

          {/* Notes Fallback Textarea */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              NOTES FALLBACK
            </label>
            <textarea
              rows={3}
              value={symptomNotes}
              onChange={(e) => setSymptomNotes(e.target.value)}
              placeholder="Enter observations manually if voice is unavailable..."
              className="w-full bg-transparent border-none text-sm text-slate-800 outline-none resize-none placeholder-slate-400"
            ></textarea>
          </div>

          {/* Vitals Recorded Grid */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Vitals Recorded</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Temp Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">High</span>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temperatureC}
                      onChange={(e) => setVitals({ ...vitals, temperatureC: parseFloat(e.target.value) || 37.0 })}
                      className="text-2xl font-black text-slate-900 w-20 bg-transparent border-b border-slate-300 focus:border-[#0058bd] outline-none"
                    />
                    <span className="text-sm font-semibold text-slate-500">°C</span>
                  </div>
                  <span className="text-xs text-slate-400">Temperature</span>
                </div>
              </div>

              {/* Weight Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                <Weight className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="flex items-baseline space-x-1">
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.weightKg}
                      onChange={(e) => setVitals({ ...vitals, weightKg: parseFloat(e.target.value) || 5.0 })}
                      className="text-2xl font-black text-slate-900 w-16 bg-transparent border-b border-slate-300 focus:border-[#0058bd] outline-none"
                    />
                    <span className="text-sm font-semibold text-slate-500">kg</span>
                  </div>
                  <span className="text-xs text-slate-400">Weight</span>
                </div>
              </div>

              {/* Resp Rate Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="flex items-baseline space-x-1">
                    <input
                      type="number"
                      value={vitals.respiratoryRateBpm}
                      onChange={(e) => setVitals({ ...vitals, respiratoryRateBpm: parseInt(e.target.value, 10) || 30 })}
                      className="text-2xl font-black text-slate-900 w-16 bg-transparent border-b border-slate-300 focus:border-[#0058bd] outline-none"
                    />
                    <span className="text-sm font-semibold text-slate-500">bpm</span>
                  </div>
                  <span className="text-xs text-slate-400">Resp. Rate</span>
                </div>
              </div>

              {/* Fever Duration Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="flex items-baseline space-x-1">
                    <input
                      type="number"
                      value={vitals.feverDays}
                      onChange={(e) => setVitals({ ...vitals, feverDays: parseInt(e.target.value, 10) || 0 })}
                      className="text-2xl font-black text-slate-900 w-12 bg-transparent border-b border-slate-300 focus:border-[#0058bd] outline-none"
                    />
                    <span className="text-sm font-semibold text-slate-500">days</span>
                  </div>
                  <span className="text-xs text-slate-400">Fever Duration</span>
                </div>
              </div>
            </div>
          </div>

          {/* Big Action Button: Analyze with Gemma */}
          <form onSubmit={handleSubmit} className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#0058bd] hover:bg-[#004899] disabled:opacity-50 text-white font-extrabold text-base rounded-full shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Cpu className="w-5 h-5" />
              <span>Analyze with Gemma</span>
            </button>
          </form>
        </div>
      )}

      {/* Register Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Register New Patient Record</h3>

            <form onSubmit={handleRegisterNewChild} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Child Name</label>
                <input
                  type="text"
                  required
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="e.g. Amina Khan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-sm outline-none focus:border-[#0058bd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Months)</label>
                  <input
                    type="number"
                    required
                    value={newChildAgeMonths}
                    onChange={(e) => setNewChildAgeMonths(parseInt(e.target.value, 10) || 12)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-sm outline-none focus:border-[#0058bd]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newChildGender}
                    onChange={(e) => setNewChildGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-sm outline-none focus:border-[#0058bd]"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  required
                  value={newChildGuardian}
                  onChange={(e) => setNewChildGuardian(e.target.value)}
                  placeholder="e.g. Zainab Khan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-sm outline-none focus:border-[#0058bd]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Household</label>
                <input
                  type="text"
                  value={newChildHousehold}
                  onChange={(e) => setNewChildHousehold(e.target.value)}
                  placeholder="e.g. Block C, Sector 4"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-sm outline-none focus:border-[#0058bd]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0058bd] text-white font-bold text-xs rounded-xl shadow-xs"
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

