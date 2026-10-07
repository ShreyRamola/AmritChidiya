'use client';

import React, { useState, useMemo } from 'react';
import { X, Calculator, Sparkles, ArrowRight, IndianRupee, ShieldCheck } from 'lucide-react';

interface EligibilityCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToChat: (query: string) => void;
  selectedLanguage?: string | null;
}

interface SchemeResult {
  name: string;
  category: string;
  annualBenefit: string;
  matchScore: number;
  portalUrl: string;
}

const CALC_I18N: Record<string, Record<string, string>> = {
  English: {
    modalTitle: "Yojana Eligibility Calculator",
    modalBadge: "Eligibility Calculator",
    modalSubtitle: "Instantly compute your eligible government schemes and estimated monetary benefits",
    stateLabel: "State / Domicile",
    categoryLabel: "Social Category",
    incomeLabel: "Annual Family Income",
    profileLabel: "Profile / Status",
    matchedTitle: "Matched Schemes",
    liveFilter: "Live AI Criteria Match",
    criteriaNotice: "AI provides step-by-step guide • Apply directly on official portal",
    askBtn: "Get Step-by-Step Guide",
    applySite: "Official Site"
  },
  Hindi: {
    modalTitle: "योजना पात्रता कैलकुलेटर",
    modalBadge: "पात्रता कैलकुलेटर",
    modalSubtitle: "अपनी पात्र सरकारी योजनाओं और अनुमानित आर्थिक लाभ की तुरंत गणना करें",
    stateLabel: "राज्य (State)",
    categoryLabel: "वर्ग (Category)",
    incomeLabel: "वार्षिक पारिवारिक आय",
    profileLabel: "स्थिति / पेशा",
    matchedTitle: "पात्र सरकारी योजनाएं",
    liveFilter: "लाइव पात्रता मिलान",
    criteriaNotice: "अमृतचिड़िया चरणबद्ध गाइड देती है • आवेदन आधिकारिक पोर्टल पर करें",
    askBtn: "आवेदन गाइड प्राप्त करें",
    applySite: "आधिकारिक पोर्टल"
  },
  Hinglish: {
    modalTitle: "Yojana Eligibility Calculator",
    modalBadge: "Eligibility Calculator",
    modalSubtitle: "Apni eligible sarkari yojanaon aur estimated monetary benefit ko calculate karein",
    stateLabel: "State / Rajya",
    categoryLabel: "Category / Varg",
    incomeLabel: "Annual Family Income",
    profileLabel: "Profile / Status",
    matchedTitle: "Matched Schemes",
    liveFilter: "Live AI Match",
    criteriaNotice: "Step-by-step guidance • Apply directly on official govt portal",
    askBtn: "Get Step-by-Step Guide",
    applySite: "Official Site"
  },
  Marathi: {
    modalTitle: "योजना पात्रता कॅल्क्युलेटर",
    modalBadge: "पात्रता कॅल्क्युलेटर",
    modalSubtitle: "तुमच्या पात्र सरकारी योजनांची आणि आर्थिक लाभाची त्वरित गणना करा",
    stateLabel: "राज्य",
    categoryLabel: "सामाजिक वर्ग",
    incomeLabel: "वार्षिक कौटुंबिक उत्पन्न",
    profileLabel: "सद्यस्थिती / व्यवसाय",
    matchedTitle: "पात्र सरकारी योजना",
    liveFilter: "थेट पात्रता तपासणी",
    criteriaNotice: "मार्गदर्शन सहाय्य • अधिकृत पोर्टलवर थेट अर्ज करा",
    askBtn: "चरणबद्ध मार्गदर्शन घ्या",
    applySite: "अधिकृत पोर्टल"
  },
  Tamil: {
    modalTitle: "நலத்திட்ட தகுதி கால்குலேட்டர்",
    modalBadge: "தகுதி கால்குலேட்டர்",
    modalSubtitle: "உங்கள் தகுதியான அரசு திட்டங்களை உடனடியாக கணக்கிடுங்கள்",
    stateLabel: "மாநிலம்",
    categoryLabel: "சமூக பிரிவு",
    incomeLabel: "ஆண்டு குடும்ப வருமானம்",
    profileLabel: "தற்போதைய நிலை",
    matchedTitle: "பொருந்திய திட்டங்கள்",
    liveFilter: "நேரடி தகுதி சரிபார்ப்பு",
    criteriaNotice: "வழிகாட்டுதல் உதவி • அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்கவும்",
    askBtn: "படி-படியான வழிகாட்டல் பெறுக",
    applySite: "அதிகாரப்பூர்வ தளம்"
  }
};

