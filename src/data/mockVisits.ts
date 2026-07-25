import { Child, Visit } from '../types';
import { DANGER_SIGNS_CATALOG } from './imnciRules';

const today = new Date().toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'c-101',
    name: 'Zainab Bibi',
    ageMonths: 18,
    gender: 'female',
    guardianName: 'Fatima & Muhammad Usman',
    householdId: 'HH-UC14-042',
    phone: '0301-8473921',
    villageUC: 'Basti Riaz, UC-14',
    createdAt: threeDaysAgo,
  },
  {
    id: 'c-102',
    name: 'Ali Hassan',
    ageMonths: 8,
    gender: 'male',
    guardianName: 'Kulsoom Parveen',
    householdId: 'HH-UC14-089',
    phone: '0304-9123847',
    villageUC: 'Chak 112/P, UC-14',
    createdAt: twoDaysAgo,
  },
  {
    id: 'c-103',
    name: 'Ayesha Noor',
    ageMonths: 36,
    gender: 'female',
    guardianName: 'Maryam Bibi',
    householdId: 'HH-UC14-115',
    phone: '0312-7382910',
    villageUC: 'Basti Jam, UC-14',
    createdAt: today,
  }
];

export const INITIAL_VISITS: Visit[] = [
  {
    id: 'v-2026-001',
    childId: 'c-102', // Ali Hassan (8 months)
    visitDate: twoDaysAgo + 'T10:15:00Z',
    vitals: {
      temperatureC: 38.2,
      weightKg: 6.8,
      respiratoryRateBpm: 54, // Fast breathing for 8 month old (>= 50 bpm)
      feverDays: 2,
      diarrhoeaDays: 0,
    },
    symptomNotes: 'پچھلے دو دن سے ہلکا بخار ہے اور تیز سانس چل رہی ہے۔ دودھ ٹھیک پی رہا ہے لیکن روتا زیادہ ہے۔',
    assessment: {
      classification: 'YELLOW',
      dangerSigns: [
        DANGER_SIGNS_CATALOG.find(d => d.key === 'fast_breathing')!,
        DANGER_SIGNS_CATALOG.find(d => d.key === 'fever_moderate')!,
      ],
      detectedSignsKeys: ['fast_breathing', 'fever_moderate'],
      explanationUrdu: 'بچے کو درمیانہ بخار اور تیز سانس (نمونیا کی شروعات) ہے۔ پیناڈول اور اورل اموکسیسیلین دیں اور 2 دن بعد دوبارہ معائنہ لازمی کریں۔',
      explanationEnglish: 'Child has fast breathing (54 bpm) indicating early pneumonia and moderate fever. Prescribe amoxicillin & paracetamol; recheck due today.',
      recommendedActionUrdu: '2 دن کے اندر دوبارہ معائنہ کریں۔ اگر سانس زیادہ تیز ہو یا دودھ پینا چھوڑ دے تو فوراً ہسپتال لے جائیں۔',
      recommendedActionEnglish: 'Recheck in 2 days. Instruct mother on danger signs and home treatment.',
      recheckDueDate: today, // DUE TODAY!
      isFastBreathing: true,
      targetFacility: 'Basic Health Unit (BHU) UC-14, Rahim Yar Khan',
      aiExtracted: true,
    },
    referralGenerated: true,
    referralCode: 'REF-2026-001-YL',
    status: 'recheck_pending',
  },
  {
    id: 'v-2026-002',
    childId: 'c-101', // Zainab Bibi
    visitDate: threeDaysAgo + 'T14:30:00Z',
    vitals: {
      temperatureC: 39.4,
      weightKg: 9.1,
      respiratoryRateBpm: 46,
      feverDays: 4,
      diarrhoeaDays: 0,
    },
    symptomNotes: 'تیز بخار ہے، پسلیاں چل رہی ہیں اور بچہ نڈھال ہے، دودھ بھی نہیں پی رہا۔',
    assessment: {
      classification: 'RED',
      dangerSigns: [
        DANGER_SIGNS_CATALOG.find(d => d.key === 'unable_to_feed')!,
        DANGER_SIGNS_CATALOG.find(d => d.key === 'chest_indrawing')!,
        DANGER_SIGNS_CATALOG.find(d => d.key === 'lethargy')!,
      ],
      detectedSignsKeys: ['unable_to_feed', 'chest_indrawing', 'lethargy'],
      explanationUrdu: 'بچے میں شدید خطرے کی علامات ہیں: پسلیاں دھنس رہی ہیں، بچہ دودھ نہیں پی رہا اور نڈھال ہے۔ فوری طور پر قریبی ہسپتال (BHU/DHQ) منتقل کریں۔',
      explanationEnglish: 'Severe danger signs present: chest indrawing, lethargy, unable to feed. Immediate urgent referral to BHU/DHQ required.',
      recommendedActionUrdu: 'فوری طور پر BHU یا DHQ ہسپتال منتقل کریں۔ راستے میں بچے کو گرم رکھیں۔',
      recommendedActionEnglish: 'Urgent referral. Administer first dose of pre-referral antibiotic if trained.',
      recheckDueDate: undefined,
      isFastBreathing: true,
      targetFacility: 'Basic Health Unit (BHU) UC-14, Rahim Yar Khan',
      aiExtracted: true,
    },
    referralGenerated: true,
    referralCode: 'REF-2026-002-RD',
    status: 'referred',
  },
  {
    id: 'v-2026-003',
    childId: 'c-103', // Ayesha Noor
    visitDate: today + 'T09:00:00Z',
    vitals: {
      temperatureC: 36.8,
      weightKg: 13.2,
      respiratoryRateBpm: 28,
      feverDays: 0,
      diarrhoeaDays: 0,
    },
    symptomNotes: 'ہلکی زکام اور کھانسی ہے، بخار نہیں ہے، بچہ فعال ہے اور کھانا پی رہا ہے۔',
    assessment: {
      classification: 'GREEN',
      dangerSigns: [],
      detectedSignsKeys: [],
      explanationUrdu: 'بچے کو کوئی شدید علامت نہیں ہے۔ معمول کا زکام ہے۔ گھر پر نگہداشت کریں اور گرم سیال اشیاء دیں۔',
      explanationEnglish: 'No IMNCI danger signs detected. Mild upper respiratory cold. Provide home care and fluid intake advice.',
      recommendedActionUrdu: 'گھر پر دیکھ بھال کریں۔ زکام کی دیکھ بھال کی ہدایات والدہ کو دیں۔',
      recommendedActionEnglish: 'Home care advice. Return immediately if child develops fast breathing or stops feeding.',
      recheckDueDate: undefined,
      isFastBreathing: false,
      aiExtracted: true,
    },
    referralGenerated: false,
    status: 'completed',
  }
];
