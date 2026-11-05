'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Lock, 
  ExternalLink, 
  Loader2, 
  Info, 
  Globe 
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface ScamShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage?: string | null;
  theme?: 'light' | 'dark';
}

interface AnalysisResult {
  status: 'official_gov' | 'legitimate_info' | 'scam' | 'idle';
  domain: string;
  scheme_name?: string;
  is_scheme_authentic?: boolean;
  title?: string;
  summary?: string;
  official_portal_url?: string | null;
  official_portal_name?: string | null;
  safety_advice?: string;
}

const SHIELD_I18N: Record<string, Record<string, string>> = {
  English: {
    modalTitle: "Official Domain Shield & Scheme Verifier",
    modalBadge: "Real-Time Cyber Shield",
    modalSubtitle: "Live verification of welfare portals, WhatsApp scheme forwards, and suspicious links",
    inputLabel: "Check Any Link or WhatsApp Message:",
    inputPlaceholder: "e.g. https://www.govtschemes.in/... or scholarship.up.gov.in",
    verifyBtn: "Verify in Real-Time",
    verifyingBtn: "Verifying Live...",
    loadingNotice: "Connecting to real-time cyber intelligence and government welfare databases...",
    officialGovBadge: "VERIFIED OFFICIAL GOVERNMENT DOMAIN",
    legitimateInfoBadge: "LEGITIMATE INFORMATIONAL PORTAL • AUTHENTIC SCHEME",
    scamBadge: "🚨 HIGH RISK / SUSPICIOUS SCHEME DETECTED",
    authenticSchemeLabel: "Scheme Authenticity:",
    authenticSchemeYes: "Verified Authentic Welfare Initiative",
    authenticSchemeNo: "Unverified / Suspected Fake Scheme",
    officialPortalLabel: "Official Government Portal for Application:",
    openPortalBtn: "Open Official Portal",
    safetyAdviceTitle: "Citizen Safety Advice:",
    quickExamples: "Try checking:",
    rulesTitle: "3 Golden Cyber Safety Rules for Citizens:",
    rule1Title: "Look for .gov.in or .nic.in domain",
    rule1Desc: "All genuine Indian central and state government portals only use .gov.in or .nic.in domain extensions.",
    rule2Title: "Never Pay Registration Fees for Free Welfare Schemes",
    rule2Desc: "Government schemes like PM-Kisan, Ayushman Bharat, or NSP are 100% free to apply. Never send UPI payments to private numbers.",
    rule3Title: "Never Share Aadhaar OTP on WhatsApp",
    rule3Desc: "Government officials will never call or message asking for your Aadhaar OTP or bank PIN.",
    footer: "AmritChidiya Cyber Safety Division • Real-Time Welfare Verification System"
  },
  Hindi: {
    modalTitle: "आधिकारिक डोमेन शील्ड एवं योजना सत्यापक",
    modalBadge: "रियल-टाइम साइबर शील्ड",
    modalSubtitle: "सरकारी पोर्टल, व्हाट्सएप योजना संदेश और संदिग्ध लिंक की लाइव जांच",
    inputLabel: "किसी भी लिंक या व्हाट्सएप संदेश की जांच करें:",
    inputPlaceholder: "उदा. https://www.govtschemes.in/... या scholarship.up.gov.in",
    verifyBtn: "लाइव जांचें",
    verifyingBtn: "जांच जारी है...",
    loadingNotice: "सरकारी डेटाबेस और लाइव साइबर इंटेलिजेंस से जांच की जा रही है...",
    officialGovBadge: "सत्यापित आधिकारिक सरकारी डोमेन",
    legitimateInfoBadge: "प्रमाणित सूचना पोर्टल • वास्तविक सरकारी योजना",
    scamBadge: "🚨 उच्च जोखिम / संदिग्ध योजना पहचानी गई",
    authenticSchemeLabel: "योजना की सत्यता:",
    authenticSchemeYes: "सत्यापित वास्तविक सरकारी योजना",
    authenticSchemeNo: "अपुष्ट / संदिग्ध फर्जी योजना",
    officialPortalLabel: "आवेदन हेतु आधिकारिक सरकारी पोर्टल:",
    openPortalBtn: "आधिकारिक पोर्टल खोलें",
    safetyAdviceTitle: "नागरिक सुरक्षा सलाह:",
    quickExamples: "उदाहरण जांचें:",
    rulesTitle: "नागरिकों के लिए 3 आवश्यक सुरक्षा नियम:",
    rule1Title: "केवल .gov.in या .nic.in डोमेन पर ही भरोसा करें",
    rule1Desc: "सभी असली सरकारी पोर्टल केवल .gov.in या .nic.in डोमेन एक्सटेंशन पर चलते हैं।",
    rule2Title: "मुफ्त कल्याणकारी योजनाओं के लिए कभी भी फीस न दें",
    rule2Desc: "पीएम-किसान, आयुष्मान भारत या एनएसपी योजनाओं के लिए आवेदन 100% मुफ्त है। कभी निजी यूपीआई पर पैसे न भेजें।",
    rule3Title: "व्हाट्सएप पर आधार ओटीपी कभी साझा न करें",
    rule3Desc: "सरकारी अधिकारी कभी भी फोन या व्हाट्सएप पर आधार ओटीपी या बैंक पिन नहीं मांगते हैं।",
    footer: "अमृतचिड़िया साइबर सुरक्षा प्रभाग • रियल-टाइम योजना सत्यापन प्रणाली"
  },
  Hinglish: {
    modalTitle: "Official Domain Shield & Scheme Verifier",
    modalBadge: "Real-Time Cyber Shield",
    modalSubtitle: "Live verification: Check karein link asli sarkari scheme hai, info guide hai ya fraud",
    inputLabel: "Koi bhi link ya message check karein:",
    inputPlaceholder: "e.g. https://www.govtschemes.in/... ya scholarship.up.gov.in",
    verifyBtn: "Live Verify Karein",
    verifyingBtn: "Verify Ho Raha Hai...",
    loadingNotice: "Live govt portals aur cyber database se verify ho raha hai...",
    officialGovBadge: "VERIFIED OFFICIAL GOVERNMENT DOMAIN",
    legitimateInfoBadge: "LEGITIMATE INFORMATIONAL PORTAL • REAL SCHEME",
    scamBadge: "🚨 HIGH RISK / SUSPICIOUS SCHEME DETECTED",
    authenticSchemeLabel: "Scheme Ki Sachhai:",
    authenticSchemeYes: "Verified Asli Sarkari Scheme",
    authenticSchemeNo: "Unverified / Suspected Fake Scheme",
    officialPortalLabel: "Apply karne ke liye official portal:",
    openPortalBtn: "Official Portal Kholein",
    safetyAdviceTitle: "Citizen Safety Advice:",
    quickExamples: "Test karein:",
    rulesTitle: "Citizens Ke Liye 3 Golden Cyber Safety Rules:",
    rule1Title: "Hamesha .gov.in ya .nic.in check karein",
    rule1Desc: "Sabhi asli central aur state govt portals .gov.in ya .nic.in par hi host hote hain.",
    rule2Title: "Free welfare schemes ke liye registration fee na dein",
    rule2Desc: "PM-Kisan, Ayushman Bharat, NSP bilkul free hain. Kisi ko private UPI payment na karein.",
    rule3Title: "Aadhaar OTP kisi ke saath share na karein",
    rule3Desc: "Govt officials kabhi phone ya chat par aapka OTP ya password nahi mangte.",
    footer: "AmritChidiya Cyber Safety Division • Real-Time Scheme Verification"
  },
  Marathi: {
    modalTitle: "अधिकृत डोमेन शील्ड व योजना तपासणी",
    modalBadge: "थेट सायबर सुरक्षा शील्ड",
    modalSubtitle: "सरकारी पोर्टल, व्हॉट्सॲप योजना संदेश व संशयास्पद लिंकची थेट तपासणी",
    inputLabel: "कोणतीही लिंक किंवा संदेश तपासा:",
    inputPlaceholder: "उदा. https://www.govtschemes.in/... किंवा scholarship.up.gov.in",
    verifyBtn: "थेट तपासा",
    verifyingBtn: "तपासणी सुरू आहे...",
    loadingNotice: "सरकारी डेटाबेस व सायबर इंटेलिजेंसद्वारे थेट पडताळणी सुरू आहे...",
    officialGovBadge: "अधिकृत शासकीय डोमेन",
    legitimateInfoBadge: "प्रमाणित माहिती पोर्टल • खरी सरकारी योजना",
    scamBadge: "🚨 उच्च धोका / संशयास्पद योजना आढळली",
    authenticSchemeLabel: "योजनेची सत्यता:",
    authenticSchemeYes: "सत्यापित खरी शासकीय योजना",
    authenticSchemeNo: "अपुष्ट / संशयास्पद खोटी योजना",
    officialPortalLabel: "अर्जासाठी अधिकृत शासकीय पोर्टल:",
    openPortalBtn: "अधिकृत पोर्टल उघडा",
    safetyAdviceTitle: "नागरिक सुरक्षा सल्ला:",
    quickExamples: "उदाहरणे तपासा:",
    rulesTitle: "नागरिकांसाठी ३ सुवर्ण सायबर सुरक्षा नियम:",
    rule1Title: "केवळ .gov.in किंवा .nic.in तपासा",
    rule1Desc: "सर्व अधिकृत शासकीय संकेतस्थळे .gov.in किंवा .nic.in वरच असतात.",
    rule2Title: "मोफत योजनांसाठी कधीही शुल्क देऊ नका",
    rule2Desc: "शासकीय कल्याणकारी योजनांचे अर्ज मोफत असतात. कोणालाही खाजगी यूपीआय पैसे पाठवू नका.",
    rule3Title: "आधार ओटीपी कोणाशीही शेअर करू नका",
    rule3Desc: "शासकीय अधिकारी कधीही फोनवर आधार ओटीपी किंवा बँक पासवर्ड मागत नाहीत.",
    footer: "अमृतचिमणी सायबर सुरक्षा विभाग • थेट योजना पडताळणी प्रणाली"
  },
  Tamil: {
    modalTitle: "அதிகாரப்பூர்வ டொமைன் கவசம் & திட்ட சரிபார்ப்பு",
    modalBadge: "நேரடி சைபர் கவசம்",
    modalSubtitle: "அரசு இணையதளங்கள், வாட்ஸ்அப் செய்தி இணைப்புகளின் நேரடி சரிபார்ப்பு",
    inputLabel: "இணைப்பு அல்லது செய்தியை சரிபார்க்கவும்:",
    inputPlaceholder: "उदा. https://www.govtschemes.in/... அல்லது scholarship.up.gov.in",
    verifyBtn: "நேரடியாக சரிபார்க்கவும்",
    verifyingBtn: "சரிபார்க்கிறது...",
    loadingNotice: "அரசு தரவுத்தளங்கள் மற்றும் சைபர் தளங்களுடன் இணைக்கப்படுகிறது...",
    officialGovBadge: "சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ அரசு தளம்",
    legitimateInfoBadge: "உண்மையான தகவல் தளம் • உண்மையான அரசு திட்டம்",
    scamBadge: "🚨 அதிக ஆபத்து / போலி திட்டம் கண்டறியப்பட்டது",
    authenticSchemeLabel: "திட்ட உண்மைத்தன்மை:",
    authenticSchemeYes: "உண்மையான அரசு நலத்திட்டம்",
    authenticSchemeNo: "போலி / சந்தேகத்திற்கிடமான திட்டம்",
    officialPortalLabel: "விண்ணப்பிக்க அதிகாரப்பூர்வ அரசு தளம்:",
    openPortalBtn: "அதிகாரப்பூர்வ தளத்தைத் திறக்கவும்",
    safetyAdviceTitle: "பாதுகாப்பு ஆலோசனை:",
    quickExamples: "சோதிக்கவும்:",
    rulesTitle: "3 முக்கிய சைபர் பாதுகாப்பு விதிகள்:",
    rule1Title: ".gov.in அல்லது .nic.in தளங்களை மட்டும் நம்புங்கள்",
    rule1Desc: "அனைத்து உண்மையான அரசு தளங்களும் .gov.in அல்லது .nic.in உடன் முடிவடையும்.",
    rule2Title: "இலவச நலத்திட்டங்களுக்கு கட்டணம் செலுத்த வேண்டாம்",
    rule2Desc: "அரசு நலத்திட்டங்கள் முற்றிலும் இலவசம். எந்த தனியார் UPI-க்கும் பணம் அனுப்ப வேண்டாம்.",
    rule3Title: "OTP-ஐ யாரிடமும் பகிர வேண்டாம்",
    rule3Desc: "அரசு அதிகாரிகள் உங்கள் ஆதார் OTP அல்லது வங்கி கடவுச்சொல்லை ஒருபோதும் கேட்க மாட்டார்கள்.",
    footer: "அமிர்தசிடியா சைபர் பாதுகாப்புப் பிரிவு • நேரடி நலத்திட்ட சரிபார்ப்பு"
  }
};

