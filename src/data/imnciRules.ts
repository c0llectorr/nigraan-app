import { DangerSign } from '../types';

export const DANGER_SIGNS_CATALOG: DangerSign[] = [
  {
    id: 'ds-1',
    key: 'unable_to_feed',
    nameEn: 'Not able to drink or breastfeed',
    nameUr: 'دودھ يا پاني بالکل نہ پي سکنہ',
    category: 'general_danger',
    severity: 'RED',
    description: 'The child is too weak to suck or swallow any fluid.'
  },
  {
    id: 'ds-2',
    key: 'vomiting_everything',
    nameEn: 'Vomits everything',
    nameUr: 'ہر خوراک يا پاني کا قے ہو جانا',
    category: 'general_danger',
    severity: 'RED',
    description: 'Child cannot keep anything down in the stomach.'
  },
  {
    id: 'ds-3',
    key: 'convulsions',
    nameEn: 'Convulsions or fits during illness',
    nameUr: 'جھٹکے يا دورے پڑنا',
    category: 'general_danger',
    severity: 'RED',
    description: 'History of seizures or abnormal jerking during current illness.'
  },
  {
    id: 'ds-4',
    key: 'lethargy',
    nameEn: 'Lethargic or unconscious',
    nameUr: 'بے ہوش يا بہت نڈھال ہونا',
    category: 'general_danger',
    severity: 'RED',
    description: 'Child does not respond properly to voice or touch.'
  },
  {
    id: 'ds-5',
    key: 'chest_indrawing',
    nameEn: 'Chest indrawing',
    nameUr: 'سينے کا اندر دھنسنا (پسلياں چلنا)',
    category: 'respiratory',
    severity: 'RED',
    description: 'Lower chest wall moves in when the child breathes in.'
  },
  {
    id: 'ds-6',
    key: 'stiff_neck',
    nameEn: 'Stiff neck',
    nameUr: 'گردن کا اکڑنا',
    category: 'fever',
    severity: 'RED',
    description: 'Inability to bend neck forward to touch chin to chest.'
  },
  {
    id: 'ds-7',
    key: 'high_fever_extended',
    nameEn: 'Fever for more than 7 days',
    nameUr: '7 دن سے زائد بخار',
    category: 'fever',
    severity: 'RED',
    description: 'Prolonged fever needing urgent hospital investigation for malaria/typhoid.'
  },
  {
    id: 'ds-8',
    key: 'severe_dehydration',
    nameEn: 'Severe dehydration signs (Sunken eyes / skin pinch > 2s)',
    nameUr: 'شديد پاني کي کمي (آنکھيں اندر دھنسنا / جلد کي چنٽ)',
    category: 'diarrhoea',
    severity: 'RED',
    description: 'Sunken eyes, lethargy, or skin pinch goes back very slowly (>2s).'
  },
  {
    id: 'ds-9',
    key: 'fast_breathing',
    nameEn: 'Fast breathing (Pneumonia threshold)',
    nameUr: 'تیز سانس چلنا (نمونیا کی علامت)',
    category: 'respiratory',
    severity: 'YELLOW',
    description: 'Respiration >= 50/min (2-11m) or >= 40/min (12-59m).'
  },
  {
    id: 'ds-10',
    key: 'fever_moderate',
    nameEn: 'Fever (2 to 7 days)',
    nameUr: '2 سے 7 دن کا بخار',
    category: 'fever',
    severity: 'YELLOW',
    description: 'Fever requiring oral antipyretic & 2-day follow up.'
  },
  {
    id: 'ds-11',
    key: 'ear_discharge',
    nameEn: 'Ear discharge or ear pain',
    nameUr: 'کان سے پواڈ نکلنا یا کان کا درد',
    category: 'respiratory',
    severity: 'YELLOW',
    description: 'Acute ear infection requiring dry wiping and local care.'
  }
];

export const IMNCI_CUTOFFS = {
  INFANT_FAST_BREATHING_BPM: 50, // 2 to 11 months
  CHILD_FAST_BREATHING_BPM: 40,  // 12 to 59 months
  FEVER_TEMP_THRESHOLD_C: 37.5,
  HIGH_FEVER_TEMP_THRESHOLD_C: 38.5,
  HIGH_FEVER_DAYS_RED: 7,
};

export const NEARBY_FACILITIES = [
  { id: 'bhu-uc14', name: 'Basic Health Unit (BHU) UC-14, Rahim Yar Khan', distanceKm: 3.5, phone: '068-9230111' },
  { id: 'rhc-khanpur', name: 'Rural Health Center (RHC) Khanpur', distanceKm: 12.0, phone: '068-9230222' },
  { id: 'dhq-ryk', name: 'Sheikh Zayed DHQ Hospital, Rahim Yar Khan', distanceKm: 28.0, phone: '068-9230000' },
];
