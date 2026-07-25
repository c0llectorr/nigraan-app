import { Vitals, AssessmentResult, DangerSign, TriageLevel } from '../types';
import { DANGER_SIGNS_CATALOG, IMNCI_CUTOFFS } from '../data/imnciRules';

export function evaluateIMNCITriage(
  ageMonths: number,
  vitals: Vitals,
  selectedSignKeys: string[],
  aiExtractedSigns: string[] = [],
  customUrduNotes: string = ''
): AssessmentResult {
  // Combine user-checked keys and AI-extracted keys
  const allKeys = Array.from(new Set([...selectedSignKeys, ...aiExtractedSigns]));

  // Find DangerSign objects
  const detectedDangerSigns: DangerSign[] = allKeys
    .map(key => DANGER_SIGNS_CATALOG.find(d => d.key === key))
    .filter((d): d is DangerSign => d !== undefined);

  // Respiratory Fast Breathing calculation
  let isFastBreathing = false;
  if (ageMonths < 12) {
    if (vitals.respiratoryRateBpm >= IMNCI_CUTOFFS.INFANT_FAST_BREATHING_BPM) {
      isFastBreathing = true;
    }
  } else {
    if (vitals.respiratoryRateBpm >= IMNCI_CUTOFFS.CHILD_FAST_BREATHING_BPM) {
      isFastBreathing = true;
    }
  }

  // If fast breathing detected via vitals, ensure key is included
  if (isFastBreathing && !allKeys.includes('fast_breathing')) {
    allKeys.push('fast_breathing');
    const fbSign = DANGER_SIGNS_CATALOG.find(d => d.key === 'fast_breathing');
    if (fbSign && !detectedDangerSigns.some(d => d.key === 'fast_breathing')) {
      detectedDangerSigns.push(fbSign);
    }
  }

  // General Danger Signs (Red)
  const hasRedDangerSigns = detectedDangerSigns.some(d => d.severity === 'RED') ||
    allKeys.includes('unable_to_feed') ||
    allKeys.includes('vomiting_everything') ||
    allKeys.includes('convulsions') ||
    allKeys.includes('lethargy') ||
    allKeys.includes('chest_indrawing') ||
    allKeys.includes('stiff_neck') ||
    allKeys.includes('severe_dehydration') ||
    vitals.feverDays > IMNCI_CUTOFFS.HIGH_FEVER_DAYS_RED ||
    (vitals.temperatureC >= IMNCI_CUTOFFS.HIGH_FEVER_TEMP_THRESHOLD_C && isFastBreathing) ||
    (ageMonths < 2 && (vitals.temperatureC >= 37.5 || vitals.temperatureC < 35.5));

  // Yellow Signs
  const hasYellowSigns = detectedDangerSigns.some(d => d.severity === 'YELLOW') ||
    isFastBreathing ||
    (vitals.feverDays >= 2 && vitals.feverDays <= 7) ||
    vitals.diarrhoeaDays >= 14 ||
    allKeys.includes('fever_moderate') ||
    allKeys.includes('ear_discharge');

  let classification: TriageLevel = 'GREEN';
  let recheckDueDate: string | undefined = undefined;

  if (hasRedDangerSigns) {
    classification = 'RED';
  } else if (hasYellowSigns) {
    classification = 'YELLOW';
    // Calculate 2 days from today for recheck
    const date = new Date();
    date.setDate(date.getDate() + 2);
    recheckDueDate = date.toISOString().split('T')[0];
  } else {
    classification = 'GREEN';
  }

  // Generate plain Urdu & English explanations based on deterministic flags
  let explanationUrdu = '';
  let explanationEnglish = '';
  let recommendedActionUrdu = '';
  let recommendedActionEnglish = '';

  if (classification === 'RED') {
    const mainSignsUr = detectedDangerSigns.map(d => d.nameUr).join('، ');
    explanationUrdu = `بچے میں شدید خطرے کی علامات ہیں (${mainSignsUr || 'شدید بخار یا سانس کی تکلیف'})۔ اس کا مطلب ہے کہ بچے کو فوری ہسپتال علاج کی ضرورت ہے۔`;
    explanationEnglish = `Child presents severe WHO IMNCI danger signs (${detectedDangerSigns.map(d => d.nameEn).join(', ') || 'High fever or severe respiratory distress'}). Urgent hospital referral required immediately.`;
    recommendedActionUrdu = 'فوری طور پر BHU/DHQ ہسپتال منتقل کریں۔ سفر کے دوران بچے کو گرم رکھیں اور بار بار جائزہ لیں۔';
    recommendedActionEnglish = 'Urgent referral to BHU/RHC/DHQ hospital. Keep child warm during transport and administer pre-referral dose if trained.';
  } else if (classification === 'YELLOW') {
    if (isFastBreathing) {
      explanationUrdu = `بچے کی سانس کی رفتار تیز ہے (${vitals.respiratoryRateBpm} فی منٹ) جو کہ نمونیا کی ابتدائی علامت ہے۔ فوری ادویات اور 2 دن میں دوبارہ معائنہ ضروری ہے۔`;
      explanationEnglish = `Child has fast breathing (${vitals.respiratoryRateBpm} bpm) meeting pneumonia criteria. Requires oral antibiotic, antipyretic, and mandatory 2-day follow-up.`;
    } else {
      explanationUrdu = `بچے میں درمیانے درجے کی علامات ہیں (${vitals.feverDays} دن سے بخار/تکلیف)۔ گھر پر علاج کریں اور 2 دن بعد دوبارہ معائنہ لازمی کریں۔`;
      explanationEnglish = `Child has moderate symptoms (${vitals.feverDays} days fever). Home management with mandatory 2-day recheck.`;
    }
    recommendedActionUrdu = 'ہدایت کے مطابق دوا دیں۔ 2 دن بعد دوبارہ معائنہ لازمی کریں۔ اگر علامت بگڑے تو فوراً ہسپتال جائیں۔';
    recommendedActionEnglish = 'Administer oral treatment as per protocol. Schedule mandatory follow-up in 2 days. Instruct mother on danger signs.';
  } else {
    explanationUrdu = 'بچے میں کوئی شدید یا درمیانی علامت نہیں ہے۔ معمول کا زکام یا ہلکی تکلیف ہے۔ گھر پر دیکھ بھال کریں۔';
    explanationEnglish = 'No IMNCI danger signs or fast breathing detected. Simple cold/mild cough. Home care advice provided.';
    recommendedActionUrdu = 'والدہ کو خوراک اور سیال اشیاء جاری رکھنے کی ہدایت دیں۔ علامت بگڑنے پر رابطہ کریں۔';
    recommendedActionEnglish = 'Advise mother to continue feeding and increase fluids. Instruct to return immediately if fast breathing or danger signs develop.';
  }

  return {
    classification,
    dangerSigns: detectedDangerSigns,
    detectedSignsKeys: Array.from(new Set(detectedDangerSigns.map(d => d.key))),
    explanationUrdu,
    explanationEnglish,
    recommendedActionUrdu,
    recommendedActionEnglish,
    recheckDueDate,
    isFastBreathing,
    targetFacility: classification !== 'GREEN' ? 'Basic Health Unit (BHU) UC-14, Rahim Yar Khan' : undefined,
    aiExtracted: aiExtractedSigns.length > 0,
  };
}