export default function EligibilityCalculatorModal({
  isOpen,
  onClose,
  onApplyToChat,
  selectedLanguage
}: EligibilityCalculatorModalProps) {
  const [state, setState] = useState('Uttar Pradesh');
  const [category, setCategory] = useState('OBC');
  const [income, setIncome] = useState('1.5 Lakh');
  const [role, setRole] = useState('College Student');
  const [gender, setGender] = useState('All');

  const langKey = selectedLanguage || 'English';
  const i18n = CALC_I18N[langKey] || CALC_I18N['English'];

  // Real-time calculation logic based on Indian scheme criteria
  const calculatedSchemes: SchemeResult[] = useMemo(() => {
    const list: SchemeResult[] = [];

    // Students
    if (role.includes('Student') || role.includes('College') || role.includes('School')) {
      if (state === 'Uttar Pradesh') {
        list.push({
          name: 'UP Post-Matric Scholarship & Fee Reimbursement',
          category: 'Education Support',
          annualBenefit: '₹30,000 - ₹55,000 / yr',
          matchScore: 96,
          portalUrl: 'https://scholarship.up.gov.in'
        });
      } else if (state === 'Maharashtra') {
        list.push({
          name: 'MahaDBT Post-Matric Scholarship',
          category: 'Education Support',
          annualBenefit: '₹25,000 - ₹50,000 / yr',
          matchScore: 94,
          portalUrl: 'https://mahadbt.maharashtra.gov.in'
        });
      }

      list.push({
        name: 'National Scholarship Portal (NSP) Central Sector Scheme',
        category: 'Higher Education',
        annualBenefit: '₹20,000 - ₹35,000 / yr',
        matchScore: 91,
        portalUrl: 'https://scholarships.gov.in'
      });

      if (category === 'Minority') {
        list.push({
          name: 'Begum Hazrat Mahal National Scholarship',
          category: 'Minority Girls Education',
          annualBenefit: '₹12,000 / yr',
          matchScore: 95,
          portalUrl: 'https://bhmns-medu.gov.in'
        });
      }

      if (gender === 'Female') {
        list.push({
          name: 'AICTE Pragati Scholarship for Girls',
          category: 'Technical Education',
          annualBenefit: '₹50,000 / yr',
          matchScore: 92,
          portalUrl: 'https://www.aicte-india.org'
        });
      }
    }

    // Farmers
    if (role.includes('Farmer') || role.includes('Kisan')) {
      list.push({
        name: 'PM Kisan Samman Nidhi Yojana',
        category: 'Direct Income Support',
        annualBenefit: '₹6,000 / yr (in 3 installments)',
        matchScore: 98,
        portalUrl: 'https://pmkisan.gov.in'
      });
      list.push({
        name: 'PM Fasal Bima Yojana (Crop Insurance)',
        category: 'Agricultural Security',
        annualBenefit: 'Up to ₹2,00,000 coverage',
        matchScore: 89,
        portalUrl: 'https://pmfby.gov.in'
      });
    }

    // Street vendors / Small business
    if (role.includes('Vendor') || role.includes('Self-Employed') || role.includes('Entrepreneur')) {
      list.push({
        name: 'PM SVANidhi Micro-Credit Scheme',
        category: 'Working Capital Loan',
        annualBenefit: '₹10,000 to ₹50,000 (Low Interest)',
        matchScore: 95,
        portalUrl: 'https://pmsvanidhi.mohua.gov.in'
      });
      list.push({
        name: 'Pradhan Mantri MUDRA Yojana (Shishu/Kishore)',
        category: 'Business Loan',
        annualBenefit: 'Up to ₹5,00,000 collateral-free',
        matchScore: 88,
        portalUrl: 'https://www.mudra.org.in'
      });
    }

    // Universal Health / Social Security
    if (income === 'Under 1 Lakh' || income === '1.5 Lakh' || category === 'SC' || category === 'ST') {
      list.push({
        name: 'Ayushman Bharat PM-JAY Health Coverage',
        category: 'Health Security',
        annualBenefit: '₹5,00,000 free hospitalization/yr',
        matchScore: 97,
        portalUrl: 'https://pmjay.gov.in'
      });
    }

    return list;
  }, [state, category, income, role, gender]);

  const handleSendToChat = () => {
    let prompt = "";
    if (langKey === 'English') {
      prompt = `I am a resident of ${state}. Category: ${category}, Annual Family Income: ${income}, Profile: ${role}, Gender: ${gender}. Which government schemes and scholarships am I eligible for? Please guide me step-by-step on eligibility and application process.`;
    } else if (langKey === 'Hindi') {
      prompt = `मैं ${state} का निवासी हूँ। वर्ग: ${category}, वार्षिक पारिवारिक आय: ${income}, स्थिति: ${role}, लिंग: ${gender}। मुझे किन सरकारी योजनाओं और छात्रवृत्तियों का लाभ मिल सकता है? कृपया पात्रता और आवेदन प्रक्रिया विस्तार से बताएं।`;
    } else if (langKey === 'Marathi') {
      prompt = `मी ${state} चा रहिवासी आहे. जात/वर्ग: ${category}, वार्षिक उत्पन्न: ${income}, स्थिती: ${role}, लिंग: ${gender}. मला कोणत्या सरकारी योजनांचा आणि शिष्यवृत्तीचा लाभ मिळू शकतो? कृपया माहिती द्या.`;
    } else if (langKey === 'Tamil') {
      prompt = `நான் ${state} மாநிலத்தில் வசிக்கிறேன். பிரிவு: ${category}, ஆண்டு வருமானம்: ${income}, நிலை: ${role}. நான் என்னென்ன அரசு திட்டங்கள் மற்றும் கல்வி உதவித்தொகைகளுக்கு தகுதியானவன்? வழிகாட்டவும்.`;
    } else {
      prompt = `Main ${state} ka rehne wala hoon. Category: ${category}, Annual Income: ${income}, Profile: ${role}, Gender: ${gender}. Mujhe kaunsi sarkari yojanaon aur scholarships ka labh mil sakta hai? Eligibility aur apply process batayein.`;
    }
    onApplyToChat(prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 relative shadow-[0_0_60px_rgba(245,158,11,0.2)] my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-bold">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>{i18n.modalTitle}</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {i18n.modalBadge}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                {i18n.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 border-b border-zinc-800/80">
          {/* State */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{i18n.stateLabel}</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Bihar">Bihar</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Delhi">Delhi</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="All India">All India / Other States</option>
            </select>
          </div>

          {/* Social Category */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{i18n.categoryLabel}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="General">General</option>
              <option value="OBC">OBC (Other Backward Class)</option>
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="EWS">EWS (Economically Weaker Section)</option>
              <option value="Minority">Minority</option>
            </select>
          </div>

          {/* Annual Family Income */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{i18n.incomeLabel}</label>
            <select
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="Under 1 Lakh">&lt; ₹1 Lakh / yr</option>
              <option value="1.5 Lakh">₹1 - 2.5 Lakhs / yr</option>
              <option value="3 Lakh">₹2.5 - 5 Lakhs / yr</option>
              <option value="Above 5 Lakh">&gt; ₹5 Lakhs / yr</option>
            </select>
          </div>

          {/* Role / Profile */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{i18n.profileLabel}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50"
            >
              <option value="College Student">College / Higher Education / Degree</option>
              <option value="Class 11-12th">School (Class 11th - 12th)</option>
              <option value="Farmer / Kisan">Farmer / Kisan</option>
              <option value="Street Vendor / Self-Employed">Small Business / Street Vendor</option>
              <option value="Women Entrepreneur">Women Entrepreneur</option>
            </select>
          </div>
        </div>

        {/* Calculation Result Feed */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} /> {i18n.matchedTitle} ({calculatedSchemes.length})
            </span>
            <span className="text-[10px] text-zinc-500">
              {i18n.liveFilter}
            </span>
          </div>

          {calculatedSchemes.map((scheme, idx) => (
            <div
              key={idx}
              className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-zinc-200 truncate">{scheme.name}</h4>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {scheme.matchScore}% Match
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-1">
                  <span>{scheme.category}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                    <IndianRupee size={10} /> {scheme.annualBenefit}
                  </span>
                </div>
              </div>

              <a
                href={scheme.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[10px] font-bold px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 rounded-xl border border-zinc-700 transition-all"
              >
                {i18n.applySite}
              </a>
            </div>
          ))}
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
          <div className="text-[10px] text-zinc-500 flex items-center gap-1">
            <ShieldCheck size={13} className="text-amber-500" />
            <span>{i18n.criteriaNotice}</span>
          </div>
          <button
            onClick={handleSendToChat}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
          >
            <span>{i18n.askBtn}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
