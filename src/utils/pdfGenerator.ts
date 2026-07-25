import { jsPDF } from 'jspdf';
import { Visit, Child } from '../types';

export function generateReferralSlipPDF(visit: Visit, child: Child) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const redColor = [220, 38, 38];
  const yellowColor = [217, 119, 6];
  const headerBg = visit.assessment.classification === 'RED' ? redColor : yellowColor;

  // Header Banner
  doc.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NIGRAAN - URGENT CLINICAL REFERRAL SLIP', 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Primary Maternal & Child Health Field Assessment (WHO IMNCI Protocol)', 105, 19, { align: 'center' });

  // Watermark / Classification Tag
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`REFERRAL CODE: ${visit.referralCode || 'REF-2026-NIGRAAN'}`, 15, 36);
  
  doc.setFontSize(11);
  doc.text(`Date of Assessment: ${new Date(visit.visitDate).toLocaleDateString('en-PK', { dateStyle: 'medium' })}`, 130, 36);

  doc.setLineWidth(0.5);
  doc.setDrawColor(203, 213, 225);
  doc.line(15, 40, 195, 40);

  // Patient Demographics Section
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 44, 180, 32, 'F');
  doc.rect(15, 44, 180, 32, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. CHILD & HOUSEHOLD DEMOGRAPHICS', 20, 51);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Child Name: ${child.name}`, 20, 58);
  doc.text(`Age: ${child.ageMonths} Months (${child.gender.toUpperCase()})`, 110, 58);

  doc.text(`Guardian: ${child.guardianName}`, 20, 65);
  doc.text(`Household ID: ${child.householdId}`, 110, 65);

  doc.text(`Location/UC: ${child.villageUC}`, 20, 72);
  doc.text(`Contact Phone: ${child.phone || 'N/A'}`, 110, 72);

  // Vitals & Clinical Measurements
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. MEASURED CLINICAL VITALS', 20, 85);

  doc.setFillColor(255, 255, 255);
  doc.rect(15, 88, 180, 24, 'F');
  doc.rect(15, 88, 180, 24, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Temperature: ${visit.vitals.temperatureC}°C (${(visit.vitals.temperatureC * 9/5 + 32).toFixed(1)}°F)`, 20, 95);
  doc.text(`Weight: ${visit.vitals.weightKg} kg`, 110, 95);

  doc.text(`Respiratory Rate: ${visit.vitals.respiratoryRateBpm} breaths/min`, 20, 103);
  doc.text(`Fever Duration: ${visit.vitals.feverDays} Days`, 110, 103);

  // Triage & Danger Signs
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. DETECTED IMNCI DANGER SIGNS & TRIAGE', 20, 120);

  doc.setFillColor(visit.assessment.classification === 'RED' ? 254 : 254, visit.assessment.classification === 'RED' ? 242 : 243, visit.assessment.classification === 'RED' ? 242 : 199);
  doc.rect(15, 123, 180, 42, 'F');
  doc.setDrawColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.rect(15, 123, 180, 42, 'S');

  doc.setTextColor(headerBg[0], headerBg[1], headerBg[2]);
  doc.setFontSize(13);
  doc.text(`TRIAGE STATUS: ${visit.assessment.classification === 'RED' ? 'RED (URGENT HOSPITAL REFERRAL)' : 'YELLOW (FACILITY ASSESSMENT REQUIRED)'}`, 20, 131);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Identified Danger Signs:', 20, 138);

  doc.setFont('helvetica', 'normal');
  if (visit.assessment.dangerSigns.length > 0) {
    let yPos = 144;
    visit.assessment.dangerSigns.forEach((ds) => {
      doc.text(`• ${ds.nameEn} (${ds.nameUr})`, 25, yPos);
      yPos += 5;
    });
  } else {
    doc.text('• Fast Breathing / Moderate Fever / Protocol Criteria', 25, 144);
  }

  // Symptom Description & Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. FIELD WORKER NOTES & CHIEF COMPLAINT', 20, 174);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.text(`"${visit.symptomNotes}"`, 20, 181, { maxWidth: 170 });

  // Destination & Pre-Referral Advice
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('5. DESTINATION FACILITY & LHW ACTION', 20, 196);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 199, 180, 26, 'F');
  doc.rect(15, 199, 180, 26, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Target Facility: ${visit.assessment.targetFacility || 'Basic Health Unit (BHU) UC-14, Rahim Yar Khan'}`, 20, 206);
  doc.text(`Recommended Action: ${visit.assessment.recommendedActionEnglish}`, 20, 213, { maxWidth: 170 });

  // Signatures & Verification Block
  doc.line(15, 235, 195, 235);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Assessed by Lady Health Worker:', 20, 243);
  doc.setFont('helvetica', 'bold');
  doc.text('LHW Amina Bibi (Code: LHW-3094, UC-14)', 20, 248);

  doc.setFont('helvetica', 'normal');
  doc.text('Facility Receiving Medical Officer Signature:', 120, 243);
  doc.line(120, 254, 190, 254);
  doc.text('Date & Stamp:', 120, 259);

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DISCLAIMER: Nigraan is an offline clinical decision-support tool adhering to WHO IMNCI protocols. Not a final diagnosis.', 105, 275, { align: 'center' });
  doc.text('Generated via Nigraan On-Device Engine (Build with Gemma Hackathon Project).', 105, 280, { align: 'center' });

  // Save PDF
  doc.save(`Nigraan_Referral_Slip_${child.name.replace(/\s+/g, '_')}_${visit.id}.pdf`);
}
