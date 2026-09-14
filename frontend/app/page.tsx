'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Mic,
  Plus,
  Volume2,
  Headphones,
  X,
  Captions,
  Radio,
  Pause,
  Square,
  User as UserIcon,
  LogOut,
  Lock,
  History,
  ChevronRight,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import {
  getCurrentUser,
  loginAsync,
  signUpAsync,
  logout,
  getUserChatsAsync,
  getUserChatsLocal,
  saveUserChatAsync,
  deleteUserChatAsync,
  SavedChat,
  User
} from '@/lib/auth';
import MarkdownContent from '@/components/MarkdownContent';

const LANGUAGES = [
  {
    id: 'Hindi',
    label: 'हिंदी (Hindi)',
    langCode: 'hi-IN',
    newChatLabel: 'नया चैट',
    greeting: 'नमस्ते! 🙏 मैं AmritChidiya हूँ — आपका अपना साथी, जो आपके सपनों की "सोने की चिड़िया" को फिर से उड़ान देने में मदद करेगा। ✨\n\nचाहे आपको स्कॉलरशिप चाहिए, सरकारी योजनाओं की जानकारी, या फॉर्म भरने में मदद... मैं हर कदम पर आपके साथ हूँ।\n\nबताइए, आज मैं आपकी क्या मदद कर सकता हूँ?'
  },
  {
    id: 'Hinglish',
    label: 'Hinglish',
    langCode: 'hi-IN',
    newChatLabel: 'Naya Chat',
    greeting: 'Namaste! 🙏 Main AmritChidiya hoon — aapka apna saathi, jo aapki sapno ki "Sone Ki Chidiya" ko phir se udaan dene mein madad karega. ✨\n\nChahe aapko scholarship chahiye, sarkari yojanaon ki jankari, ya form bharne mein madad... main har kadam par aapke saath hoon.\n\nBataiye, aaj main aapki kya madad kar sakta hoon?'
  },
  {
    id: 'English',
    label: 'English',
    langCode: 'en-IN',
    newChatLabel: 'New Chat',
    greeting: 'Namaste! 🙏 I am AmritChidiya — your trusted companion, here to help your dreams take flight and revive the spirit of the "Golden Bird". ✨\n\nWhether you are looking for student scholarships, government welfare schemes, or need step-by-step guidance on how to apply... I am here for you at every step.\n\nHow can I support you today?'
  },
  {
    id: 'Marathi',
    label: 'मराठी (Marathi)',
    langCode: 'mr-IN',
    newChatLabel: 'नवीन चॅट',
    greeting: 'नमस्कार! 🙏 मी AmritChidiya आहे — तुमचा हक्काचा साथीदार, जो तुमच्या स्वप्नांच्या "सोन्याच्या चिमणीला" पुन्हा भरारी घेण्यासाठी मदत करेल. ✨\n\nतुम्हाला शिष्यवृत्ती हवी असेल, सरकारी योजनांची माहिती हवी असेल किंवा फॉर्म भरण्यासाठी मदत... मी प्रत्येक पावलावर तुमच्या सोबत आहे.\n\nसांगा, आज मी तुमची काय मदत करू शकतो?'
  },
  {
    id: 'Tamil',
    label: 'தமிழ் (Tamil)',
    langCode: 'ta-IN',
    newChatLabel: 'புதிய அரட்டை',
    greeting: 'வணக்கம்! 🙏 நான் AmritChidiya — உங்கள் கனவுகளின் "தங்கப் பறவைக்கு" மீண்டும் சிறகு கொடுக்க உதவும் உங்கள் நம்பகமான துணை. ✨\n\nஉங்களுக்கு கல்வி உதவித்தொகை தேவைப்பட்டாலும், அரசு திட்டங்கள் பற்றிய தகவல் தேவைப்பட்டாலும், அல்லது விண்ணப்பங்களை நிரப்புவதில் உதவி தேவைப்பட்டாலும்... நான் உங்களுக்கு உதவ தயாராக உள்ளேன்.\n\nஇன்று உங்களுக்கு நான் எப்படி உதவ முடியும்?'
  },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  Hindi: {
    authTitle: "आप अपनी योजनाओं से सिर्फ एक कदम दूर हैं! ✨",
    authSubtitle: "अपनी योजनाओं को अनलॉक करने और चैट हिस्ट्री सुरक्षित रखने के लिए निःशुल्क अकाउंट बनाएं या लॉगिन करें।",
    signUpTab: "साइन अप",
    logInTab: "लॉग इन",
    fullNameLabel: "पूरा नाम",
    fullNamePlaceholder: "अपना नाम दर्ज करें",
    emailLabel: "ईमेल आईडी",
    emailPlaceholder: "name@example.com",
    passwordLabel: "पासवर्ड",
    submitSignUp: "अकाउंट बनाएं और अनलॉक करें",
    submitLogIn: "लॉग इन करें और अनलॉक करें",
    freeSecureFootnote: "100% मुफ़्त और सुरक्षित। आपका डेटा पूरी तरह गोपनीय है।",
    talkMode: "टॉक मोड 🎙️",
    handsFreeTalkMode: "हैंड्स-फ्री टॉक मोड",
    puraniChats: "पुराणी चॅट्स",
    saveHistoryPromptTitle: "अपनी चैट हिस्ट्री सुरक्षित रखें",
    saveHistoryPromptSub: "अपनी पुरानी खोज और योजनाओं को कभी भी देखने के लिए साइन इन करें।",
    signIn: "साइन इन",
    matchesTitle: "पात्र योजनाएं",
    awaitingDataTitle: "डेटा की प्रतीक्षा है...",
    awaitingDataSub: "योग्य योजनाएं खोजने के लिए बातचीत शुरू करें।",
    schemesMatchedTitle: "योजनाएं मिल गईं!",
    schemesMatchedSub: "आप अपनी योजनाओं को देखने से सिर्फ एक कदम दूर हैं! ✨",
    unlockSchemesNow: "अभी योजनाएं अनलॉक करें",
    placeholderInput: "अपना सवाल पूछें...",
    processingRequest: "प्रोसेस हो रहा है...",
    stopAudio: "ऑडियो रोकें",
    listen: "सुनें",
    doneSpeaking: "बोलना समाप्त",
    startListening: "बोलना शुरू करें",
    pauseAudio: "ऑडियो रोकें",
    exitTalkMode: "टॉक मोड से बाहर निकलें",
    liveAssistantTitle: "अमृतचिडिया लाइव",
    liveAssistantSub: "हैंड्स-फ्री वर्चुअल असिस्टेंट",
    captionsOn: "कैप्शन चालू",
    captionsOff: "कैप्शन बंद",
    liveCaptions: "लाइव कैप्शन",
    listeningStatus: "सुन रहा हूँ... अब बोलिए",
    transcribingStatus: "आपकी आवाज़ समझ रहा हूँ...",
    thinkingStatus: "अमृतचिडिया सोच रहा है...",
    speakingStatus: "अमृतचिडिया बोल रहा है",
    tapMicToSpeak: "बोलने के लिए माइक दबाएं",
    tapDoneSub: "पूरा होने पर 'Done' दबाएं या बोलना बंद करें",
    noSpeechDetected: "आपकी आवाज़ सुन रहा हूँ... छात्रवृत्ति या योजनाओं के बारे में कुछ भी पूछें।",
    noSavedChats: "कोई पुरानी चैट नहीं मिली। योजनाएं सहेजने के लिए बातचीत शुरू करें!",
    schemesCount: "योजनाएं"
  },
  Hinglish: {
    authTitle: "Aap Sirf Ek Kadam Dur Hain! ✨",
    authSubtitle: "Apni custom scheme recommendations unlock karne aur chat history save karne ke liye free account banayein ya log in karein.",
    signUpTab: "Sign Up",
    logInTab: "Log In",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Apna naam likhein",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    submitSignUp: "Account Banayein & Unlock Karein",
    submitLogIn: "Log In Karein & Unlock Karein",
    freeSecureFootnote: "100% Free & Secure. Aapka data bilkul private hai.",
    talkMode: "Talk Mode 🎙️",
    handsFreeTalkMode: "Hands-Free Talk Mode",
    puraniChats: "Purani Chats",
    saveHistoryPromptTitle: "Apni Chat History Save Karein",
    saveHistoryPromptSub: "Apni previous searches aur scheme matches anytime access karne ke liye sign in karein.",
    signIn: "Sign In",
    matchesTitle: "Matches",
    awaitingDataTitle: "Awaiting data...",
    awaitingDataSub: "Initialize chat to scan for schemes.",
    schemesMatchedTitle: "Schemes Matched!",
    schemesMatchedSub: "Aap Apni Beneficial Schemes Dekhne Ke Liye Sirf Ek Kadam Dur Hain! ✨",
    unlockSchemesNow: "Unlock Schemes Now",
    placeholderInput: "Apna sawal likhein...",
    processingRequest: "Processing request...",
    stopAudio: "Stop Audio",
    listen: "Listen",
    doneSpeaking: "Done Speaking",
    startListening: "Start Listening",
    pauseAudio: "Pause Audio",
    exitTalkMode: "Exit Talk Mode",
    liveAssistantTitle: "AmritChidiya Live",
    liveAssistantSub: "Hands-Free Virtual Assistant",
    captionsOn: "Captions ON",
    captionsOff: "Captions OFF",
    liveCaptions: "Live Captions",
    listeningStatus: "Listening... Speak now",
    transcribingStatus: "Processing your voice...",
    thinkingStatus: "AmritChidiya is thinking...",
    speakingStatus: "AmritChidiya is speaking",
    tapMicToSpeak: "Tap mic to speak",
    tapDoneSub: "Tap Done or stop speaking when finished",
    noSpeechDetected: "Listening for your voice... Ask anything about scholarships or schemes.",
    noSavedChats: "No saved chats yet. Start chatting to save your scheme matches!",
    schemesCount: "schemes"
  },
  English: {
    authTitle: "You Are Just One Step Away! ✨",
    authSubtitle: "Create a free account or sign in to unlock your custom scheme recommendations & save your chat history.",
    signUpTab: "Sign Up",
    logInTab: "Log In",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your name",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com",
    passwordLabel: "Password",
    submitSignUp: "Create Account & Unlock",
    submitLogIn: "Log In & Unlock",
    freeSecureFootnote: "100% Free & Secure. Your data is strictly private.",
    talkMode: "Talk Mode 🎙️",
    handsFreeTalkMode: "Hands-Free Talk Mode",
    puraniChats: "Chat History",
    saveHistoryPromptTitle: "Save Your Chat History",
    saveHistoryPromptSub: "Sign in to access your previous searches and scheme matches anytime.",
    signIn: "Sign In",
    matchesTitle: "Matches",
    awaitingDataTitle: "Awaiting data...",
    awaitingDataSub: "Initialize chat to scan for schemes.",
    schemesMatchedTitle: "Schemes Matched!",
    schemesMatchedSub: "You are just one step away from unlocking your beneficial schemes! ✨",
    unlockSchemesNow: "Unlock Schemes Now",
    placeholderInput: "Type your query...",
    processingRequest: "Processing request...",
    stopAudio: "Stop Audio",
    listen: "Listen",
    doneSpeaking: "Done Speaking",
    startListening: "Start Listening",
    pauseAudio: "Pause Audio",
    exitTalkMode: "Exit Talk Mode",
    liveAssistantTitle: "AmritChidiya Live",
    liveAssistantSub: "Hands-Free Virtual Assistant",
    captionsOn: "Captions ON",
    captionsOff: "Captions OFF",
    liveCaptions: "Live Captions",
    listeningStatus: "Listening... Speak now",
    transcribingStatus: "Processing your voice...",
    thinkingStatus: "AmritChidiya is thinking...",
    speakingStatus: "AmritChidiya is speaking",
    tapMicToSpeak: "Tap mic to speak",
    tapDoneSub: "Tap Done or stop speaking when finished",
    noSpeechDetected: "Listening for your voice... Ask anything about scholarships or schemes.",
    noSavedChats: "No saved chats yet. Start chatting to save your scheme matches!",
    schemesCount: "schemes"
  },
  Marathi: {
    authTitle: "तुम्ही फक्त एक पाऊल दूर आहात! ✨",
    authSubtitle: "तुमच्या योजना अनलॉक करण्यासाठी आणि चॅट हिस्ट्री सेव्ह करण्यासाठी मोफत खाते तयार करा किंवा लॉगिन करा.",
    signUpTab: "साइन अप",
    logInTab: "लॉग इन",
    fullNameLabel: "पूर्ण नाव",
    fullNamePlaceholder: "तुमचे नाव टाका",
    emailLabel: "ईमेल आयडी",
    emailPlaceholder: "name@example.com",
    passwordLabel: "पासवर्ड",
    submitSignUp: "खाते तयार करा आणि अनलॉक करा",
    submitLogIn: "लॉग इन करा आणि अनलॉक करा",
    freeSecureFootnote: "100% मोफत आणि सुरक्षित. तुमचा डेटा पूर्णपणे खाजगी आहे.",
    talkMode: "टॉक मोड 🎙️",
    handsFreeTalkMode: "हँड्स-फ्री टॉक मोड",
    puraniChats: "मागील चॅट्स",
    saveHistoryPromptTitle: "तुमची चॅट हिस्ट्री सेव्ह करा",
    saveHistoryPromptSub: "तुमचे मागील शोध आणि योजना कधीही पाहण्यासाठी साइन इन करा.",
    signIn: "साइन इन",
    matchesTitle: "योग्य योजना",
    awaitingDataTitle: "डेटाची वाट पाहत आहे...",
    awaitingDataSub: "योग्य योजना शोधण्यासाठी चॅट सुरू करा.",
    schemesMatchedTitle: "योजना मिळाल्या!",
    schemesMatchedSub: "तुम्ही तुमच्या योजना पाहण्यापासून फक्त एक पाऊल दूर आहात! ✨",
    unlockSchemesNow: "आत्ताच योजना अनलॉक करा",
    placeholderInput: "तुमचा प्रश्न विचारा...",
    processingRequest: "प्रक्रिया सुरू आहे...",
    stopAudio: "ऑडिओ थांबवा",
    listen: "ऐका",
    doneSpeaking: "बोलणे पूर्ण",
    startListening: "बोलणे सुरू करा",
    pauseAudio: "ऑडिओ थांबवा",
    exitTalkMode: "टॉक मोडमधून बाहेर पडा",
    liveAssistantTitle: "अमृतचिमणी लाइव्ह",
    liveAssistantSub: "हँड्स-फ्री व्हर्च्युअल असिस्टंट",
    captionsOn: "कॅप्शन चालू",
    captionsOff: "कॅप्शन बंद",
    liveCaptions: "लाइव्ह कॅप्शन",
    listeningStatus: "ऐकत आहे... आता बोला",
    transcribingStatus: "तुमचा आवाज समजून घेत आहे...",
    thinkingStatus: "अमृतचिमणी विचार करत आहे...",
    speakingStatus: "अमृतचिमणी बोलत आहे",
    tapMicToSpeak: "बोलण्यासाठी माइक दाबा",
    tapDoneSub: "पूर्ण झाल्यावर 'Done' दाबा किंवा बोलणे थांबवा",
    noSpeechDetected: "तुमचा आवाज ऐकत आहे... शिष्यवृत्ती किंवा योजनांबद्दल काहीही विचारा.",
    noSavedChats: "अद्याप कोणत्याही सेव्ह केलेल्या चॅट्स नाहीत.",
    schemesCount: "योजना"
  },
  Tamil: {
    authTitle: "நீங்கள் ஒரு அடி மட்டுமே தொலைவில் உள்ளீர்கள்! ✨",
    authSubtitle: "உங்கள் திட்டங்களைத் திறக்கவும் அரட்டை வரலாற்றைச் சேமிக்கவும் இலவசக் கணக்கை உருவாக்கவும் அல்லது லாக் இன் செய்யவும்.",
    signUpTab: "பதிவு செய்க",
    logInTab: "உள்நுழைக",
    fullNameLabel: "முழு பெயர்",
    fullNamePlaceholder: "உங்கள் பெயரை உள்ளிடவும்",
    emailLabel: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "name@example.com",
    passwordLabel: "கடவுச்சொல்",
    submitSignUp: "கணக்கை உருவாக்கி திறக்கவும்",
    submitLogIn: "உள்நுழைந்து திறக்கவும்",
    freeSecureFootnote: "100% இலவசம் மற்றும் பாதுகாப்பானது. உங்கள் தரவு முற்றிலும் பாதுகாப்பானது.",
    talkMode: "பேச்சு முறை 🎙️",
    handsFreeTalkMode: "ஹேண்ட்ஸ்-ஃப்ரீ பேச்சு முறை",
    puraniChats: "முந்தைய அரட்டைகள்",
    saveHistoryPromptTitle: "உங்கள் அரட்டை வரலாற்றைச் சேமிக்கவும்",
    saveHistoryPromptSub: "உங்கள் முந்தைய தேடல்கள் மற்றும் திட்டங்களை எப்போது வேண்டுமானாலும் அணுக உள்நுழைக.",
    signIn: "உள்நுழைைக",
    matchesTitle: "பொருந்தும் திட்டங்கள்",
    awaitingDataTitle: "தரவுக்காக காத்திருக்கிறது...",
    awaitingDataSub: "திட்டங்களை ஸ்கேன் செய்ய அரட்டையைத் தொடங்கவும்.",
    schemesMatchedTitle: "திட்டங்கள் கண்டுபிடிக்கப்பட்டன!",
    schemesMatchedSub: "உங்கள் திட்டங்களைத் திறக்க நீங்கள் ஒரு அடி மட்டுமே தொலைவில் உள்ளீர்கள்! ✨",
    unlockSchemesNow: "இப்போது திட்டங்களை திறக்கவும்",
    placeholderInput: "உங்கள் கேள்வியைக் கேளுங்கள்...",
    processingRequest: "செயலாக்கப்படுகிறது...",
    stopAudio: "ஆடியோவை நிறுத்து",
    listen: "கேட்கவும்",
    doneSpeaking: "பேசி முடிந்தது",
    startListening: "பேசத் தொடங்குங்கள்",
    pauseAudio: "ஆடியோவை நிறுத்து",
    exitTalkMode: "பேச்சு முறையிலிருந்து வெளியேறு",
    liveAssistantTitle: "AmritChidiya லைவ்",
    liveAssistantSub: "ஹேண்ட்ஸ்-ஃப்ரீ மெய்நிகர் உதவி",
    captionsOn: "தலைப்புகள் இயக்கத்தில் உள்ளன",
    captionsOff: "தலைப்புகள் முடக்கப்பட்டுள்ளன",
    liveCaptions: "நேரடி தலைப்புகள்",
    listeningStatus: "கேட்கிறது... இப்போது பேசுங்கள்",
    transcribingStatus: "உங்கள் குரல் செயலாக்கப்படுகிறது...",
    thinkingStatus: "சிந்தித்துக் கொண்டிருக்கிறது...",
    speakingStatus: "பேசிக்கொண்டிருக்கிறது",
    tapMicToSpeak: "பேச மைக் தட்டவும்",
    tapDoneSub: "முடிந்ததும் முடிந்தது என்பதைத் தட்டவும்",
    noSpeechDetected: "உங்கள் குரலுக்காகக் காத்திருக்கிறது... கல்வி உதவித்தொகை பற்றி ஏதேனும் கேட்கலாம்.",
    noSavedChats: "சேமிக்கப்பட்ட அரட்டைகள் எதுவும் இல்லை.",
    schemesCount: "திட்டங்கள்"
  }
};

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [suggestedSchemes, setSuggestedSchemes] = useState<{ name: string, eligibility_match: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Translations Dictionary based on user selected language
  const t = TRANSLATIONS[selectedLanguage || 'English'] || TRANSLATIONS['English'];

  // --- Auth & Session States ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const currentChatIdRef = useRef<string | null>(null);

  const updateChatId = (id: string | null) => {
    currentChatIdRef.current = id;
    setCurrentChatId(id);
  };
  const [guestMessageCount, setGuestMessageCount] = useState(0);

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Speech States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- Voice Assistant "Talk Mode" States ---
  const [isTalkMode, setIsTalkMode] = useState(false);
  const [talkStatus, setTalkStatus] = useState<'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking'>('idle');
  const [showCaptions, setShowCaptions] = useState(true);
  const [talkTranscript, setTalkTranscript] = useState('');
  const [talkResponseText, setTalkResponseText] = useState('');

  const talkMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const talkAudioChunksRef = useRef<Blob[]>([]);
  const isTalkModeRef = useRef(false);
  const talkStatusRef = useRef<'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking'>('idle');

  // Phone Call Full-Duplex Refs
  const talkStreamRef = useRef<MediaStream | null>(null);
  const talkAudioContextRef = useRef<AudioContext | null>(null);
  const talkAnalyserRef = useRef<AnalyserNode | null>(null);
  const talkSilenceTimerRef = useRef<any>(null);
  const talkSpeechStartedRef = useRef<boolean>(false);
  const talkInterruptCountRef = useRef<number>(0);

  // Load user session and chats on mount
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setSavedChats(getUserChatsLocal(user.id));
      getUserChatsAsync(user.id).then(chats => setSavedChats(chats));
    }
  }, []);

  // Keep refs in sync for callbacks
  useEffect(() => {
    isTalkModeRef.current = isTalkMode;
  }, [isTalkMode]);

  useEffect(() => {
    talkStatusRef.current = talkStatus;
  }, [talkStatus]);

  // Handle Auth Login / Signup
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!authEmail.trim() || !authPass.trim()) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    try {
      let user: User;
      if (authTab === 'signup') {
        user = await signUpAsync(authEmail, authName, authPass);
        setAuthSuccessMsg('Account created successfully!');
      } else {
        user = await loginAsync(authEmail, authPass);
        setAuthSuccessMsg('Logged in successfully!');
      }

      setCurrentUser(user);
      const chats = await getUserChatsAsync(user.id);
      setSavedChats(chats);

      // Auto-save current chat under new user account only if there are user messages
      const hasUserMsg = messages.some(m => m.role === 'user');
      if (hasUserMsg) {
        const chatId = currentChatIdRef.current || 'chat_' + Date.now();
        updateChatId(chatId);
        const userMsg = messages.find(m => m.role === 'user')?.content || 'Search';
        const title = userMsg.slice(0, 28) + (userMsg.length > 28 ? '...' : '');
        const updated = await saveUserChatAsync(user.id, {
          id: chatId,
          title,
          date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          language: selectedLanguage || 'English',
          messages,
          schemes: suggestedSchemes,
          updatedAt: Date.now(),
        });
        setSavedChats(updated);
      }

      setTimeout(() => {
        setShowAuthModal(false);
        setAuthError('');
        setAuthSuccessMsg('');
      }, 600);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setSavedChats([]);
    updateChatId(null);
  };

  const handleStartNewChat = () => {
    stopSpeaking();
    setLoading(false);
    setSelectedLanguage(null);
    setMessages([]);
    setSuggestedSchemes([]);
    updateChatId(null);
    setGuestMessageCount(0);
    setInput('');
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    const updated = await deleteUserChatAsync(currentUser.id, chatId);
    setSavedChats(updated);
    if (currentChatIdRef.current === chatId) {
      handleStartNewChat();
    }
  };

  function extractSchemesFromMessages(messages: { role: string, content: string }[]): { name: string, eligibility_match: string }[] {
    const schemes: { name: string, eligibility_match: string }[] = [];
    const seen = new Set<string>();

    const ignoreTerms = new Set([
      'scholarship', 'scholarships', 'scheme', 'schemes', 'yojana', 'grant', 'portal',
      'up ke students ke liye specific scholarships', 'national scholarship portal', 'nsp',
      'quick reply suggestions', 'annual income', 'family background', 'main goal', 'age', 'state'
    ]);

    const assistantMsgs = messages.filter(m => m.role === 'assistant');
    for (const msg of assistantMsgs) {
      const text = msg.content || '';
      const lower = text.toLowerCase();

      // Ignore message if it is in the intake/questioning phase and has no explicit ### scheme headers
      const isIntake = ['in sawalon', 'jawaab dein', 'thodi aur jankari', 'jankari chahiye', 'quick reply suggestions', 'annual income', 'family background', 'main goal'].some(i => lower.includes(i));
      if (isIntake && !text.includes('###')) {
        continue;
      }

      const headingMatches = Array.from(text.matchAll(/###\s*(?:\d+\.\s*)?\*\*(.*?)\*\*/g)).map(m => m[1]);
      const numberMatches = Array.from(text.matchAll(/\*\*\d+\.\s*(.*?)\*\*/g)).map(m => m[1]);

      const candidates = [...headingMatches, ...numberMatches];
      for (let c of candidates) {
        if (!c) continue;
        let clean = c.replace(/[\u1F600-\u1F64F\u1F300-\u1F5FF\u1F680-\u1F6FF\u2600-\u26FF\u2700-\u27BF]/g, '').trim();
        clean = clean.replace(/^\d+\.\s*/, '').replace(/[\*:;]+$/, '').trim();
        const cleanLower = clean.toLowerCase();

        if (
          clean &&
          clean.length > 4 &&
          clean.length < 90 &&
          !seen.has(cleanLower) &&
          !ignoreTerms.has(cleanLower) &&
          !['sawalon', 'jawaab', 'suggestions', 'income', 'background', 'question'].some(p => cleanLower.includes(p))
        ) {
          seen.add(cleanLower);
          schemes.push({ name: clean, eligibility_match: '100% ELIGIBLE - MATCHED PROFILE' });
        }
      }
    }

    return schemes;
  }

  const loadSavedChat = (chat: SavedChat) => {
    stopSpeaking();
    setLoading(false);
    updateChatId(chat.id);
    setSelectedLanguage(chat.language);
    setMessages(chat.messages);

    const activeSchemes = (chat.schemes && chat.schemes.length > 0)
      ? chat.schemes
      : extractSchemesFromMessages(chat.messages);
    setSuggestedSchemes(activeSchemes);
  };

  // Pre-cache browser voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Advanced DSP Human Speech vs White Noise Detector
  const detectHumanVoice = (dataArray: Uint8Array): { isVoice: boolean; peak: number } => {
    let speechSum = 0;
    let speechPeak = 0;
    // Human voice pitch & formant frequency range: bins 1 to 30 (~60Hz to 2800Hz)
    for (let i = 1; i <= 30; i++) {
      const val = dataArray[i];
      speechSum += val;
      if (val > speechPeak) speechPeak = val;
    }
    const speechAvg = speechSum / 30;

    // Background white noise / high-frequency room hiss: bins 45 to 100 (~4200Hz to 9300Hz)
    let hissSum = 0;
    for (let i = 45; i <= 100; i++) {
      hissSum += dataArray[i];
    }
    const hissAvg = hissSum / 56;

    const formantRatio = speechPeak / Math.max(1, speechAvg);
    const voiceProminence = speechPeak - hissAvg;

    // Speech Criteria: Peak > 12 (captures soft/medium laptop speech), Formant Ratio > 1.4, Prominence > 6
    const isVoice = speechPeak > 12 && formantRatio > 1.4 && voiceProminence > 6;
    return { isVoice, peak: speechPeak };
  };

  // Standard Voice STT for text input with High-Definition Noise Suppression & Groq Whisper API
  const toggleListening = async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/webm')
          ? { mimeType: 'audio/webm' }
          : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      let audioContext: AudioContext | null = null;
      let analyser: AnalyserNode | null = null;
      let silenceTimer: any = null;
      let speechStarted = false;

      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        let consecutiveSpeechFrames = 0;
        const checkSilence = () => {
          if (mediaRecorder.state !== 'recording') {
            if (audioContext && audioContext.state !== 'closed') audioContext.close();
            return;
          }
          analyser?.getByteFrequencyData(dataArray);
          const { isVoice } = detectHumanVoice(dataArray);

          if (isVoice) {
            consecutiveSpeechFrames += 1;
            if (consecutiveSpeechFrames >= 2) {
              speechStarted = true;
              if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
              }
            }
          } else {
            consecutiveSpeechFrames = 0;
            if (speechStarted && !silenceTimer) {
              silenceTimer = setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop();
                }
              }, 1400);
            }
          }

          requestAnimationFrame(checkSilence);
        };

        requestAnimationFrame(checkSilence);
      } catch (e) {
        console.warn("VAD notice:", e);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        if (audioContext && audioContext.state !== 'closed') audioContext.close();
        stream.getTracks().forEach(track => track.stop());

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 500) return;

        const formData = new FormData();
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        formData.append('file', audioBlob, `recording.${ext}`);
        formData.append('language', selectedLanguage || 'Hindi');

        try {
          setLoading(true);
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Transcription failed');
          }

          const data = await response.json();
          if (data.text?.trim()) {
            setInput(data.text.trim());
          }
        } catch (err: any) {
          console.error("Transcription failed", err);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Microphone access denied or not available", err);
      alert("Please allow microphone access to use voice features.");
    }
  };

  // Helper to clean raw markdown symbols & emojis before TTS reading
  const cleanMarkdownForSpeech = (text: string) => {
    if (!text) return '';
    return text
      .replace(/###\s*(?:\d+\.\s*)?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
      .replace(/\|[^\n]*\|/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const fallbackWebSpeech = (cleanText: string, langId: string | null, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
      return;
    }
    window.speechSynthesis.cancel();

    const langObj = LANGUAGES.find(l => l.id === langId);
    const targetLang = langObj?.langCode || 'hi-IN';

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = (e: any) => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsSpeaking(false);
        if (onEndCallback) onEndCallback();
      }
    }, 50);
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const speakMessage = async (text: string, langId: string | null, onEndCallback?: () => void) => {
    stopSpeaking();

    const cleanText = cleanMarkdownForSpeech(text);
    if (!cleanText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    setIsSpeaking(true);

    const sentences = cleanText
      .split(/(?<=[.!?|।\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const audioCache = new Map<number, Promise<Blob | null>>();

    const prefetchSentenceBlob = (index: number): Promise<Blob | null> => {
      if (index >= sentences.length) return Promise.resolve(null);
      if (audioCache.has(index)) return audioCache.get(index)!;

      const promise = (async () => {
        try {
          const res = await fetch(`${apiUrl}/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: sentences[index], language: langId || 'Hindi' })
          });
          if (res.ok) {
            const blob = await res.blob();
            if (blob.size > 300) return blob;
          }
        } catch (err) {
          console.warn("TTS prefetch notice:", err);
        }
        return null;
      })();

      audioCache.set(index, promise);
      return promise;
    };

    // Pre-fetch sentence 0 and sentence 1 immediately in parallel!
    prefetchSentenceBlob(0);
    if (sentences.length > 1) prefetchSentenceBlob(1);

    const playSentenceAtIndex = async (index: number) => {
      if (index >= sentences.length) {
        setIsSpeaking(false);
        currentAudioRef.current = null;
        if (onEndCallback) onEndCallback();
        return;
      }

      // Pre-fetch next sentence in background while current plays
      if (index + 1 < sentences.length) {
        prefetchSentenceBlob(index + 1);
      }

      const blob = await prefetchSentenceBlob(index);

      if (blob) {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          playSentenceAtIndex(index + 1);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          playSentenceAtIndex(index + 1);
        };

        await audio.play();
        return;
      }

      fallbackWebSpeech(sentences[index], langId, () => playSentenceAtIndex(index + 1));
    };

    playSentenceAtIndex(0);
  };

  const scrollToBottom = () => {
    const container = document.getElementById('chat-scroll-container');
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (selectedLanguage) {
      scrollToBottom();
    }
  }, [messages, loading, selectedLanguage]);

  const handleLanguageSelect = (langId: string) => {
    const lang = LANGUAGES.find(l => l.id === langId);
    setSelectedLanguage(langId);
    setMessages([{ role: 'assistant', content: lang?.greeting || '' }]);
    setSuggestedSchemes([]);
    updateChatId(null);
  };

  const sendMessage = async (overrideContent?: string) => {
    const messageToSend = overrideContent || input;
    if (!messageToSend.trim() || loading) return;

    if (!currentUser && (guestMessageCount >= 4 || suggestedSchemes.length > 0)) {
      setShowAuthModal(true);
      return;
    }

    if (!currentUser) {
      const newCount = guestMessageCount + 1;
      setGuestMessageCount(newCount);
    }

    const updatedMessages = [...messages, { role: 'user', content: messageToSend }];
    setMessages(updatedMessages);
    if (!overrideContent) setInput('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          user_context: { language: selectedLanguage }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Server error');
      }

      const data = await res.json();
      const finalMessages = [...updatedMessages, { role: 'assistant', content: data.response }];
      setMessages(finalMessages);

      const activeSchemes = (data.schemes && data.schemes.length > 0)
        ? data.schemes
        : extractSchemesFromMessages(finalMessages);

      setSuggestedSchemes(activeSchemes);

      if (activeSchemes.length > 0 && !currentUser) {
        setShowAuthModal(true);
      }

      if (currentUser) {
        const hasUserMsg = finalMessages.some(m => m.role === 'user');
        if (hasUserMsg) {
          const chatId = currentChatIdRef.current || 'chat_' + Date.now();
          if (!currentChatIdRef.current) updateChatId(chatId);

          const firstUserMsg = finalMessages.find(m => m.role === 'user')?.content || 'Search';
          const title = firstUserMsg.slice(0, 28) + (firstUserMsg.length > 28 ? '...' : '');

          const updated = await saveUserChatAsync(currentUser.id, {
            id: chatId,
            title,
            date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            language: selectedLanguage || 'English',
            messages: finalMessages,
            schemes: activeSchemes,
            updatedAt: Date.now(),
          });
          setSavedChats(updated);
        }
      }

      return data.response;
    } catch (error: any) {
      const errMsg = `Sorry, technical issue: ${error.message || 'Unknown error'}. Please try again.`;
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
      return errMsg;
    } finally {
      setLoading(false);
    }
  };

  // --- BUTTON-CONTROLLED TALK MODE CONTROLLER ---

  const startTalkRecordingSession = useCallback(async () => {
    if (!isTalkModeRef.current) return;

    stopSpeaking();
    setTalkStatus('listening');

    try {
      if (talkStreamRef.current) {
        talkStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000
        }
      });
      talkStreamRef.current = stream;

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/webm')
          ? { mimeType: 'audio/webm' }
          : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      talkMediaRecorderRef.current = mediaRecorder;
      talkAudioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          talkAudioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (!isTalkModeRef.current) return;

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(talkAudioChunksRef.current, { type: mimeType });

        if (audioBlob.size < 500) {
          if (isTalkModeRef.current) setTalkStatus('idle');
          return;
        }

        setTalkStatus('transcribing');
        const formData = new FormData();
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        formData.append('file', audioBlob, `talk_recording.${ext}`);
        formData.append('language', selectedLanguage || 'Hindi');

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiUrl}/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Transcription failed');

          const data = await response.json();
          const userVoiceText = data.text?.trim();

          if (userVoiceText && isTalkModeRef.current) {
            setTalkTranscript(userVoiceText);
            setTalkStatus('thinking');

            const aiResponse = await sendMessage(userVoiceText);

            if (aiResponse && isTalkModeRef.current) {
              setTalkResponseText(aiResponse);
              setTalkStatus('speaking');

              speakMessage(aiResponse, selectedLanguage, () => {
                if (isTalkModeRef.current) {
                  setTalkStatus('idle');
                }
              });
            } else if (isTalkModeRef.current) {
              setTalkStatus('idle');
            }
          } else if (isTalkModeRef.current) {
            setTalkStatus('idle');
          }
        } catch (err: any) {
          console.warn("Talk Mode transcription notice:", err?.message || err);
          if (isTalkModeRef.current) {
            setTalkStatus('idle');
          }
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Mic error in Talk Mode:", err);
      alert("Microphone access is required for Talk Mode.");
      setTalkStatus('idle');
    }
  }, [selectedLanguage]);

  const stopTalkListeningAndSend = () => {
    if (talkMediaRecorderRef.current && talkMediaRecorderRef.current.state === 'recording') {
      talkMediaRecorderRef.current.stop();
    }
  };

  const openTalkMode = () => {
    if (!currentUser) {
      setAuthTab('signup');
      setShowAuthModal(true);
      return;
    }
    if (!selectedLanguage) {
      alert("Please select a language first.");
      return;
    }

    stopSpeaking();
    setIsTalkMode(true);
    setTalkStatus('idle');
    setTalkTranscript('');
    setTalkResponseText('');

    if (!currentChatIdRef.current) {
      updateChatId('chat_' + Date.now());
    }
  };

  const closeTalkMode = () => {
    setIsTalkMode(false);
    setTalkStatus('idle');
    stopSpeaking();

    if (talkMediaRecorderRef.current && talkMediaRecorderRef.current.state === 'recording') {
      try { talkMediaRecorderRef.current.stop(); } catch (e) { }
    }
    if (talkStreamRef.current) {
      talkStreamRef.current.getTracks().forEach(track => track.stop());
      talkStreamRef.current = null;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-amber-500/30 font-sans">
      <div className={`transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] h-[200vh] w-full flex flex-col ${selectedLanguage ? '-translate-y-[100vh]' : 'translate-y-0'}`}>

        {/* --- PAGE 1: Language Selection --- */}
        <div className="flex-none h-screen bg-[url('/bg-image.jpg.png')] bg-cover bg-center relative flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/40 to-zinc-950 z-0 pointer-events-none"></div>
          <div className="bg-zinc-900/85 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm sm:max-w-md w-full text-center relative overflow-hidden z-10 transform scale-90 sm:scale-95 origin-center transition-transform">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-[50px] -z-10"></div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-[0_0_25px_rgba(245,158,11,0.3)]">🐦</div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 mb-1 tracking-tight">AmritChidiya</h1>
            <p className="text-zinc-400 mb-4 font-light tracking-wide text-xs uppercase">Apni Sone Ki Chidiya</p>
            <h2 className="text-sm font-medium mb-3 text-zinc-300">Select Your Language</h2>
            <div className="grid gap-2.5">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageSelect(lang.id)}
                  className="py-2.5 px-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all text-sm font-medium text-zinc-300 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- PAGE 2: Main Interface --- */}
        <div className="flex-none h-screen flex w-full relative">

          {/* Left Sidebar */}
          <div className="w-64 sm:w-72 shrink-0 bg-zinc-950/50 backdrop-blur-3xl border-r border-zinc-800/50 flex flex-col z-10">

            {/* Header / Brand */}
            <div className="p-4 sm:p-5 border-b border-zinc-800/50 relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]">🐦</div>
                <div>
                  <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-tight">AmritChidiya</h1>
                  <p className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest">Sone Ki Chidiya</p>
                </div>
              </div>

              {!currentUser && (
                <button
                  onClick={() => {
                    setAuthTab('login');
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all"
                >
                  {t.signIn}
                </button>
              )}
            </div>

            {/* User Profile Pill (If Logged In) */}
            {currentUser && (
              <div className="mx-3 mt-3 p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-zinc-950 text-xs shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-zinc-200 truncate">{currentUser.name}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}

            {/* Sidebar Action Buttons */}
            <div className="p-3">
              <button
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl font-medium text-xs hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-300 shadow-sm"
              >
                <Plus size={15} />
                {LANGUAGES.find(l => l.id === selectedLanguage)?.newChatLabel || 'Naya Chat'}
              </button>
            </div>

            {/* Saved Chat History Section ("Purani Chats") */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar border-t border-zinc-800/40">
              <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <History size={12} />
                <span>{t.puraniChats}</span>
              </div>

              {!currentUser ? (
                <div className="p-3.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-center">
                  <Lock size={18} className="mx-auto text-amber-500/60 mb-1.5" />
                  <p className="text-xs font-medium text-zinc-400">{t.saveHistoryPromptTitle}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{t.saveHistoryPromptSub}</p>
                  <button
                    onClick={() => {
                      setAuthTab('login');
                      setShowAuthModal(true);
                    }}
                    className="mt-2.5 text-xs font-bold text-amber-400 underline hover:text-amber-300"
                  >
                    {t.signIn}
                  </button>
                </div>
              ) : savedChats.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6 italic">{t.noSavedChats}</p>
              ) : (
                savedChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => loadSavedChat(chat)}
                    className={`w-full text-left p-2.5 px-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${currentChatId === chat.id
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                        : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                  >
                    <div className="truncate mr-2">
                      <p className="text-[11px] sm:text-xs font-semibold truncate group-hover:text-amber-400 transition-colors">
                        {chat.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mt-0.5">
                        <span>{chat.date}</span>
                        <span>•</span>
                        <span>{chat.schemes.length} {t.schemesCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        title="Delete chat"
                        className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                      <ChevronRight size={13} className="text-zinc-600 group-hover:text-amber-400" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-zinc-800/50 text-[10px] font-medium text-zinc-600 flex flex-col gap-1.5">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span> System Online</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span> Lang: {selectedLanguage || 'None'}</div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col relative z-10 bg-[url('/bg-image.jpg.png')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/40 to-zinc-950 pointer-events-none z-0"></div>

            {/* Top Bar with Auth Status & Talk Mode Action */}
            <div className="h-14 sm:h-16 flex items-center justify-between px-6 bg-gradient-to-b from-zinc-950/90 via-zinc-950/40 to-transparent z-10 shrink-0">
              <h2 className="text-xs font-bold text-zinc-400 tracking-wider uppercase drop-shadow-md flex items-center gap-2">
                <span>AmritChidiya Assistant</span>
              </h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartNewChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10 transition-all shadow-sm"
                >
                  <Plus size={14} />
                  <span>{LANGUAGES.find(l => l.id === selectedLanguage)?.newChatLabel || 'Naya Chat'}</span>
                </button>
              </div>
            </div>

            <div id="chat-scroll-container" className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 chat-container relative z-10 scroll-smooth">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                const isLockedForGuest = !currentUser && isAssistant && (suggestedSchemes.length > 0 || guestMessageCount >= 4) && index === messages.length - 1;

                return (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[80%] px-5 py-4 rounded-2xl text-xs sm:text-sm leading-relaxed backdrop-blur-md relative overflow-hidden ${isAssistant
                      ? 'bg-zinc-900/80 border border-zinc-800/80 rounded-tl-sm text-zinc-300 shadow-lg'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-100 rounded-tr-sm shadow-[0_0_20px_rgba(245,158,11,0.05)]'}`}>

                      {isLockedForGuest ? (
                        <div className="relative py-2">
                          <div className="filter blur-md select-none opacity-20 pointer-events-none max-h-36 overflow-hidden">
                            <MarkdownContent content={msg.content} isAssistant={isAssistant} />
                          </div>
                          <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center rounded-xl border border-amber-500/30 shadow-2xl">
                            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5 text-lg animate-pulse">
                              🔒
                            </div>
                            <h4 className="font-bold text-amber-200 text-xs sm:text-sm">{t.schemesMatchedTitle}</h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5 max-w-md leading-relaxed">
                              {t.authSubtitle}
                            </p>
                            <button
                              onClick={() => {
                                setAuthTab('signup');
                                setShowAuthModal(true);
                              }}
                              className="mt-2.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-xl text-[11px] uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            >
                              {t.unlockSchemesNow}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <MarkdownContent content={msg.content} isAssistant={isAssistant} />
                          {isAssistant && (
                            <div className="mt-2.5 flex justify-end">
                              <button
                                onClick={() => speakMessage(msg.content, selectedLanguage)}
                                className="text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider bg-zinc-950/50 px-2 py-1 rounded-md border border-zinc-800/50 hover:border-amber-500/30 hover:bg-amber-500/5"
                              >
                                <Volume2 size={13} /> {t.listen}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && !isTalkMode && (
                <div className="text-amber-500/70 text-xs font-medium flex items-center gap-2.5 bg-zinc-900/50 inline-flex px-3.5 py-1.5 rounded-full border border-amber-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.5)]"></span> {t.processingRequest}
                </div>
              )}
              {isSpeaking && !isTalkMode && (
                <button
                  onClick={stopSpeaking}
                  className="mt-3 px-3.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-[11px] uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:bg-red-500/20 transition-all flex items-center gap-1.5 mx-auto"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  {t.stopAudio}
                </button>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="pt-2 pb-3 px-4 sm:px-6 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent z-10 shrink-0">
              <div className="flex gap-3 max-w-2xl sm:max-w-3xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-zinc-800 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative flex gap-2 w-full bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/70 items-center shadow-lg">
                  <button
                    onClick={toggleListening}
                    title="Voice dictation"
                    className={`p-2 rounded-xl transition-colors ${isListening ? 'text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse' : 'text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
                  >
                    <Mic size={17} />
                  </button>

                  <button
                    onClick={openTalkMode}
                    title={currentUser ? "Enter hands-free talk mode" : "Talk Mode requires Sign In"}
                    className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-all flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider shrink-0"
                  >
                    <Headphones size={15} />
                    <span className="hidden sm:inline">Talk Mode</span>
                    {!currentUser && <Lock size={10} className="text-amber-400" />}
                  </button>

                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={t.placeholderInput}
                    className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-1.5 outline-none text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
                  />

                  <button
                    onClick={() => sendMessage()}
                    disabled={loading}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0 text-xs sm:text-sm"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 sm:w-72 shrink-0 bg-zinc-950/50 backdrop-blur-3xl border-l border-zinc-800/50 p-4 flex flex-col z-10 h-full overflow-hidden">
            <h3 className="text-zinc-300 font-semibold mb-4 flex items-center gap-2.5 text-xs uppercase tracking-wider">
              <span className="w-6 h-px bg-gradient-to-r from-amber-500 to-transparent"></span>
              {t.matchesTitle}
            </h3>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">

              {!currentUser && suggestedSchemes.length > 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-lg">
                    🔒
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-200 text-xs sm:text-sm">{t.schemesMatchedTitle}</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                      {t.schemesMatchedSub}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAuthTab('signup');
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold rounded-xl text-[11px] uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    {t.unlockSchemesNow}
                  </button>
                </div>
              ) : suggestedSchemes.length === 0 ? (
                <div className="text-zinc-600 text-[10px] uppercase tracking-widest text-center mt-6 p-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 font-medium leading-relaxed">
                  {t.awaitingDataTitle}<br /><span className="text-zinc-700">{t.awaitingDataSub}</span>
                </div>
              ) : (
                suggestedSchemes.map((scheme, idx) => (
                  <div key={idx} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/0 group-hover:bg-amber-500 transition-colors duration-300"></div>
                    <p className="font-medium text-zinc-200 leading-snug group-hover:text-amber-400 transition-colors text-xs sm:text-sm">{scheme.name}</p>
                    <div className="mt-3 inline-block">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 backdrop-blur-sm">
                        {scheme.eligibility_match}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- AUTH GATING MODAL ("Unlock Your Beneficial Schemes") --- */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-8 relative shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 p-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition-all"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                ✨
              </div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                {t.authTitle}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed px-2">
                {t.authSubtitle}
              </p>
            </div>

            {/* Tabs: Sign Up / Log In */}
            <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('signup');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === 'signup'
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                {t.signUpTab}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authTab === 'login'
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                {t.logInTab}
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authTab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">{t.fullNameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.fullNamePlaceholder}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">{t.emailLabel}</label>
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">{t.passwordLabel}</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPass}
                  onChange={(e) => setAuthPass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-zinc-200 outline-none transition-colors"
                />
              </div>

              {authError && (
                <p className="text-xs text-red-400 font-medium text-center py-1">{authError}</p>
              )}

              {authSuccessMsg && (
                <p className="text-xs text-emerald-400 font-medium text-center py-1">{authSuccessMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-0.5 mt-2"
              >
                {authTab === 'signup' ? t.submitSignUp : t.submitLogIn}
              </button>
            </form>

            <p className="text-[10px] text-zinc-500 text-center mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-amber-500" />
              <span>{t.freeSecureFootnote}</span>
            </p>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN VIRTUAL ASSISTANT TALK MODE OVERLAY (Gemini Live Style) --- */}
      {isTalkMode && (
        <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 md:p-8 overflow-y-auto sm:overflow-hidden animate-in fade-in duration-500">

          {/* Top Bar */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">🐦</div>
              <div>
                <h2 className="font-bold text-zinc-100 text-base sm:text-lg tracking-tight flex items-center gap-2">
                  <span>{t.liveAssistantTitle}</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                </h2>
                <p className="text-[11px] sm:text-xs text-amber-400/80 font-medium">{t.liveAssistantSub}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Captions Toggle Button */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider border transition-all ${showCaptions
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <Captions size={15} />
                <span>{showCaptions ? t.captionsOn : t.captionsOff}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={closeTalkMode}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-all shadow-md"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Center Dynamic Golden Orb */}
          <div className="relative flex-1 min-h-0 shrink flex flex-col items-center justify-center my-1 sm:my-3 py-1 z-10 overflow-hidden">
            <div className="relative flex items-center justify-center scale-85 sm:scale-95 md:scale-100 transform origin-center">

              {/* Ripple Rings when Speaking */}
              {talkStatus === 'speaking' && (
                <>
                  <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full border border-amber-500/40 animate-orb-ripple pointer-events-none"></div>
                  <div className="absolute w-60 h-60 sm:w-80 sm:h-80 rounded-full border border-amber-400/20 animate-orb-ripple pointer-events-none delay-300"></div>
                </>
              )}

              {/* Outer Glow Aura */}
              <div className={`w-36 h-36 sm:w-52 sm:h-52 md:w-64 md:h-64 rounded-full transition-all duration-700 flex items-center justify-center relative ${talkStatus === 'listening' ? 'bg-gradient-to-br from-amber-500/30 to-amber-600/10 animate-orb-pulse shadow-[0_0_50px_rgba(245,158,11,0.5)]' :
                  talkStatus === 'thinking' || talkStatus === 'transcribing' ? 'bg-gradient-to-br from-amber-400/40 to-yellow-600/20 animate-spin duration-3000 shadow-[0_0_70px_rgba(245,158,11,0.6)]' :
                    talkStatus === 'speaking' ? 'bg-gradient-to-br from-amber-400/30 to-amber-500/20 animate-orb-glow shadow-[0_0_90px_rgba(245,158,11,0.7)]' :
                      'bg-zinc-900/80 border border-zinc-800'
                }`}>
                {/* Inner Core Orb */}
                <div className={`w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-transform duration-500 ${talkStatus === 'listening' ? 'scale-105' :
                    talkStatus === 'speaking' ? 'scale-110' : 'scale-100'
                  }`}>
                  🐦
                </div>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="mt-3 sm:mt-4 text-center space-y-0.5 sm:space-y-1">
              <p className="text-base sm:text-lg font-bold text-amber-200 tracking-wide uppercase">
                {talkStatus === 'listening' && t.listeningStatus}
                {talkStatus === 'transcribing' && t.transcribingStatus}
                {talkStatus === 'thinking' && t.thinkingStatus}
                {talkStatus === 'speaking' && t.speakingStatus}
                {talkStatus === 'idle' && t.tapMicToSpeak}
              </p>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                {talkStatus === 'listening' ? t.tapDoneSub : t.liveAssistantSub}
              </p>
            </div>
          </div>

          {/* Subtitles / Live Captions Overlay Card */}
          {showCaptions && (
            <div className="max-w-2xl w-full mx-auto bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-xl p-3 mb-2 sm:mb-3 shadow-xl z-10 transition-all duration-300 shrink-0">
              <div className="flex items-center gap-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
                <Captions size={12} />
                <span>{t.liveCaptions}</span>
              </div>

              <div className="min-h-[36px] max-h-24 overflow-y-auto text-xs text-zinc-200 leading-relaxed space-y-1">
                {talkTranscript && (
                  <p className="text-amber-300/90 font-medium">
                    <span className="text-zinc-500 text-[9px] font-bold uppercase mr-1">You:</span>
                    "{talkTranscript}"
                  </p>
                )}
                {talkResponseText && (
                  <div className="text-zinc-200">
                    <span className="text-amber-400 text-[9px] font-bold uppercase mr-1 block mb-0.5">AmritChidiya:</span>
                    <MarkdownContent content={talkResponseText} isAssistant={true} />
                  </div>
                )}
                {!talkTranscript && !talkResponseText && (
                  <p className="text-zinc-600 italic text-center py-0.5 text-[11px]">
                    {t.noSpeechDetected}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bottom Action Controls Toolbar */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 z-10 py-1 shrink-0">
            {talkStatus === 'listening' ? (
              <button
                onClick={stopTalkListeningAndSend}
                className="flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105"
              >
                <Square size={15} fill="currentColor" />
                <span>{t.doneSpeaking}</span>
              </button>
            ) : (
              <button
                onClick={startTalkRecordingSession}
                disabled={talkStatus === 'thinking' || talkStatus === 'transcribing'}
                className="flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <Mic size={16} />
                <span>{t.startListening}</span>
              </button>
            )}

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-full hover:bg-red-500/20 transition-all"
              >
                <Pause size={15} />
                <span>{t.pauseAudio}</span>
              </button>
            )}

            <button
              onClick={closeTalkMode}
              className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-full hover:bg-zinc-800 transition-all"
            >
              <span>{t.exitTalkMode}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
