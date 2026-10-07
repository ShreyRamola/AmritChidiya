'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, Search, Lock } from 'lucide-react';

interface ScamShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage?: string | null;
}

const SHIELD_I18N: Record<string, Record<string, string>> = {
  English: {
    modalTitle: "Official Domain Shield & Scam Checker",
    modalBadge: "Cyber Shield",
    modalSubtitle: "Verify if a WhatsApp scheme link or message is authentic or a phishing scam",
    inputLabel: "Check Any Link or WhatsApp Message:",
    inputPlaceholder: "e.g. https://scholarship.up.gov.in or https://pm-free-laptop.xyz",
    verifyBtn: "Verify",
    rulesTitle: "3 Golden Cyber Safety Rules for Citizens:",
    rule1Title: "Look for .gov.in or .nic.in domain",
    rule1Desc: "All genuine Indian central and state government portals only use .gov.in or .nic.in domain extensions.",
    rule2Title: "Never Pay Registration Fees for Free Welfare Schemes",
    rule2Desc: "Government schemes like PM-Kisan, Ayushman Bharat, or NSP are 100% free to apply. Never send UPI payments to private numbers.",
    rule3Title: "Never Share Aadhaar OTP on WhatsApp",
    rule3Desc: "Government officials will never call or message asking for your Aadhaar OTP or bank PIN.",
    footer: "AmritChidiya Cyber Safety Division • Empowering Citizens with Verified Welfare Access"
  },
  Hindi: {
    modalTitle: "आधिकारिक डोमेन शील्ड एवं फर्जी योजना चेकर",
    modalBadge: "साइबर सुरक्षा शील्ड",
    modalSubtitle: "जांचें कि व्हाट्सएप या मैसेज पर आई योजना असली है या कोई साइबर फ्रॉड",
    inputLabel: "किसी भी लिंक या संदेश की जांच करें:",
    inputPlaceholder: "उदा. https://scholarship.up.gov.in या https://pm-free-laptop.xyz",
    verifyBtn: "जांचें",
    rulesTitle: "नागरिकों के लिए 3 आवश्यक सुरक्षा नियम:",
    rule1Title: "केवल .gov.in या .nic.in डोमेन पर ही भरोसा करें",
    rule1Desc: "सभी असली सरकारी पोर्टल केवल .gov.in या .nic.in डोमेन एक्सटेंशन पर चलते हैं।",
    rule2Title: "मुफ्त कल्याणकारी योजनाओं के लिए कभी भी फीस न दें",
    rule2Desc: "पीएम-किसान, आयुष्मान भारत या एनएसपी योजनाओं के लिए आवेदन 100% मुफ्त है। कभी निजी यूपीआई पर पैसे न भेजें।",
    rule3Title: "व्हाट्सएप पर आधार ओटीपी कभी साझा न करें",
    rule3Desc: "सरकारी अधिकारी कभी भी फोन या व्हाट्सएप पर आधार ओटीपी या बैंक पिन नहीं मांगते हैं।",
    footer: "अमृतचिड़िया साइबर सुरक्षा प्रभाग • सत्यापित एवं सुरक्षित सरकारी योजना सहायता"
  },
  Hinglish: {
    modalTitle: "Official Domain Shield & Scam Checker",
    modalBadge: "Cyber Security Shield",
    modalSubtitle: "Check karein ki WhatsApp par aayi link asli sarkari scheme hai ya fraud",
    inputLabel: "Koi bhi link ya message check karein:",
    inputPlaceholder: "e.g. https://scholarship.up.gov.in ya https://pm-free-laptop.xyz",
    verifyBtn: "Verify Karein",
    rulesTitle: "Citizens Ke Liye 3 Golden Cyber Safety Rules:",
    rule1Title: "Hamesha .gov.in ya .nic.in check karein",
    rule1Desc: "Sabhi asli central aur state govt portals .gov.in ya .nic.in par hi host hote hain.",
    rule2Title: "Free welfare schemes ke liye registration fee na dein",
    rule2Desc: "PM-Kisan, Ayushman Bharat, NSP bilkul free hain. Kisi ko private UPI payment na karein.",
    rule3Title: "Aadhaar OTP kisi ke saath share na karein",
    rule3Desc: "Govt officials kabhi phone ya chat par aapka OTP ya password nahi mangte.",
    footer: "AmritChidiya Cyber Safety Division • Verified Scheme Protection"
  },
  Marathi: {
    modalTitle: "अधिकृत डोमेन शील्ड व सायबर सुरक्षा तपासणी",
    modalBadge: "सायबर सुरक्षा शील्ड",
    modalSubtitle: "व्हॉट्सॲपवर आलेली लिंक अधिकृत आहे की सायबर फसवणूक हे तपासा",
    inputLabel: "कोणतीही लिंक किंवा संदेश तपासा:",
    inputPlaceholder: "उदा. https://scholarship.up.gov.in किंवा https://pm-free-laptop.xyz",
    verifyBtn: "तपासा",
    rulesTitle: "नागरिकांसाठी ३ सुवर्ण सायबर सुरक्षा नियम:",
    rule1Title: "केवळ .gov.in किंवा .nic.in तपासा",
    rule1Desc: "सर्व अधिकृत शासकीय संकेतस्थळे .gov.in किंवा .nic.in वरच असतात.",
    rule2Title: "मोफत योजनांसाठी कधीही शुल्क देऊ नका",
    rule2Desc: "शासकीय कल्याणकारी योजनांचे अर्ज मोफत असतात. कोणालाही खाजगी यूपीआय पैसे पाठवू नका.",
    rule3Title: "आधार ओटीपी कोणाशीही शेअर करू नका",
    rule3Desc: "शासकीय अधिकारी कधीही फोनवर आधार ओटीपी किंवा बँक पासवर्ड मागत नाहीत.",
    footer: "अमृतचिमणी सायबर सुरक्षा विभाग • अधिकृत योजना संरक्षण"
  },
  Tamil: {
    modalTitle: "அதிகாரப்பூர்வ டொமைன் கவசம் & போலி திட்ட சரிபார்ப்பு",
    modalBadge: "சைபர் பாதுகாப்பு",
    modalSubtitle: "வாட்ஸ்அப் அல்லது செய்தி இணைப்பு உண்மையானதா என்பதை சரிபார்க்கவும்",
    inputLabel: "இணைப்பு அல்லது செய்தியை சரிபார்க்கவும்:",
    inputPlaceholder: "उदा. https://scholarship.up.gov.in அல்லது https://pm-free-laptop.xyz",
    verifyBtn: "சரிபார்க்கவும்",
    rulesTitle: "3 முக்கிய சைபர் பாதுகாப்பு விதிகள்:",
    rule1Title: ".gov.in அல்லது .nic.in தளங்களை மட்டும் நம்புங்கள்",
    rule1Desc: "அனைத்து உண்மையான அரசு தளங்களும் .gov.in அல்லது .nic.in உடன் முடிவடையும்.",
    rule2Title: "இலவச நலத்திட்டங்களுக்கு கட்டணம் செலுத்த வேண்டாம்",
    rule2Desc: "அரசு நலத்திட்டங்கள் முற்றிலும் இலவசம். எந்த தனியார் UPI-க்கும் பணம் அனுப்ப வேண்டாம்.",
    rule3Title: "OTP-ஐ யாரிடமும் பகிர வேண்டாம்",
    rule3Desc: "அரசு அதிகாரிகள் உங்கள் ஆதார் OTP அல்லது வங்கி கடவுச்சொல்லை ஒருபோதும் கேட்க மாட்டார்கள்.",
    footer: "அமிர்தசிடியா சைபர் பாதுகாப்புப் பிரிவு • சரிபார்க்கப்பட்ட அரசு திட்டங்கள்"
  }
};