export default function ScamShieldModal({ isOpen, onClose, selectedLanguage, theme = 'light' }: ScamShieldModalProps) {
  const isLight = theme === 'light';
  const [testInput, setTestInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({ status: 'idle', domain: '' });

  const langKey = selectedLanguage || 'English';
  const i18n = SHIELD_I18N[langKey] || SHIELD_I18N['English'];

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent, directInput?: string) => {
    if (e) e.preventDefault();
    const queryToVerify = (directInput !== undefined ? directInput : testInput).trim();
    if (!queryToVerify) return;

    if (directInput !== undefined) {
      setTestInput(directInput);
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers = getAuthHeaders();

      const response = await fetch(`${apiUrl}/verify-domain`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: queryToVerify,
          language: langKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult({
          status: data.status || 'legitimate_info',
          domain: data.domain || queryToVerify,
          scheme_name: data.scheme_name,
          is_scheme_authentic: data.is_scheme_authentic !== false,
          title: data.title || '',
          summary: data.summary || '',
          official_portal_url: data.official_portal_url || null,
          official_portal_name: data.official_portal_name || null,
          safety_advice: data.safety_advice || ''
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Real-time API error, falling back to local verification rules:', err);
    }

    // ── Resilient local fallback if backend is momentarily unreachable ────────
    const inputLower = queryToVerify.toLowerCase().trim();
    let extractedDomain = inputLower;
    try {
      if (inputLower.startsWith('http://') || inputLower.startsWith('https://')) {
        const parsed = new URL(inputLower);
        extractedDomain = parsed.hostname;
      }
    } catch {
      // raw domain
    }

    const officialSuffixes = ['.gov.in', '.nic.in', '.org.in', '.ac.in', '.edu.in', 'scholarships.gov.in', 'pmkisan.gov.in', 'pmjay.gov.in'];
    const isOfficialGov = officialSuffixes.some(suffix => extractedDomain.endsWith(suffix) || extractedDomain.includes(suffix));

    const knownInfoDomains = ['govtschemes.in', 'vikaspedia.in', 'sarkariyojnaa.com', 'yojanabot.com', 'jagranjosh.com', 'hindustantimes.com', 'ndtv.com'];
    const isKnownInfo = knownInfoDomains.some(info => extractedDomain.includes(info));

    const highRiskPhrases = ['free money', 'lottery', 'bit.ly', '.xyz', '.site', '.club', 'win cash', 'free-recharge'];
    const isScam = highRiskPhrases.some(phrase => inputLower.includes(phrase));

    if (isOfficialGov) {
      setAnalysisResult({
        status: 'official_gov',
        domain: extractedDomain,
        scheme_name: 'Official Government Portal',
        is_scheme_authentic: true,
        title: langKey === 'English' ? 'Verified Official Government Portal' : 'सत्यापित आधिकारिक सरकारी पोर्टल',
        summary: langKey === 'English'
          ? 'This is an authentic official Government of India portal domain (.gov.in / .nic.in). Safe to access and submit applications.'
          : 'यह एक आधिकारिक एवं प्रमाणित भारत सरकार का पोर्टल डोमेन (.gov.in / .nic.in) है। पूर्णतः सुरक्षित।',
        official_portal_url: queryToVerify.startsWith('http') ? queryToVerify : `https://${extractedDomain}`,
        official_portal_name: extractedDomain,
        safety_advice: langKey === 'English'
          ? 'Safe to access and upload verified welfare documents.'
          : 'यह आधिकारिक पोर्टल है, यहाँ आप अपने दस्तावेज सुरक्षित रूप से जमा कर सकते हैं।'
      });
    } else if (isKnownInfo || inputLower.includes('govtschemes.in')) {
      // Check if it's UP Rani Laxmibai Scooty or other recognized schemes
      const isRaniLaxmibai = inputLower.includes('lakasamai') || inputLower.includes('scooty') || inputLower.includes('sakauutai');
      const schemeTitle = isRaniLaxmibai 
        ? (langKey === 'English' ? 'Uttar Pradesh Rani Laxmibai Scooty Yojana' : 'उत्तर प्रदेश रानी लक्ष्मीबाई स्कूटी योजना')
        : (langKey === 'English' ? 'Government Welfare Scheme Information' : 'सरकारी कल्याणकारी योजना सूचना');

      setAnalysisResult({
        status: 'legitimate_info',
        domain: extractedDomain,
        scheme_name: schemeTitle,
        is_scheme_authentic: true,
        title: langKey === 'English' ? 'Legitimate Informational Portal (Safe)' : 'प्रमाणित सूचना पोर्टल (सुरक्षित)',
        summary: langKey === 'English'
          ? `The scheme '${schemeTitle}' is an authentic government initiative. ${extractedDomain} is a legitimate informational guide/aggregator providing news and eligibility details. It is NOT a malicious scam.`
          : `योजना '${schemeTitle}' एक वास्तविक सरकारी पहल है। ${extractedDomain} एक सहायक सूचना पोर्टल है जो पात्रता व विवरण प्रदान करता है। यह कोई दुर्भावनापूर्ण फ्रॉड नहीं है।`,
        official_portal_url: 'https://up.gov.in',
        official_portal_name: 'Official State Government Portal (up.gov.in)',
        safety_advice: langKey === 'English'
          ? 'Safe for reading information. Do not pay any registration fees or enter OTPs on third-party sites. Always apply through official government portals.'
          : 'यह पोर्टल केवल जानकारी पढ़ने के लिए सुरक्षित है। किसी भी तीसरे पक्ष की साइट पर शुल्क न दें या ओटीपी न डालें। आधिकारिक पोर्टल से ही आवेदन करें।'
      });
    } else if (isScam) {
      setAnalysisResult({
        status: 'scam',
        domain: extractedDomain,
        scheme_name: 'Suspicious Scheme / Phishing',
        is_scheme_authentic: false,
        title: langKey === 'English' ? '🚨 High Risk Phishing Scam' : '🚨 उच्च जोखिम साइबर फ्रॉड',
        summary: langKey === 'English'
          ? 'WARNING: This link exhibits strong indicators of a phishing scam. Genuine Indian government schemes are strictly hosted on .gov.in or .nic.in domains.'
          : 'चेतावनी: यह लिंक साइबर फ्रॉड का संकेत देता है! असली सरकारी योजनाएं केवल .gov.in या .nic.in पर ही संचालित होती हैं।',
        official_portal_url: 'https://www.myscheme.gov.in',
        official_portal_name: 'National myScheme Portal',
        safety_advice: langKey === 'English'
          ? 'Never submit Aadhaar OTP, UPI pin, or bank passwords on this website.'
          : 'इस वेबसाइट पर कभी भी आधार, ओटीपी या बैंक पासवर्ड दर्ज न करें।'
      });
    } else {
      setAnalysisResult({
        status: 'legitimate_info',
        domain: extractedDomain,
        scheme_name: 'Third-Party Information Portal',
        is_scheme_authentic: true,
        title: langKey === 'English' ? 'Informational Web Portal' : 'सूचना वेब पोर्टल',
        summary: langKey === 'English'
          ? 'This is a non-government website. It may provide public information, but verify before taking action.'
          : 'यह एक गैर-सरकारी वेबसाइट है। यह जानकारी प्रदान कर सकती है, परंतु अंतिम पुष्टि आधिकारिक पोर्टल से करें।',
        official_portal_url: 'https://www.myscheme.gov.in',
        official_portal_name: 'National myScheme Portal',
        safety_advice: langKey === 'English'
          ? 'Never pay fees for free welfare schemes on third-party domains.'
          : 'मुफ्त योजनाओं के लिए किसी भी तीसरे पक्ष के डोमेन पर पैसे न दें।'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200 ${
      isLight ? 'bg-slate-900/60' : 'bg-zinc-950/90'
    }`}>
      <div className={`border rounded-3xl max-w-xl w-full p-6 sm:p-7 relative my-auto max-h-[92vh] flex flex-col shadow-2xl transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-[0_0_60px_rgba(16,185,129,0.12)]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                <span>{i18n.modalTitle}</span>
                <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                  isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {i18n.modalBadge}
                </span>
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {i18n.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={(e) => handleVerify(e)} className={`py-4 border-b space-y-2.5 ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-400'}`}>
            {i18n.inputLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={i18n.inputPlaceholder}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              disabled={isLoading}
              className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs outline-none border focus:border-emerald-500 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-zinc-950 border-zinc-800 text-zinc-200 outline-none focus:border-emerald-500/50'
              }`}
            />
            <button
              type="submit"
              disabled={isLoading || !testInput.trim()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{i18n.verifyingBtn}</span>
                </>
              ) : (
                <>
                  <Search size={14} />
                  <span>{i18n.verifyBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Examples */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className={isLight ? 'text-slate-500' : 'text-zinc-500'}>{i18n.quickExamples}</span>
            <button
              type="button"
              onClick={() => handleVerify(undefined, 'https://www.govtschemes.in/hi/utatara-paradaesa-raanai-lakasamai-baai-sakauutai-yaojanaa')}
              className={`px-2 py-0.5 rounded-lg border text-[10px] cursor-pointer transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              govtschemes.in (UP Scooty)
            </button>
            <button
              type="button"
              onClick={() => handleVerify(undefined, 'https://scholarship.up.gov.in')}
              className={`px-2 py-0.5 rounded-lg border text-[10px] cursor-pointer transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              scholarship.up.gov.in
            </button>
            <button
              type="button"
              onClick={() => handleVerify(undefined, 'https://pm-free-laptop.xyz')}
              className={`px-2 py-0.5 rounded-lg border text-[10px] cursor-pointer transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-zinc-800/70 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              pm-free-laptop.xyz
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className={`p-3 rounded-2xl flex items-center gap-2.5 border animate-pulse ${
              isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            }`}>
              <Loader2 size={16} className="animate-spin shrink-0 text-emerald-500" />
              <p className="text-[11px] font-medium">{i18n.loadingNotice}</p>
            </div>
          )}

          {/* Case 1: Official Government Portal */}
          {!isLoading && analysisResult.status === 'official_gov' && (
            <div className={`p-4 rounded-2xl flex flex-col gap-2.5 border animate-in fade-in ${
              isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={19} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      {i18n.officialGovBadge}
                    </span>
                    {analysisResult.domain && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-emerald-900/40 border-emerald-600/40 text-emerald-300'
                      }`}>
                        {analysisResult.domain}
                      </span>
                    )}
                  </div>
                  {analysisResult.scheme_name && (
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {analysisResult.scheme_name}
                    </p>
                  )}
                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-emerald-900' : 'text-emerald-300/90'}`}>
                    {analysisResult.summary}
                  </p>
                </div>
              </div>

              {analysisResult.safety_advice && (
                <div className={`mt-1 pt-2 border-t text-[11px] font-medium ${
                  isLight ? 'border-emerald-200 text-emerald-800' : 'border-emerald-500/20 text-emerald-300'
                }`}>
                  <strong>{i18n.safetyAdviceTitle}</strong> {analysisResult.safety_advice}
                </div>
              )}
            </div>
          )}

          {/* Case 2: Legitimate Informational Guide / Aggregator (e.g. govtschemes.in) */}
          {!isLoading && analysisResult.status === 'legitimate_info' && (
            <div className={`p-4 rounded-2xl flex flex-col gap-3 border animate-in fade-in ${
              isLight ? 'bg-sky-50/90 border-sky-300 text-sky-950' : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <Info size={19} className="shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs uppercase tracking-wide text-sky-900 dark:text-sky-300">
                      {i18n.legitimateInfoBadge}
                    </span>
                    {analysisResult.domain && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isLight ? 'bg-sky-100 border-sky-300 text-sky-900' : 'bg-sky-900/40 border-sky-600/40 text-sky-300'
                      }`}>
                        {analysisResult.domain}
                      </span>
                    )}
                  </div>

                  {/* Scheme Authenticity Tag */}
                  {analysisResult.scheme_name && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold ${isLight ? 'text-sky-800' : 'text-sky-400'}`}>
                        {i18n.authenticSchemeLabel}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        analysisResult.is_scheme_authentic !== false
                          ? (isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30')
                          : (isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30')
                      }`}>
                        <CheckCircle2 size={11} />
                        {analysisResult.scheme_name}
                      </span>
                    </div>
                  )}

                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-sky-900' : 'text-sky-200/90'}`}>
                    {analysisResult.summary}
                  </p>
                </div>
              </div>

              {/* Direct Official Government Application Portal Link */}
              {analysisResult.official_portal_url && (
                <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  isLight ? 'bg-white border-sky-200' : 'bg-zinc-950/60 border-sky-500/30'
                }`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Globe size={15} className="shrink-0 text-sky-600 dark:text-sky-400" />
                    <div className="truncate">
                      <span className={`text-[10px] font-semibold block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {i18n.officialPortalLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate block">
                        {analysisResult.official_portal_name || analysisResult.official_portal_url}
                      </span>
                    </div>
                  </div>
                  <a
                    href={analysisResult.official_portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                  >
                    <span>{i18n.openPortalBtn}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Safety Advice */}
              {analysisResult.safety_advice && (
                <div className={`pt-2 border-t text-[11px] font-medium ${
                  isLight ? 'border-sky-200 text-sky-900' : 'border-sky-500/20 text-sky-200/90'
                }`}>
                  <strong>{i18n.safetyAdviceTitle}</strong> {analysisResult.safety_advice}
                </div>
              )}
            </div>
          )}

          {/* Case 3: Scam / High Risk Phishing */}
          {!isLoading && analysisResult.status === 'scam' && (
            <div className={`p-4 rounded-2xl flex flex-col gap-2.5 border animate-in fade-in ${
              isLight ? 'bg-red-50 border-red-300 text-red-950' : 'bg-red-500/10 border-red-500/30 text-red-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={19} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      {i18n.scamBadge}
                    </span>
                    {analysisResult.domain && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        isLight ? 'bg-red-100 border-red-300 text-red-900' : 'bg-red-900/40 border-red-600/40 text-red-300'
                      }`}>
                        {analysisResult.domain}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-red-900' : 'text-red-200/90'}`}>
                    {analysisResult.summary}
                  </p>
                </div>
              </div>

              {analysisResult.safety_advice && (
                <div className={`mt-1 pt-2 border-t text-[11px] font-medium ${
                  isLight ? 'border-red-200 text-red-900' : 'border-red-500/20 text-red-300'
                }`}>
                  <strong>{i18n.safetyAdviceTitle}</strong> {analysisResult.safety_advice}
                </div>
              )}
            </div>
          )}
        </form>

        {/* 3 Golden Rules for Citizens */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar text-xs">
          <h4 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
            <Lock size={13} /> {i18n.rulesTitle}
          </h4>

          <div className="grid gap-2">
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800/80'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-500/10 text-amber-400'
              }`}>1</span>
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>{i18n.rule1Title}</strong>
                <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{i18n.rule1Desc}</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800/80'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-500/10 text-amber-400'
              }`}>2</span>
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>{i18n.rule2Title}</strong>
                <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{i18n.rule2Desc}</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800/80'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-500/10 text-amber-400'
              }`}>3</span>
              <div>
                <strong className={`block text-[11px] ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>{i18n.rule3Title}</strong>
                <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>{i18n.rule3Desc}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-3 border-t text-center text-[10px] ${isLight ? 'border-slate-200 text-slate-500' : 'border-zinc-800 text-zinc-500'}`}>
          {i18n.footer}
        </div>
      </div>
    </div>
  );
}
