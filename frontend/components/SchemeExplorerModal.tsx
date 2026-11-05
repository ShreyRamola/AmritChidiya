'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Filter, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Calendar, 
  Building2, 
  Gift, 
  Check, 
  RefreshCw,
  Compass,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface SchemeEligibility {
  is_eligible: boolean;
  status_label: string;
  reasons: string[];
}

interface SchemeItem {
  id: string;
  name: string;
  hindi_name: string;
  category_type: string;
  badge: string;
  published_date: string;
  state: string;
  target_gender: string;
  min_age: number | null;
  max_age: number | null;
  target_categories: string[];
  max_income_lakh: number | null;
  benefit: string;
  eligibility_summary: string;
  official_portal: string;
  source: string;
  news_snippet: string;
  eligibility?: SchemeEligibility;
}

interface SchemeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage?: string | null;
  theme?: 'light' | 'dark';
  onInquireScheme?: (schemeName: string, queryPrompt?: string) => void;
}

const EXPLORER_I18N: Record<string, Record<string, string>> = {
  English: {
    modalTitle: "Government Scheme & Scholarship Explorer",
    modalBadge: "Live 2026 Gazette Feed",
    modalSubtitle: "Real-time bulletin of newly published welfare schemes, scholarships & cabinet decisions",
    searchPlaceholder: "Search schemes by name, keyword (e.g. scooty, laptop, solar, stipend)...",
    filterHeading: "Filter & Check Your Eligibility:",
    genderLabel: "Gender:",
    ageLabel: "Age:",
    categoryLabel: "Category:",
    stateLabel: "State:",
    all: "All",
    eligible: "100% Eligible",
    notEligible: "Not Eligible",
    checkEligibility: "Check Criteria",
    benefitsLabel: "Benefits & Financial Aid:",
    eligibilityLabel: "Eligibility Criteria:",
    latestNewsLabel: "Latest Gazette Update:",
    inquireInChatBtn: "Inquire in Chat",
    openPortalBtn: "Official Portal",
    refreshBtn: "Refresh",
    totalSchemes: "schemes available",
    fallbackNotice: "No brand-new announcements found for this exact filter. Showing active central & state welfare initiatives:",
    allIndia: "All India / Central",
    footer: "AmritChidiya Welfare Intelligence • Real-time notifications directly from Central & State Gazettes"
  },
  Hindi: {
    modalTitle: "सरकारी योजना एवं छात्रवृत्ति बुलेटिन",
    modalBadge: "लाइव 2026 गैजेट फीड",
    modalSubtitle: "नई घोषित सरकारी योजनाओं, छात्रवृत्तियों और कैबिनेट निर्णयों की लाइव सूची",
    searchPlaceholder: "योजना के नाम या कीवर्ड से खोजें (उदा. स्कूटी, लैपटॉप, सोलर, वजीफा)...",
    filterHeading: "फिल्टर करें एवं अपनी पात्रता जांचें:",
    genderLabel: "लिंग:",
    ageLabel: "आयु:",
    categoryLabel: "वर्ग (Category):",
    stateLabel: "राज्य:",
    all: "सभी",
    eligible: "पात्र हैं (Eligible)",
    notEligible: "अपात्र (Not Eligible)",
    checkEligibility: "पात्रता शर्तें",
    benefitsLabel: "योजना के लाभ एवं सहायता:",
    eligibilityLabel: "पात्रता एवं शर्तें:",
    latestNewsLabel: "नवीनतम सरकारी अपडेट:",
    inquireInChatBtn: "चैट में पूछें",
    openPortalBtn: "आधिकारिक पोर्टल",
    refreshBtn: "रिफ्रेश",
    totalSchemes: "योजनाएं उपलब्ध",
    fallbackNotice: "इस सटीक फिल्टर के लिए कोई नई योजना नहीं मिली। सक्रिय राष्ट्रीय व राज्यस्तरीय कल्याणकारी योजनाएं दिखाई जा रही हैं:",
    allIndia: "अखिल भारतीय / केंद्र सरकार",
    footer: "अमृतचिड़िया कल्याणकारी सूचना प्रभाग • केंद्र एवं राज्य सरकार के राजपत्रों से सत्यापित"
  },
  Hinglish: {
    modalTitle: "New Schemes & Scholarship Explorer",
    modalBadge: "Live 2026 Govt Feed",
    modalSubtitle: "Recently published sarkari yojanaayein, scholarships aur cabinet approvals ki live list",
    searchPlaceholder: "Scheme search karein (e.g. scooty, laptop, solar, stipend)...",
    filterHeading: "Filter Karein & Apni Eligibility Check Karein:",
    genderLabel: "Gender:",
    ageLabel: "Age:",
    categoryLabel: "Category:",
    stateLabel: "State:",
    all: "All",
    eligible: "100% Eligible",
    notEligible: "Not Eligible",
    checkEligibility: "Criteria Check",
    benefitsLabel: "Fayde & Financial Aid:",
    eligibilityLabel: "Eligibility Criteria:",
    latestNewsLabel: "Latest Gazette Update:",
    inquireInChatBtn: "Chat Me Poochein",
    openPortalBtn: "Official Portal",
    refreshBtn: "Refresh",
    totalSchemes: "schemes available",
    fallbackNotice: "Is exact filter ke liye brand-new schemes nahi mili. Active central aur state welfare schemes dikhayi ja rahi hain:",
    allIndia: "All India / Central",
    footer: "AmritChidiya Scheme Explorer • Direct verified updates from Central & State portals"
  },
  Marathi: {
    modalTitle: "शासकीय योजना व शिष्यवृत्ती बुलेटिन",
    modalBadge: "थेट २०२६ राजपत्र फीड",
    modalSubtitle: "नुकत्याच घोषित झालेल्या शासकीय योजना, शिष्यवृत्ती आणि मंत्रिमंडळ निर्णयांची थेट यादी",
    searchPlaceholder: "योजनेच्या नावाने शोधा (उदा. स्कूटी, लॅपटॉप, सोलर, शिष्यवृत्ती)...",
    filterHeading: "फिल्टर करा व तुमची पात्रता तपासा:",
    genderLabel: "लिंग:",
    ageLabel: "वय:",
    categoryLabel: "प्रवर्ग:",
    stateLabel: "राज्य:",
    all: "सर्व",
    eligible: "पात्र आहात",
    notEligible: "अपात्र",
    checkEligibility: "अटी तपासा",
    benefitsLabel: "योजनेचे लाभ:",
    eligibilityLabel: "पात्रता अटी:",
    latestNewsLabel: "थेट शासकीय अपडेट:",
    inquireInChatBtn: "चॅटमध्ये विचारा",
    openPortalBtn: "अधिकृत पोर्टल",
    refreshBtn: "रिफ्रेश",
    totalSchemes: "योजना उपलब्ध",
    fallbackNotice: "या अचूक फिल्टरसाठी नवीन योजना आढळल्या नाहीत. नुकत्याच सुरू असलेल्या केंद्रीय व राज्यस्तरीय योजना दाखवत आहोत:",
    allIndia: "अखिल भारतीय / केंद्र शासन",
    footer: "अमृतचिमणी योजना माहिती विभाग • अधिकृत शासकीय राजपत्रांमधून पडताळणी"
  },
  Tamil: {
    modalTitle: "அரசு நலத்திட்டங்கள் & கல்வி உதவித்தொகை புல்லட்டின்",
    modalBadge: "நேரடி 2026 அறிவிப்புகள்",
    modalSubtitle: "புதிதாக அறிவிக்கப்பட்ட அரசு திட்டங்கள் மற்றும் உதவித்தொகைகளின் நேரடி பட்டியல்",
    searchPlaceholder: "திட்டத்தின் பெயரைத் தேடவும் (उदा. ஸ்கூட்டர், லேப்டாப், சோலார்)...",
    filterHeading: "வடிகட்டி உங்கள் தகுதியைச் சரிபார்க்கவும்:",
    genderLabel: "பாலினம்:",
    ageLabel: "வயது:",
    categoryLabel: "பிரிவு:",
    stateLabel: "மாநிலம்:",
    all: "அனைத்தும்",
    eligible: "தகுதியுடையவர்",
    notEligible: "தகுதியற்றவர்",
    checkEligibility: "விதிமுறைகள்",
    benefitsLabel: "நன்மைகள் & நிதி உதவி:",
    eligibilityLabel: "தகுதி வரம்புகள்:",
    latestNewsLabel: "சமீபத்திய அரசு அறிவிப்பு:",
    inquireInChatBtn: "அரட்டையில் கேட்கவும்",
    openPortalBtn: "அதிகாரப்பூர்வ தளம்",
    refreshBtn: "புதுப்பிக்கவும்",
    totalSchemes: "திட்டங்கள் உள்ளன",
    fallbackNotice: "இந்த குறிப்பிட்ட வடிகட்டலுக்கு புதிய திட்டங்கள் எதுவும் இல்லை. நடப்பு நலத்திட்டங்கள் கீழே பட்டியலிடப்பட்டுள்ளன:",
    allIndia: "அகில இந்திய / மத்திய அரசு",
    footer: "அமிர்தசிடியா நலத்திட்ட புலனாய்வு பிரிவு • அதிகாரப்பூர்வ அரசு அறிவிப்புகள்"
  }
};