export default function ScamShieldModal({ isOpen, onClose, selectedLanguage }: ScamShieldModalProps) {
  const [testInput, setTestInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    status: 'safe' | 'scam' | 'idle';
    domain: string;
    reason: string;
  }>({ status: 'idle', domain: '', reason: '' });

  const langKey = selectedLanguage || 'English';
  const i18n = SHIELD_I18N[langKey] || SHIELD_I18N['English'];

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;

    const inputLower = testInput.toLowerCase().trim();

    // Extract domain if URL
    let extractedDomain = inputLower;
    try {
      if (inputLower.startsWith('http://') || inputLower.startsWith('https://')) {
        const parsed = new URL(inputLower);
        extractedDomain = parsed.hostname;
      }
    } catch {
      // not a full url, treat text as domain
    }

    const officialSuffixes = ['.gov.in', '.nic.in', '.org.in', '.ac.in', '.edu.in', 'scholarships.gov.in', 'pmkisan.gov.in', 'pmjay.gov.in'];
    const isOfficialGov = officialSuffixes.some(suffix => extractedDomain.endsWith(suffix) || extractedDomain.includes(suffix));

    const highRiskPhrases = ['free money', 'laptop yojana', 'berojgari bhatta 3500', 'lottery', 'bit.ly', '.xyz', '.site', '.club', 'form-fees', 'win cash'];
    const isHighRisk = highRiskPhrases.some(phrase => inputLower.includes(phrase)) || (!isOfficialGov && (inputLower.includes('pm') || inputLower.includes('yojana') || inputLower.includes('scholarship')));

    if (isOfficialGov) {
      setAnalysisResult({
        status: 'safe',
        domain: extractedDomain,
        reason: langKey === 'English'
          ? 'This is an authentic official Government of India portal domain (.gov.in / .nic.in). Safe to access.'
          : 'यह एक आधिकारिक एवं प्रमाणित भारत सरकार का पोर्टल डोमेन (.gov.in / .nic.in) है। सुरक्षित।'
      });
    } else if (isHighRisk || !isOfficialGov) {
      setAnalysisResult({
        status: 'scam',
        domain: extractedDomain,
        reason: langKey === 'English'
          ? 'WARNING: Not an official government domain! Genuine Indian government schemes are strictly hosted on .gov.in or .nic.in domains. Never submit OTP, Aadhaar, or bank passwords on this website.'
          : 'चेतावनी: यह कोई आधिकारिक सरकारी डोमेन नहीं है! असली सरकारी योजनाएं केवल .gov.in या .nic.in पर ही संचालित होती हैं। इस वेबसाइट पर कभी भी आधार, ओटीपी या बैंक विवरण दर्ज न करें।'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 relative shadow-[0_0_60px_rgba(239,68,68,0.15)] my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>{i18n.modalTitle}</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
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

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="py-4 border-b border-zinc-800 space-y-2.5">
          <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            {i18n.inputLabel}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={i18n.inputPlaceholder}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Search size={14} />
              <span>{i18n.verifyBtn}</span>
            </button>
          </div>

          {/* Result Banner */}
          {analysisResult.status === 'safe' && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-300 animate-in fade-in">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <p className="font-bold text-xs">
                  {langKey === 'English' ? 'VERIFIED OFFICIAL GOVERNMENT DOMAIN' : 'सत्यापित आधिकारिक सरकारी डोमेन'}
                </p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">{analysisResult.reason}</p>
              </div>
            </div>
          )}

          {analysisResult.status === 'scam' && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-red-300 animate-in fade-in">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-bold text-xs">
                  {langKey === 'English' ? '🚨 HIGH RISK / SUSPICIOUS SCHEME DETECTED' : '🚨 उच्च जोखिम / संदिग्ध योजना पहचानी गई'}
                </p>
                <p className="text-[11px] text-red-300/80 mt-0.5">{analysisResult.reason}</p>
              </div>
            </div>
          )}
        </form>

        {/* 3 Golden Rules for Citizens */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar text-xs">
          <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lock size={13} /> {i18n.rulesTitle}
          </h4>

          <div className="grid gap-2">
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-zinc-200 block text-[11px]">{i18n.rule1Title}</strong>
                <span className="text-[10px] text-zinc-400">{i18n.rule1Desc}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-zinc-200 block text-[11px]">{i18n.rule2Title}</strong>
                <span className="text-[10px] text-zinc-400">{i18n.rule2Desc}</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-zinc-200 block text-[11px]">{i18n.rule3Title}</strong>
                <span className="text-[10px] text-zinc-400">{i18n.rule3Desc}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 text-center text-[10px] text-zinc-500">
          {i18n.footer}
        </div>
      </div>
    </div>
  );
}
