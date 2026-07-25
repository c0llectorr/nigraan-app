export type TriageLevel = 'RED' | 'YELLOW' | 'GREEN';

export interface Child {
  id: string;
  name: string;
  ageMonths: number;
  gender: 'male' | 'female';
  guardianName: string;
  householdId: string;
  phone?: string;
  villageUC: string;
  createdAt: string;
}

export interface Vitals {
  temperatureC: number;
  weightKg: number;
  respiratoryRateBpm: number;
  feverDays: number;
  diarrhoeaDays: number;
}

export interface DangerSign {
  id: string;
  key: string;
  nameEn: string;
  nameUr: string;
  category: 'general_danger' | 'respiratory' | 'fever' | 'malnutrition' | 'diarrhoea';
  severity: 'RED' | 'YELLOW';
  description: string;
}

export interface AssessmentResult {
  classification: TriageLevel;
  dangerSigns: DangerSign[];
  detectedSignsKeys: string[];
  explanationUrdu: string;
  explanationEnglish: string;
  recommendedActionUrdu: string;
  recommendedActionEnglish: string;
  recheckDueDate?: string; // YYYY-MM-DD
  isFastBreathing: boolean;
  targetFacility?: string;
  aiExtracted: boolean;
}

export interface Visit {
  id: string;
  childId: string;
  visitDate: string; // ISO String
  vitals: Vitals;
  symptomNotes: string;
  photoUrl?: string;
  assessment: AssessmentResult;
  referralGenerated: boolean;
  referralCode?: string;
  status: 'completed' | 'referred' | 'recheck_pending' | 'resolved';
}
