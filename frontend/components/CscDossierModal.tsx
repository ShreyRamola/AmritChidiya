'use client';

import React, { useRef, useState } from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface SchemeItem {
  name: string;
  eligibility_match: string;
  apply_url?: string;
}

interface CscDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  selectedLanguage?: string | null;
  schemes: SchemeItem[];
}

const DOSSIER_I18N: Record<string, Record<string, string>> = {
  English: {
    modalTitle: "CSC / Citizen Service Center Application Dossier",
    modalBadge: "CSC Dossier",
    modalSubtitle: "Print or take this dossier directly to your local CSC / Cyber Cafe",
    printBtn: "Print / Save PDF",
    bannerTitle: "AMRITCHIDIYA SCHEME ELIGIBILITY DOSSIER",
    bannerSubtitle: "Digital India • Citizen Service Center Application Assistance Passbook",
    dossierIdLabel: "Dossier ID:",
    generatedLabel: "Generated:",
    statusLabel: "Status:",
    statusValue: "VERIFIED OFFICIAL",
    sec1Title: "1. Beneficiary Profile Summary",
    nameLabel: "Beneficiary Name:",
    emailLabel: "Contact / Email:",
    langLabel: "Preferred Language:",
    sec2Title: "2. Eligible Government Schemes",
    officialPortalLabel: "Official Portal:",
    sec3Title: "3. Mandatory Documents Checklist",
    docAadhaar: "Aadhaar Card (Linked with Active Mobile)",
    docBank: "Bank Passbook (NPCI / DBT-Seeded)",
    docIncome: "Income Certificate (Valid within 3 years)",
    docCaste: "Caste / Category Certificate",
    docMarksheet: "Previous Examination Marksheet",
    docPhotos: "2 Passport Size Recent Photographs",
    npciTitle: "CRITICAL DBT NOTICE:",
    npciBody: "It is mandatory for your bank account to have active NPCI / DBT mapping enabled so that scholarship/welfare funds credit directly into your bank account.",
    sec4Title: "4. CSC Operator Verification & Application Acknowledgement",
    ackRef: "Application Reference No:",
    ackVle: "CSC Center VLE ID:",
    ackSign: "VLE Seal & Signature:",
    footer: "AmritChidiya National Scheme Platform • Official Verified Gov Portals Only • Data Protected"
  },
  Hindi: {
    modalTitle: "जन सेवा केंद्र (CSC) योजना आवेदन पर्ची",
    modalBadge: "CSC पर्ची",
    modalSubtitle: "इस पर्ची को सीधे अपने नजदीकी जन सेवा केंद्र या साइबर कैफे ले जाएं",
    printBtn: "प्रिंट / पीडीएफ सेव करें",
    bannerTitle: "अमृतचिड़िया योजना पात्रता एवं आवेदन पर्ची",
    bannerSubtitle: "डिजिटल भारत • जन सेवा केंद्र / नागरिक सुविधा केंद्र सहायता पर्ची",
    dossierIdLabel: "पर्ची संख्या:",
    generatedLabel: "दिनांक:",
    statusLabel: "स्थिति:",
    statusValue: "सत्यापित आधिकारिक",
    sec1Title: "1. आवेदक प्रोफाइल विवरण",
    nameLabel: "आवेदक का नाम:",
    emailLabel: "संपर्क / ईमेल:",
    langLabel: "चयनित भाषा:",
    sec2Title: "2. पात्र सरकारी योजनाएं",
    officialPortalLabel: "आधिकारिक पोर्टल:",
    sec3Title: "3. आवश्यक दस्तावेज़ चेकलिस्ट",
    docAadhaar: "आधार कार्ड (मोबाइल नंबर से लिंक)",
    docBank: "बैंक पासबुक (NPCI / DBT सीडेड खाता)",
    docIncome: "आय प्रमाण पत्र (3 वर्ष से कम पुराना)",
    docCaste: "जाति / श्रेणी प्रमाण पत्र",
    docMarksheet: "पिछली कक्षा की अंकतालिका (मार्कशीट)",
    docPhotos: "2 पासपोर्ट साइज फोटो",
    npciTitle: "महत्वपूर्ण नोट (NPCI DBT):",
    npciBody: "छात्रवृत्ति/लाभ की राशि सीधे बैंक खाते में आने के लिए आपके बैंक खाते का NPCI / DBT Mapping होना अनिवार्य है।",
    sec4Title: "4. जन सेवा केंद्र ऑपरेटर पावती",
    ackRef: "आवेदन संदर्भ संख्या (Ref No):",
    ackVle: "सीएससी केंद्र वीएलई आईडी:",
    ackSign: "वीएलई मोहर व हस्ताक्षर:",
    footer: "अमृतचिड़िया राष्ट्रीय योजना सिफारिश मंच • केवल सत्यापित सरकारी पोर्टल • डेटा सुरक्षित"
  },
  Hinglish: {
    modalTitle: "CSC / Jan Seva Kendra Application Dossier",
    modalBadge: "CSC Parchi",
    modalSubtitle: "Is parchi ko print karein ya apne nazdeeki Jan Seva Kendra / Cyber Cafe le jayein",
    printBtn: "Print / Save PDF",
    bannerTitle: "AMRITCHIDIYA SCHEME ELIGIBILITY DOSSIER",
    bannerSubtitle: "Digital India • Jan Seva Kendra / CSC Sahayata Parchi",
    dossierIdLabel: "Dossier ID:",
    generatedLabel: "Generated Date:",
    statusLabel: "Status:",
    statusValue: "VERIFIED OFFICIAL",
    sec1Title: "1. Beneficiary Profile Summary",
    nameLabel: "Beneficiary Name:",
    emailLabel: "Contact / Email:",
    langLabel: "Preferred Language:",
    sec2Title: "2. Eligible Government Schemes",
    officialPortalLabel: "Official Portal:",
    sec3Title: "3. Mandatory Documents Checklist",
    docAadhaar: "Aadhaar Card (Mobile se linked)",
    docBank: "Bank Passbook (NPCI / DBT-Seeded)",
    docIncome: "Income Certificate (Valid < 3 yrs)",
    docCaste: "Caste / Category Certificate",
    docMarksheet: "Previous Examination Marksheet",
    docPhotos: "2 Passport Size Photos",
    npciTitle: "Important Note (NPCI DBT):",
    npciBody: "Scholarship/benefit seedhe bank account mein aane ke liye aapke account ka NPCI / DBT mapping hona zaroori hai.",
    sec4Title: "4. CSC Operator Verification & Application Acknowledgement",
    ackRef: "Application Reference No:",
    ackVle: "CSC Center VLE ID:",
    ackSign: "VLE Seal & Signature:",
    footer: "AmritChidiya National Scheme Platform • Verified Government Portals Only"
  },
  Marathi: {
    modalTitle: "जन सेवा केंद्र (CSC) योजना अर्ज पावती",
    modalBadge: "CSC पावती",
    modalSubtitle: "ही पावती थेट तुमच्या जवळच्या जन सेवा केंद्रात किंवा सायबर कॅफेत घेऊन जा",
    printBtn: "प्रिंट / पीडीएफ सेव्ह करा",
    bannerTitle: "अमृतचिमणी योजना पात्रता व अर्ज पावती",
    bannerSubtitle: "डिजिटल भारत • जन सेवा केंद्र / नागरिक सुविधा केंद्र मदत पावती",
    dossierIdLabel: "पावती क्रमांक:",
    generatedLabel: "दिनांक:",
    statusLabel: "स्थिती:",
    statusValue: "सत्यापित अधिकृत",
    sec1Title: "1. अर्जदार तपशील",
    nameLabel: "अर्जदाराचे नाव:",
    emailLabel: "ईमेल / संपर्क:",
    langLabel: "निवडलेली भाषा:",
    sec2Title: "2. पात्र सरकारी योजना",
    officialPortalLabel: "अधिकृत पोर्टल:",
    sec3Title: "3. आवश्यक कागदपत्रे चेकलिस्ट",
    docAadhaar: "आधार कार्ड (मोबाईल लिंक असलेले)",
    docBank: "बँक पासबुक (NPCI / DBT सीडेड)",
    docIncome: "उत्पन्न प्रमाणपत्र (३ वर्षांतील)",
    docCaste: "जात प्रमाणपत्र",
    docMarksheet: "मागील परीक्षेचे गुणपत्रक",
    docPhotos: "२ पासपोर्ट आकाराचे फोटो",
    npciTitle: "महत्त्वाची नोंद (NPCI DBT):",
    npciBody: "शिष्यवृत्ती थेट खात्यात येण्यासाठी बँक खात्याचे NPCI / DBT मॅपिंग असणे आवश्यक आहे.",
    sec4Title: "4. सीएससी ऑपरेटर पावती",
    ackRef: "अर्ज संदर्भ क्रमांक:",
    ackVle: "सीएससी केंद्र व्हीएलई आयडी:",
    ackSign: "व्हीएलई शिक्का व स्वाक्षरी:",
    footer: "अमृतचिमणी राष्ट्रीय योजना मंच • अधिकृत शासकीय पोर्टल"
  },
  Tamil: {
    modalTitle: "CSC / அரசு சேவை மையம் விண்ணப்ப ஆவணம்",
    modalBadge: "CSC ஆவணம்",
    modalSubtitle: "இந்த ஆவணத்தை உங்கள் உள்ளூர் CSC மையத்திற்கு கொண்டு செல்லவும்",
    printBtn: "அச்சிடுக / PDF சேமிக்கவும்",
    bannerTitle: "அமிர்தசிடியா நலத்திட்ட தகுதி ஆவணம்",
    bannerSubtitle: "டிஜிட்டல் இந்தியா • பொது சேவை மையம் உதவி ஆவணம்",
    dossierIdLabel: "ஆவண எண்:",
    generatedLabel: "தேதி:",
    statusLabel: "நிலை:",
    statusValue: "அங்கீகரிக்கப்பட்டது",
    sec1Title: "1. பயனாளி சுயவிவரம்",
    nameLabel: "பயனாளி பெயர்:",
    emailLabel: "தொடர்பு / மின்னஞ்சல்:",
    langLabel: "விருப்ப மொழி:",
    sec2Title: "2. தகுதியான அரசு திட்டங்கள்",
    officialPortalLabel: "அதிகாரப்பூர்வ தளம்:",
    sec3Title: "3. தேவையான ஆவணங்கள்",
    docAadhaar: "ஆதார் அட்டை (மொபைல் இணைக்கப்பட்டது)",
    docBank: "வங்கி பாஸ்புக் (NPCI / DBT இணைக்கப்பட்டது)",
    docIncome: "வருமானச் சான்றிதழ்",
    docCaste: "சாதிச் சான்றிதழ்",
    docMarksheet: "மதிப்பெண் பட்டியல்",
    docPhotos: "2 பாஸ்போர்ட் அளவு புகைப்படங்கள்",
    npciTitle: "முக்கிய குறிப்பு (NPCI DBT):",
    npciBody: "உதவித்தொகை நேரடியாக வங்கி கணக்கில் வர NPCI / DBT இணைப்பு அவசியமானது.",
    sec4Title: "4. CSC ஆபரேட்டர் ஒப்புதல்",
    ackRef: "விண்ணப்ப குறிப்பு எண்:",
    ackVle: "CSC மைய VLE எண்:",
    ackSign: "VLE முத்திரை & கையொப்பம்:",
    footer: "அமிர்தசிடியா தேசிய நலத்திட்ட தளம் • அதிகாரப்பூர்வ அரசு தளங்கள் மட்டுமே"
  }
};