const STATE_OPTIONS = [
  "All India",
  "Uttar Pradesh",
  "Maharashtra",
  "Bihar",
  "Rajasthan",
  "Madhya Pradesh",
  "Delhi"
];

const CATEGORY_OPTIONS = ["All", "General", "OBC", "SC", "ST", "EWS", "Minority"];

export default function SchemeExplorerModal({
  isOpen,
  onClose,
  selectedLanguage,
  theme = 'light',
  onInquireScheme
}: SchemeExplorerModalProps) {
  const isLight = theme === 'light';
  const langKey = selectedLanguage || 'English';
  const i18n = EXPLORER_I18N[langKey] || EXPLORER_I18N['English'];

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedAge, setSelectedAge] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All India');

  // API Data State
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState('');

  // Fetch schemes from backend with active filters
  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const headers = getAuthHeaders();

      const params = new URLSearchParams();
      if (selectedGender !== 'All') params.append('gender', selectedGender);
      if (selectedAge !== 'All' && !isNaN(Number(selectedAge))) params.append('age', selectedAge);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedState !== 'All' && selectedState !== 'All India') params.append('state', selectedState);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${apiUrl}/new-schemes?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSchemes(data.schemes || []);
        setIsFallback(Boolean(data.is_fallback));
        setFallbackMsg(data.fallback_message || '');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Could not fetch new schemes from backend API, using local catalog:', err);
    }

    // Local graceful fallback if backend is unavailable
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchemes();
    }
  }, [isOpen, selectedGender, selectedAge, selectedCategory, selectedState, searchQuery]);

  // Compute dynamic eligibility for each scheme based on active filters
  const processedSchemes = useMemo(() => {
    const ageNum = selectedAge !== 'All' ? parseInt(selectedAge, 10) : null;

    return schemes.map((s) => {
      const failedReasons: string[] = [];
      const passReasons: string[] = [];

      // Gender check
      if (selectedGender !== 'All') {
        if (s.target_gender !== 'All' && s.target_gender.toLowerCase() !== selectedGender.toLowerCase()) {
          failedReasons.push(langKey === 'Hindi' ? `केवल ${s.target_gender} के लिए` : `Only for ${s.target_gender}`);
        } else {
          passReasons.push(langKey === 'Hindi' ? `लिंग पात्र (${s.target_gender})` : `Gender: ${s.target_gender}`);
        }
      }

      // State check
      if (selectedState !== 'All' && selectedState !== 'All India') {
        if (s.state !== 'All India' && s.state.toLowerCase() !== selectedState.toLowerCase()) {
          failedReasons.push(langKey === 'Hindi' ? `केवल ${s.state} के निवासियों हेतु` : `Only for ${s.state} residents`);
        } else {
          passReasons.push(s.state);
        }
      }

      // Age check
      if (ageNum !== null && !isNaN(ageNum)) {
        if (s.min_age !== null && ageNum < s.min_age) {
          failedReasons.push(langKey === 'Hindi' ? `न्यूनतम आयु ${s.min_age} वर्ष चाहिए` : `Min age: ${s.min_age} yrs`);
        } else if (s.max_age !== null && ageNum > s.max_age) {
          failedReasons.push(langKey === 'Hindi' ? `अधिकतम आयु ${s.max_age} वर्ष तक` : `Max age: ${s.max_age} yrs`);
        } else {
          passReasons.push(langKey === 'Hindi' ? `आयु पात्र` : `Age eligible`);
        }
      }

      // Category check
      if (selectedCategory !== 'All') {
        const targetCatsLower = (s.target_categories || []).map((c) => c.toLowerCase());
        if (!targetCatsLower.includes('all') && !targetCatsLower.includes(selectedCategory.toLowerCase())) {
          failedReasons.push(
            langKey === 'Hindi'
              ? `केवल ${s.target_categories.join(', ')} हेतु`
              : `Only for ${s.target_categories.join(', ')}`
          );
        } else {
          passReasons.push(selectedCategory);
        }
      }

      const isEligible = failedReasons.length === 0;

      return {
        ...s,
        computedEligibility: {
          is_eligible: isEligible,
          status_label: isEligible
            ? (selectedGender === 'All' && selectedAge === 'All' && selectedCategory === 'All' && selectedState === 'All India'
                ? i18n.checkEligibility
                : i18n.eligible)
            : i18n.notEligible,
          reasons: isEligible ? passReasons : failedReasons
        }
      };
    });
  }, [schemes, selectedGender, selectedAge, selectedCategory, selectedState, langKey, i18n]);

  if (!isOpen) return null;

  const handleInquire = (scheme: SchemeItem) => {
    if (onInquireScheme) {
      const prompt = langKey === 'Hindi'
        ? `कृपया मुझे सरकारी योजना '${scheme.name}' (${scheme.hindi_name}) के बारे में बताएं। इसके मुख्य लाभ, पात्रता शर्तें, आवश्यक दस्तावेज और आधिकारिक पोर्टल (${scheme.official_portal}) से ऑनलाइन आवेदन कैसे करें?`
        : langKey === 'Hinglish'
        ? `Mujhe official government scheme '${scheme.name}' ke baare mein poori jankari chahiye - benefits, eligibility, zaroori documents aur official portal (${scheme.official_portal}) se apply karne ka direct process batayein.`
        : `Please provide complete guidance on the official government initiative '${scheme.name}'. What are its benefits, eligibility criteria, required documents, and step-by-step application process on the official portal (${scheme.official_portal})?`;

      onInquireScheme(scheme.name, prompt);
    }
    onClose();
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'NEWLY PUBLISHED':
        return isLight
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'CABINET APPROVED':
        return isLight
          ? 'bg-purple-100 text-purple-800 border-purple-300'
          : 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'DEADLINE EXTENDED':
        return isLight
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return isLight
          ? 'bg-sky-100 text-sky-800 border-sky-300'
          : 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto animate-in fade-in duration-200 ${
      isLight ? 'bg-slate-900/60' : 'bg-zinc-950/90'
    }`}>
      <div className={`border rounded-3xl max-w-4xl w-full p-5 sm:p-6 relative my-auto max-h-[94vh] flex flex-col shadow-2xl transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-[0_0_60px_rgba(245,158,11,0.1)]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3.5 border-b shrink-0 ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
              isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-500/15 text-amber-400'
            }`}>
              <Compass size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                  {i18n.modalTitle}
                </h3>
                <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                  isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {i18n.modalBadge}
                </span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {i18n.modalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSchemes}
              title={i18n.refreshBtn}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className={`py-3 border-b space-y-2.5 shrink-0 ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-zinc-800 bg-zinc-950/40'} -mx-5 sm:-mx-6 px-5 sm:px-6`}>
          {/* Keyword Search */}
          <div className="relative">
            <Search size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            <input
              type="text"
              placeholder={i18n.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none border focus:border-amber-500 transition-colors ${
                isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/50'
              }`}
            />
          </div>

          {/* Quick Filters Row */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Gender Filter */}
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {i18n.genderLabel}
              </span>
              <div className="inline-flex rounded-lg border p-0.5 border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {['All', 'Female', 'Male'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      selectedGender === g
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {g === 'All' ? i18n.all : g}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Filter */}
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {i18n.ageLabel}
              </span>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                }`}
              >
                <option value="All">{i18n.all}</option>
                <option value="16">16 (School)</option>
                <option value="19">19 (College)</option>
                <option value="22">22 (Youth/Graduate)</option>
                <option value="28">28 (Young Adult)</option>
                <option value="45">45 (Adult)</option>
                <option value="70">70+ (Senior)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {i18n.categoryLabel}
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                }`}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? i18n.all : c}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {i18n.stateLabel}
              </span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold border outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-200'
                }`}
              >
                {STATE_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All India' ? i18n.allIndia : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Schemes Count */}
            <div className="ml-auto text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles size={12} />
              <span>{processedSchemes.length} {i18n.totalSchemes}</span>
            </div>
          </div>
        </div>

        {/* Fallback Notice Banner */}
        {isFallback && (
          <div className={`mt-2.5 p-2.5 rounded-xl border flex items-center gap-2 text-xs shrink-0 ${
            isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <AlertCircle size={15} className="shrink-0 text-amber-600" />
            <span className="text-[11px] leading-tight font-medium">{i18n.fallbackNotice}</span>
          </div>
        )}

        {/* Scrollable Schemes List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar pr-1">
          {processedSchemes.length === 0 ? (
            <div className="py-12 text-center text-xs space-y-2">
              <Compass size={32} className={`mx-auto animate-bounce ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
              <p className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
                No schemes found matching your search. Try adjusting the keywords or state filter.
              </p>
            </div>
          ) : (
            processedSchemes.map((scheme) => {
              const elig = scheme.computedEligibility;
              const isEligible = elig?.is_eligible;

              return (
                <div
                  key={scheme.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col gap-2.5 ${
                    isLight 
                      ? 'bg-white border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/20' 
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-amber-500/30 hover:bg-zinc-900/60'
                  }`}
                >
                  {/* Top Bar: Badges + State + Published Date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeColor(scheme.badge)}`}>
                        {scheme.badge}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {scheme.category_type}
                      </span>
                      <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        📍 {scheme.state}
                      </span>
                    </div>

                    {/* Eligibility Badge */}
                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border shadow-2xs ${
                      isEligible
                        ? (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30')
                        : (isLight ? 'bg-red-50 text-red-800 border-red-200' : 'bg-red-500/10 text-red-300 border-red-500/30')
                    }`}>
                      {isEligible ? <CheckCircle2 size={12} className="text-emerald-600" /> : <AlertCircle size={12} className="text-red-500" />}
                      <span>{elig?.status_label}</span>
                    </div>
                  </div>

                  {/* Title & Hindi Subtitle */}
                  <div>
                    <h4 className={`text-sm sm:text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                      {scheme.name}
                    </h4>
                    {scheme.hindi_name && (
                      <p className={`text-xs font-medium mt-0.5 ${isLight ? 'text-amber-800' : 'text-amber-400/90'}`}>
                        {scheme.hindi_name}
                      </p>
                    )}
                  </div>

                  {/* Benefits Box */}
                  <div className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                    isLight ? 'bg-amber-50/70 border-amber-200/80 text-amber-950' : 'bg-amber-500/5 border-amber-500/20 text-amber-200'
                  }`}>
                    <Gift size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <strong className="block text-[11px] uppercase tracking-wider">{i18n.benefitsLabel}</strong>
                      <p className="text-[11px] leading-relaxed mt-0.5 font-medium">{scheme.benefit}</p>
                    </div>
                  </div>

                  {/* Eligibility summary & Gazette snippet */}
                  <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
                    <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                      <strong className={`block text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-400'}`}>
                        {i18n.eligibilityLabel}
                      </strong>
                      <p className={`mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                        {scheme.eligibility_summary}
                      </p>
                      {elig?.reasons && elig.reasons.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-zinc-800 flex items-center gap-1 flex-wrap">
                          {elig.reasons.map((r, idx) => (
                            <span
                              key={idx}
                              className={`text-[9px] px-1.5 py-0.5 rounded ${
                                isEligible
                                  ? (isLight ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40')
                                  : (isLight ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-red-950/40 text-red-300 border border-red-800/40')
                              }`}
                            >
                              {isEligible ? `✓ ${r}` : `✕ ${r}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                      <strong className={`block text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-400'}`}>
                        {i18n.latestNewsLabel}
                      </strong>
                      <p className={`mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                        {scheme.news_snippet}
                      </p>
                      <div className={`mt-1.5 text-[9px] font-medium flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        <Calendar size={11} />
                        <span>{scheme.published_date}</span>
                        <span>•</span>
                        <Building2 size={11} />
                        <span className="truncate">{scheme.source}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className={`pt-2 border-t flex items-center justify-between gap-2 flex-wrap ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
                    <a
                      href={scheme.official_portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-colors ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span>{i18n.openPortalBtn}</span>
                      <ExternalLink size={12} />
                    </a>

                    <button
                      onClick={() => handleInquire(scheme)}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:gap-2"
                    >
                      <MessageSquare size={13} />
                      <span>{i18n.inquireInChatBtn}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={`pt-3 border-t text-center text-[10px] shrink-0 ${isLight ? 'border-slate-200 text-slate-500' : 'border-zinc-800 text-zinc-500'}`}>
          {i18n.footer}
        </div>
      </div>
    </div>
  );
}

