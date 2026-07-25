/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Child, Visit, Vitals } from './types';
import { INITIAL_CHILDREN, INITIAL_VISITS } from './data/mockVisits';
import { evaluateIMNCITriage } from './utils/imnciEngine';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NewVisitForm } from './components/NewVisitForm';
import { AssessmentResultModal } from './components/AssessmentResultModal';
import { ReferralSlipModal } from './components/ReferralSlipModal';
import { RecheckList } from './components/RecheckList';
import { PatientRecords } from './components/PatientRecords';
import { IMNCIGuideModal } from './components/IMNCIGuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-visit' | 'recheck' | 'records' | 'guide'>('dashboard');

  const [childrenList, setChildrenList] = useState<Child[]>(INITIAL_CHILDREN);
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS);

  // Active visit modal state
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState<boolean>(false);
  const [showReferralSlipModal, setShowReferralSlipModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const recheckCount = visits.filter(
    (v) => v.assessment.recheckDueDate === todayStr && v.status === 'recheck_pending'
  ).length;

  const handleAddChild = (child: Child) => {
    setChildrenList((prev) => [child, ...prev]);
  };

  const handleSubmitVisit = async (
    childId: string,
    vitals: Vitals,
    symptomNotes: string,
    selectedDangerKeys: string[],
    photoUrl?: string
  ) => {
    setIsLoading(true);

    const child = childrenList.find((c) => c.id === childId);
    const ageMonths = child ? child.ageMonths : 12;

    try {
      // Call server API if available, or run client-side engine directly
      const response = await fetch('/api/visits/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageMonths,
          vitals,
          selectedSignKeys: selectedDangerKeys,
          symptomNotes,
          childName: child?.name || 'Child',
        }),
      });

      let assessment;
      if (response.ok) {
        const data = await response.json();
        assessment = data.assessment;
      } else {
        // Fallback to local IMNCI Engine
        assessment = evaluateIMNCITriage(ageMonths, vitals, selectedDangerKeys, [], symptomNotes);
      }

      const newVisitId = `v-${Date.now().toString().slice(-6)}`;
      const referralCode =
        assessment.classification !== 'GREEN'
          ? `REF-${newVisitId}-${assessment.classification}`
          : undefined;

      const newVisit: Visit = {
        id: newVisitId,
        childId,
        visitDate: new Date().toISOString(),
        vitals,
        symptomNotes,
        photoUrl,
        assessment,
        referralGenerated: assessment.classification !== 'GREEN',
        referralCode,
        status: assessment.classification === 'YELLOW' ? 'recheck_pending' : assessment.classification === 'RED' ? 'referred' : 'completed',
      };

      setVisits((prev) => [newVisit, ...prev]);
      setSelectedVisit(newVisit);
      setShowAssessmentModal(true);
    } catch (err) {
      console.warn('API call failed, running local offline engine:', err);
      const assessment = evaluateIMNCITriage(ageMonths, vitals, selectedDangerKeys, [], symptomNotes);

      const newVisitId = `v-${Date.now().toString().slice(-6)}`;
      const newVisit: Visit = {
        id: newVisitId,
        childId,
        visitDate: new Date().toISOString(),
        vitals,
        symptomNotes,
        photoUrl,
        assessment,
        referralGenerated: assessment.classification !== 'GREEN',
        referralCode: assessment.classification !== 'GREEN' ? `REF-${newVisitId}-${assessment.classification}` : undefined,
        status: assessment.classification === 'YELLOW' ? 'recheck_pending' : assessment.classification === 'RED' ? 'referred' : 'completed',
      };

      setVisits((prev) => [newVisit, ...prev]);
      setSelectedVisit(newVisit);
      setShowAssessmentModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVisit = (visit: Visit) => {
    setSelectedVisit(visit);
    setShowAssessmentModal(true);
  };

  const handleGenerateReferralFromAssessment = () => {
    setShowAssessmentModal(false);
    setShowReferralSlipModal(true);
  };

  const getChildForVisit = (childId?: string) => {
    return childrenList.find((c) => c.id === childId) || childrenList[0];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recheckCount={recheckCount}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            visits={visits}
            children={childrenList}
            onNewVisit={() => setActiveTab('new-visit')}
            onSelectVisit={handleSelectVisit}
            onGoToRecheck={() => setActiveTab('recheck')}
          />
        )}

        {activeTab === 'new-visit' && (
          <NewVisitForm
            childrenList={childrenList}
            onAddChild={handleAddChild}
            onSubmitVisit={handleSubmitVisit}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'recheck' && (
          <RecheckList
            visits={visits}
            children={childrenList}
            onSelectVisit={handleSelectVisit}
            onNewVisit={() => setActiveTab('new-visit')}
          />
        )}

        {activeTab === 'records' && (
          <PatientRecords
            visits={visits}
            children={childrenList}
            onSelectVisit={handleSelectVisit}
          />
        )}
      </main>

      {/* Assessment Result Modal */}
      {showAssessmentModal && selectedVisit && (
        <AssessmentResultModal
          visit={selectedVisit}
          child={getChildForVisit(selectedVisit.childId)}
          onClose={() => setShowAssessmentModal(false)}
          onGenerateReferral={handleGenerateReferralFromAssessment}
        />
      )}

      {/* Referral Slip Modal */}
      {showReferralSlipModal && selectedVisit && (
        <ReferralSlipModal
          visit={selectedVisit}
          child={getChildForVisit(selectedVisit.childId)}
          onClose={() => setShowReferralSlipModal(false)}
        />
      )}

      {/* Clinical Guide Modal */}
      {showGuideModal && <IMNCIGuideModal onClose={() => setShowGuideModal(false)} />}
    </div>
  );
}