export default function CscDossierModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  selectedLanguage,
  schemes
}: CscDossierModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [dossierId] = useState(() => 'AC-CSC-' + Math.floor(100000 + Math.random() * 900000));

  const langKey = selectedLanguage || 'English';
  const i18n = DOSSIER_I18N[langKey] || DOSSIER_I18N['English'];

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString(
    langKey === 'English' ? 'en-US' : 'en-IN',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  const displaySchemes = schemes.length > 0 ? schemes : [
    {
      name: langKey === 'English' ? 'Post-Matric Scholarship Scheme' : 'उत्तर प्रदेश पोस्ट मैट्रिक छात्रवृत्ति योजना',
      eligibility_match: '92% Match',
      apply_url: 'https://scholarships.gov.in'
    },
    {
      name: langKey === 'English' ? 'PM Kisan Samman Nidhi Yojana' : 'पीएम किसान सम्मान निधि योजना',
      eligibility_match: '85% Match',
      apply_url: 'https://pmkisan.gov.in'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #csc-dossier-printable, #csc-dossier-printable * {
            visibility: visible !important;
          }
          #csc-dossier-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-[0_0_60px_rgba(245,158,11,0.15)] my-auto max-h-[92vh] flex flex-col">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <span>{i18n.modalTitle}</span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  {i18n.modalBadge}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                {i18n.modalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>{i18n.printBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Dossier Container */}
        <div
          id="csc-dossier-printable"
          ref={printRef}
          className="flex-1 overflow-y-auto space-y-5 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 text-zinc-200 text-xs custom-scrollbar"
        >
          {/* Header Banner */}
          <div className="border-b-2 border-amber-500/60 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">🐦</span>
              <span className="font-bold text-base tracking-wider text-amber-400 uppercase">
                {i18n.bannerTitle}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              {i18n.bannerSubtitle}
            </p>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/50 font-mono">
              <span>{i18n.dossierIdLabel} <strong className="text-zinc-300">{dossierId}</strong></span>
              <span>{i18n.generatedLabel} <strong className="text-zinc-300">{todayStr}</strong></span>
              <span>{i18n.statusLabel} <strong className="text-emerald-400">{i18n.statusValue}</strong></span>
            </div>
          </div>

          {/* Beneficiary Details */}
          <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800">
            <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} /> {i18n.sec1Title}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-500 block text-[10px]">{i18n.nameLabel}</span>
                <span className="font-semibold text-zinc-200">{userName || (langKey === 'English' ? 'Beneficiary' : 'आवेदक')}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">{i18n.emailLabel}</span>
                <span className="font-semibold text-zinc-200 truncate block">{userEmail || 'registered@citizen'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">{i18n.langLabel}</span>
                <span className="font-semibold text-zinc-200">{selectedLanguage || 'English'}</span>
              </div>
            </div>
          </div>

          {/* Recommended Schemes */}
          <div>
            <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" /> {i18n.sec2Title}
            </h4>
            <div className="space-y-2">
              {displaySchemes.map((scheme, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-zinc-200 text-xs">{idx + 1}. {scheme.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {i18n.officialPortalLabel} <span className="font-mono text-amber-400">{scheme.apply_url || 'https://www.myscheme.gov.in'}</span>
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {scheme.eligibility_match}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory CSC Document Checklist */}
          <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
            <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText size={14} /> {i18n.sec3Title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 accent-amber-500" />
                <span>{i18n.docAadhaar}</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 accent-amber-500" />
                <span>{i18n.docBank}</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 accent-amber-500" />
                <span>{i18n.docIncome}</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 accent-amber-500" />
                <span>{i18n.docCaste}</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 accent-amber-500" />
                <span>{i18n.docMarksheet}</span>
              </label>
              <label className="flex items-center gap-2 text-zinc-300">
                <input type="checkbox" defaultChecked className="rounded border-zinc-700 accent-amber-500" />
                <span>{i18n.docPhotos}</span>
              </label>
            </div>

            {/* Critical NPCI Warning */}
            <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-[10px] text-amber-300">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>{i18n.npciTitle}</strong> {i18n.npciBody}
              </span>
            </div>
          </div>

          {/* CSC Operator Verification Slip */}
          <div className="border-t-2 border-dashed border-zinc-800 pt-4">
            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              {i18n.sec4Title}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-[10px] text-zinc-500">
              <div className="border-b border-zinc-800 pb-1">
                <span>{i18n.ackRef}</span>
              </div>
              <div className="border-b border-zinc-800 pb-1">
                <span>{i18n.ackVle}</span>
              </div>
              <div className="border-b border-zinc-800 pb-1">
                <span>{i18n.ackSign}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-zinc-600 pt-2 border-t border-zinc-900">
            {i18n.footer}
          </div>
        </div>
      </div>
    </div>
  );
}
