import React from 'react';
import { Visit, Child } from '../types';
import { generateReferralSlipPDF } from '../utils/pdfGenerator';
import { Printer, Download, ArrowLeft, Shield, Building, QrCode, UserCheck } from 'lucide-react';

interface ReferralSlipModalProps {
  visit: Visit;
  child: Child;
  onClose: () => void;
}

export const ReferralSlipModal: React.FC<ReferralSlipModalProps> = ({
  visit,
  child,
  onClose,
}) => {
  const isRed = visit.assessment.classification === 'RED';

  const handleDownloadPDF = () => {
    generateReferralSlipPDF(visit, child);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Slip Document Canvas (Print Target) */}
        <div id="referral-slip-print" className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-inner border border-slate-200 space-y-6">
          {/* Slip Header */}
          <div className={`p-4 rounded-xl text-white flex items-center justify-between ${isRed ? 'bg-red-600' : 'bg-amber-600'}`}>
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-white" />
                <h2 className="font-extrabold text-lg tracking-wide uppercase">NIGRAAN • URGENT CLINICAL REFERRAL</h2>
              </div>
              <p className="text-xs text-white/90">Primary Maternal & Child Health Assessment (WHO IMNCI Protocol)</p>
            </div>

            <div className="text-right font-mono text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg border border-white/30">
              {visit.referralCode || 'REF-2026-NIGRAAN'}
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">1. CHILD & HOUSEHOLD DEMOGRAPHICS</h3>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div><strong>Child Name:</strong> {child.name} ({child.ageMonths}m, {child.gender})</div>
              <div><strong>Household ID:</strong> {child.householdId}</div>
              <div><strong>Guardian:</strong> {child.guardianName}</div>
              <div><strong>Phone:</strong> {child.phone || 'N/A'}</div>
              <div className="col-span-2"><strong>Village / UC:</strong> {child.villageUC}</div>
            </div>
          </div>

          {/* Vitals & Triage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">2. MEASURED CLINICAL VITALS</h3>
              <div><strong>Temperature:</strong> {visit.vitals.temperatureC}°C ({(visit.vitals.temperatureC * 9/5 + 32).toFixed(1)}°F)</div>
              <div><strong>Respiratory Rate:</strong> {visit.vitals.respiratoryRateBpm} breaths/min</div>
              <div><strong>Weight:</strong> {visit.vitals.weightKg} kg</div>
              <div><strong>Fever Duration:</strong> {visit.vitals.feverDays} Days</div>
            </div>

            <div className={`p-4 rounded-xl border ${isRed ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <h3 className="font-bold uppercase tracking-wider text-[11px]">3. TRIAGE & DANGER SIGNS</h3>
              <div className="font-extrabold text-sm my-1">
                TRIAGE STATUS: {isRed ? 'RED (URGENT HOSPITAL)' : 'YELLOW (BHU FACILITY)'}
              </div>
              <ul className="list-disc list-inside space-y-0.5 mt-1 text-[11px]">
                {visit.assessment.dangerSigns.map((ds) => (
                  <li key={ds.id}>
                    <strong>{ds.nameEn}</strong> ({ds.nameUr})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Facility & Actions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">4. TARGET FACILITY & FIELD INSTRUCTIONS</h3>
            <div><strong>Destination Facility:</strong> {visit.assessment.targetFacility || 'Basic Health Unit (BHU) UC-14, Rahim Yar Khan'}</div>
            <div><strong>Instructions:</strong> {visit.assessment.recommendedActionEnglish}</div>
            <div className="text-slate-800 font-semibold bg-amber-100 p-2 rounded border border-amber-200 mt-1">
              اردو ہدایت: {visit.assessment.recommendedActionUrdu}
            </div>
          </div>

          {/* Footer Signatures & QR */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 font-semibold text-slate-800">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Assessed by LHW Amina Bibi (Code: LHW-3094, UC-14)</span>
              </div>
              <p className="text-[10px] text-slate-400">Nigraan Offline Decision Support • Build with Gemma Project</p>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div className="text-[10px] text-slate-500">
                <div>Receiving MO Signature & Stamp:</div>
                <div className="w-32 h-8 border-b border-slate-300 mt-1"></div>
              </div>

              <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center shrink-0">
                <QrCode className="w-8 h-8 text-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
