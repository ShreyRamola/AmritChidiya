# backend/agents/scheme_explorer.py

import os
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SchemeDetail(BaseModel):
    id: str
    name: str
    hindi_name: str
    category_type: str  # "Scholarship" | "Women Empowerment" | "Financial Aid" | "Skill & Jobs" | "Housing & Energy" | "Healthcare" | "Farmer Welfare"
    badge: str          # "NEWLY PUBLISHED" | "CABINET APPROVED" | "LATEST 2026" | "DEADLINE EXTENDED" | "ACTIVE"
    published_date: str # e.g. "Nov 2026", "Oct 2026", "2026 Gazette"
    state: str          # "All India" | "Uttar Pradesh" | "Maharashtra" | "Bihar" | "Rajasthan" | "Madhya Pradesh" | "Delhi"
    target_gender: str  # "All" | "Female" | "Male"
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    target_categories: List[str] # ["All"] or ["General", "OBC", "SC", "ST", "EWS", "Minority"]
    max_income_lakh: Optional[float] = None
    benefit: str
    eligibility_summary: str
    official_portal: str
    source: str
    news_snippet: str

# ─────────────────────────────────────────────────────────────────────────────
# CURATED & LIVE-VERIFIED OFFICIAL WELFARE SCHEMES (CLEAN OFFICIAL SCHEME NAMES)
# ─────────────────────────────────────────────────────────────────────────────
NEW_GOVT_SCHEMES_DATA: List[Dict[str, Any]] = [
    {
        "id": "pm-internship-scheme",
        "name": "PM Internship Scheme",
        "hindi_name": "प्रधानमंत्री इंटर्नशिप योजना",
        "category_type": "Skill & Jobs",
        "badge": "NEWLY PUBLISHED",
        "published_date": "Union Budget 2024-25 / Active 2026",
        "state": "All India",
        "target_gender": "All",
        "min_age": 21,
        "max_age": 24,
        "target_categories": ["All", "General", "OBC", "SC", "ST", "EWS"],
        "max_income_lakh": 8.0,
        "benefit": "₹5,000 monthly stipend (₹4,500 DBT + ₹500 CSR) + ₹6,000 one-time grant for 12 months internship in India's top 500 companies.",
        "eligibility_summary": "Indian youth aged 21-24 who have passed 10th, 12th, ITI, Polytechnic, Diploma, or Graduates (BA, B.Sc, B.Com, BBA, B.Pharma). Must not be employed full-time, family annual income under ₹8 Lakh.",
        "official_portal": "https://pminternship.mca.gov.in",
        "source": "Ministry of Corporate Affairs (MCA)",
        "news_snippet": "Official Government of India portal pminternship.mca.gov.in opened for 1.25 lakh internship opportunities across premier enterprises."
    },
    {
        "id": "up-scooty-yojana",
        "name": "UP Rani Laxmibai Scooty Yojana",
        "hindi_name": "उत्तर प्रदेश रानी लक्ष्मीबाई स्कूटी योजना",
        "category_type": "Women Empowerment",
        "badge": "NEWLY PUBLISHED",
        "published_date": "Cabinet Gazette 2026",
        "state": "Uttar Pradesh",
        "target_gender": "Female",
        "min_age": 17,
        "max_age": 28,
        "target_categories": ["All", "General", "OBC", "SC", "ST", "EWS", "Minority"],
        "max_income_lakh": 12.0,
        "benefit": "Free petrol scooter with RTO registration, multi-year insurance, helmet, and initial fuel allowance.",
        "eligibility_summary": "Female students resident of Uttar Pradesh enrolled in undergraduate/postgraduate college courses. Selection based on academic merit.",
        "official_portal": "https://up.gov.in",
        "source": "UP Department of Higher Education",
        "news_snippet": "UP Cabinet has approved the rollout to provide 40,000+ meritorious college female students free scooters for safe higher education commuting."
    },
    {
        "id": "pm-surya-ghar",
        "name": "PM Surya Ghar Muft Bijli Yojana",
        "hindi_name": "पीएम सूर्य घर मुफ्त बिजली योजना",
        "category_type": "Housing & Energy",
        "badge": "LATEST UPDATE",
        "published_date": "Active 2026",
        "state": "All India",
        "target_gender": "All",
        "min_age": 18,
        "max_age": None,
        "target_categories": ["All"],
        "max_income_lakh": None,
        "benefit": "Up to ₹78,000 direct subsidy on rooftop solar installation + 300 units free monthly electricity.",
        "eligibility_summary": "Any Indian household with a pucca roof, valid electricity connection, and no prior solar subsidy claimed.",
        "official_portal": "https://pmsuryaghar.gov.in",
        "source": "Ministry of New & Renewable Energy (MNRE)",
        "news_snippet": "Subsidy disbursed directly to applicant bank account within 30 days of rooftop solar net meter installation."
    },
    {
        "id": "up-post-matric",
        "name": "UP Post-Matric Scholarship",
        "hindi_name": "उत्तर प्रदेश पोस्ट-मैट्रिक छात्रवृत्ति",
        "category_type": "Scholarship",
        "badge": "DEADLINE EXTENDED",
        "published_date": "Academic Year 2025-26",
        "state": "Uttar Pradesh",
        "target_gender": "All",
        "min_age": 15,
        "max_age": 35,
        "target_categories": ["General", "OBC", "SC", "ST", "Minority", "EWS"],
        "max_income_lakh": 2.5,
        "benefit": "100% course tuition fee reimbursement + monthly maintenance allowance of up to ₹1,200/month.",
        "eligibility_summary": "Uttar Pradesh domicile studying in Class 11, 12, ITI, Polytechnic, B.Tech, MBBS, Degree courses. Family income <= ₹2.5 Lakh for SC/ST and <= ₹2.0 Lakh for General/OBC.",
        "official_portal": "https://scholarship.up.gov.in",
        "source": "UP Social Welfare & Backward Class Welfare Dept",
        "news_snippet": "UP scholarship portal biometrics and DigiLocker integration mandatory for auto-verification and DBT fund credit."
    },
    {
        "id": "majhi-ladki-bahin",
        "name": "Mukhyamantri Majhi Ladki Bahin Yojana",
        "hindi_name": "मुख्यमंत्री माझी लाडकी बहीण योजना",
        "category_type": "Women Empowerment",
        "badge": "NEWLY PUBLISHED",
        "published_date": "Recent Notification",
        "state": "Maharashtra",
        "target_gender": "Female",
        "min_age": 21,
        "max_age": 65,
        "target_categories": ["All", "General", "OBC", "SC", "ST", "EWS"],
        "max_income_lakh": 2.5,
        "benefit": "₹1,500 direct monthly financial assistance (₹18,000 annually) transferred straight to bank account.",
        "eligibility_summary": "Resident women of Maharashtra married, widowed, divorced, deserted or destitute, with family annual income under ₹2.5 Lakh.",
        "official_portal": "https://ladakibahin.maharashtra.gov.in",
        "source": "Government of Maharashtra Women & Child Development",
        "news_snippet": "Over 2 crore women enrolled under DBT scheme in Maharashtra with automated monthly transfers."
    },
    {
        "id": "ayushman-70-plus",
        "name": "Ayushman Bharat PM-JAY (70+ Senior Citizens)",
        "hindi_name": "आयुष्मान भारत 70+ वरिष्ठ नागरिक स्वास्थ्य कवच",
        "category_type": "Healthcare",
        "badge": "NEWLY PUBLISHED",
        "published_date": "Cabinet Approved 2026",
        "state": "All India",
        "target_gender": "All",
        "min_age": 70,
        "max_age": None,
        "target_categories": ["All"],
        "max_income_lakh": None,
        "benefit": "Free annual health insurance cover of ₹5 Lakh per year for secondary and tertiary hospitalization regardless of income.",
        "eligibility_summary": "Every Indian citizen aged 70 years and above. No income ceiling or caste restriction. Requires Aadhaar age proof.",
        "official_portal": "https://beneficiary.nha.gov.in",
        "source": "National Health Authority (NHA)",
        "news_snippet": "Universal Ayushman Vaya Vandana card launched for all 70+ senior citizens offering cashless care at 29,000+ empanelled hospitals."
    },
    {
        "id": "aicte-pragati-scholarship",
        "name": "AICTE Pragati Scholarship for Girls",
        "hindi_name": "एआईसीटीई प्रगति छात्रवृत्ति",
        "category_type": "Scholarship",
        "badge": "ACTIVE",
        "published_date": "Latest Session",
        "state": "All India",
        "target_gender": "Female",
        "min_age": 16,
        "max_age": 25,
        "target_categories": ["All", "General", "OBC", "SC", "ST", "EWS"],
        "max_income_lakh": 8.0,
        "benefit": "₹50,000 per annum for every year of technical degree or diploma study towards college fees, books, and laptop.",
        "eligibility_summary": "Girl students admitted to AICTE approved technical degree or diploma courses (1st year or 2nd year lateral entry). Up to 2 girls per family.",
        "official_portal": "https://scholarships.gov.in",
        "source": "All India Council for Technical Education (AICTE)",
        "news_snippet": "5,000 scholarships disbursed annually to empower meritorious girls in STEM and Engineering."
    },
    {
        "id": "pm-vishwakarma",
        "name": "PM Vishwakarma Yojana",
        "hindi_name": "पीएम विश्वकर्मा योजना",
        "category_type": "Skill & Jobs",
        "badge": "LATEST UPDATE",
        "published_date": "Active Phase II",
        "state": "All India",
        "target_gender": "All",
        "min_age": 18,
        "max_age": None,
        "target_categories": ["All", "OBC", "SC", "ST", "General"],
        "max_income_lakh": None,
        "benefit": "₹15,000 modern toolkit voucher + collateral-free loans up to ₹3,00,000 at 5% subsidized interest + ₹500/day training stipend.",
        "eligibility_summary": "Traditional artisans and craftspeople engaged in 18 trades (carpenters, blacksmiths, goldsmiths, tailors, potters, cobblers, weavers, etc.).",
        "official_portal": "https://pmvishwakarma.gov.in",
        "source": "Ministry of Micro, Small and Medium Enterprises (MSME)",
        "news_snippet": "Phase II expansion now onboarded via CSC Jan Seva Kendras with biometric verification across all districts."
    },
    {
        "id": "lakhpati-didi",
        "name": "Lakhpati Didi Yojana",
        "hindi_name": "लखपति दीदी योजना",
        "category_type": "Women Empowerment",
        "badge": "ACTIVE",
        "published_date": "National Mission",
        "state": "All India",
        "target_gender": "Female",
        "min_age": 18,
        "max_age": 55,
        "target_categories": ["All"],
        "max_income_lakh": 2.0,
        "benefit": "Interest-free business loans up to ₹5 Lakh, LED bulb/drone training, agricultural value-chain market access.",
        "eligibility_summary": "Women who are members of registered Self-Help Groups (SHGs) under Deendayal Antyodaya Yojana - DAY-NRLM.",
        "official_portal": "https://nrlm.gov.in",
        "source": "Ministry of Rural Development",
        "news_snippet": "Government expanded target to empower 3 Crore rural women to achieve sustained annual income of over ₹1 Lakh."
    },
    {
        "id": "bihar-post-matric",
        "name": "Bihar Post Matric Scholarship",
        "hindi_name": "बिहार पोस्ट मैट्रिक छात्रवृत्ति योजना",
        "category_type": "Scholarship",
        "badge": "LATEST 2026",
        "published_date": "2025-26 Session",
        "state": "Bihar",
        "target_gender": "All",
        "min_age": 15,
        "max_age": 30,
        "target_categories": ["OBC", "SC", "ST", "EWS"],
        "max_income_lakh": 3.0,
        "benefit": "Direct DBT course fee reimbursement up to ₹15,000/year for non-professional and up to ₹1,00,000 for technical courses.",
        "eligibility_summary": "Bihar permanent residents from SC, ST, BC, and EBC categories enrolled in recognized post-matric courses.",
        "official_portal": "https://pmsonline.bih.nic.in",
        "source": "Bihar Education Department",
        "news_snippet": "Bihar PMS 2.0 app launched with instant student verification linking college enrollment with Aadhaar DBT."
    },
    {
        "id": "pm-kisan",
        "name": "PM-Kisan Samman Nidhi",
        "hindi_name": "पीएम-किसान सम्मान निधि",
        "category_type": "Farmer Welfare",
        "badge": "LATEST UPDATE",
        "published_date": "Regular Cycle 2026",
        "state": "All India",
        "target_gender": "All",
        "min_age": 18,
        "max_age": None,
        "target_categories": ["All"],
        "max_income_lakh": None,
        "benefit": "₹6,000 per year paid in three equal installments of ₹2,000 directly into farmer bank accounts.",
        "eligibility_summary": "Small and marginal landholding farmer families with cultivable land registered in their name. eKYC mandatory.",
        "official_portal": "https://pmkisan.gov.in",
        "source": "Ministry of Agriculture & Farmers Welfare",
        "news_snippet": "Face-authentication eKYC introduced on PM-KISAN mobile app for farmers without OTP access."
    },
    {
        "id": "rajasthan-anupriti",
        "name": "Mukhyamantri Anuprati Coaching Yojana",
        "hindi_name": "मुख्यमंत्री अनुप्रति कोचिंग योजना",
        "category_type": "Scholarship",
        "badge": "ACTIVE",
        "published_date": "Annual Session",
        "state": "Rajasthan",
        "target_gender": "All",
        "min_age": 16,
        "max_age": 28,
        "target_categories": ["General", "OBC", "SC", "ST", "EWS", "Minority"],
        "max_income_lakh": 8.0,
        "benefit": "100% free coaching at top institutes for UPSC, RAS, NEET, IIT-JEE, CLAT + ₹40,000 annual boarding allowance for outstation students.",
        "eligibility_summary": "Rajasthan domicile students who scored high marks in 10th/12th exams. Annual family income under ₹8 Lakh.",
        "official_portal": "https://sjms.rajasthan.gov.in",
        "source": "Social Justice and Empowerment Department, Rajasthan",
        "news_snippet": "Over 30,000 free coaching seats allotted for competitive exams in premier coaching centres."
    },
    {
        "id": "delhi-jai-bheem",
        "name": "Jai Bheem Mukhyamantri Pratibha Vikas Yojana",
        "hindi_name": "जय भीम मुख्यमंत्री प्रतिभा विकास योजना",
        "category_type": "Scholarship",
        "badge": "ACTIVE",
        "published_date": "Active Phase",
        "state": "Delhi",
        "target_gender": "All",
        "min_age": 16,
        "max_age": 30,
        "target_categories": ["SC", "ST", "OBC", "EWS"],
        "max_income_lakh": 8.0,
        "benefit": "Free competitive examination coaching + ₹2,500 monthly stipend for books and travel.",
        "eligibility_summary": "Students residing in Delhi belonging to SC, ST, OBC, or EWS categories who cleared 10th and 12th from Delhi schools.",
        "official_portal": "https://delhi.gov.in",
        "source": "SC/ST/OBC Welfare Department, GNCTD",
        "news_snippet": "Delhi government scheme offers free guidance for Engineering, Medical, Civil Services, and Bank PO tests."
    },
    {
        "id": "mp-ladli-behna",
        "name": "Mukhyamantri Ladli Behna Yojana",
        "hindi_name": "मुख्यमंत्री लाड़ली बहना योजना",
        "category_type": "Women Empowerment",
        "badge": "ACTIVE",
        "published_date": "Monthly DBT",
        "state": "Madhya Pradesh",
        "target_gender": "Female",
        "min_age": 21,
        "max_age": 60,
        "target_categories": ["All", "General", "OBC", "SC", "ST"],
        "max_income_lakh": 2.5,
        "benefit": "₹1,250 direct cash assistance credited every month on the 10th directly to beneficiary bank account.",
        "eligibility_summary": "Resident women of Madhya Pradesh aged 21-60 whose family annual income is under ₹2.5 Lakh and own less than 5 acres of land.",
        "official_portal": "https://cmladlibehna.mp.gov.in",
        "source": "Madhya Pradesh Women & Child Development Department",
        "news_snippet": "1.29 crore women receiving regular monthly welfare deposit via DBT across Madhya Pradesh."
    },
    {
        "id": "begum-hazrat-mahal",
        "name": "Begum Hazrat Mahal National Scholarship",
        "hindi_name": "बेगम हज़रत महल राष्ट्रीय छात्रवृत्ति",
        "category_type": "Scholarship",
        "badge": "ACTIVE",
        "published_date": "NSP Academic Portal",
        "state": "All India",
        "target_gender": "Female",
        "min_age": 14,
        "max_age": 22,
        "target_categories": ["Minority"],
        "max_income_lakh": 2.0,
        "benefit": "₹5,000 for Class 9 & 10 students, ₹6,000 for Class 11 & 12 students directly paid via DBT.",
        "eligibility_summary": "Meritorious minority girl students (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) securing at least 50% aggregate marks in previous examination.",
        "official_portal": "https://scholarships.gov.in",
        "source": "Ministry of Minority Affairs",
        "news_snippet": "Full digital application via National Scholarship Portal (NSP) with automated Aadhaar seeding."
    },
    {
        "id": "pm-mudra",
        "name": "Pradhan Mantri Mudra Yojana",
        "hindi_name": "प्रधानमंत्री मुद्रा योजना",
        "category_type": "Financial Aid",
        "badge": "LATEST UPDATE",
        "published_date": "Union Budget Update",
        "state": "All India",
        "target_gender": "All",
        "min_age": 18,
        "max_age": 65,
        "target_categories": ["All"],
        "max_income_lakh": None,
        "benefit": "Collateral-free business loan limit doubled from ₹10 Lakh to ₹20 Lakh for entrepreneurs under Tarun Plus.",
        "eligibility_summary": "Non-corporate, non-farm small/micro enterprises and budding entrepreneurs who previously took and successfully repaid Tarun loans.",
        "official_portal": "https://www.mudra.org.in",
        "source": "Department of Financial Services, Ministry of Finance",
        "news_snippet": "Cabinet notified the doubled Mudra credit guarantee enhancement up to ₹20 Lakh for micro enterprises."
    },
    {
        "id": "up-abhyudaya",
        "name": "Mukhyamantri Abhyudaya Yojana",
        "hindi_name": "मुख्यमंत्री अभ्युदय योजना",
        "category_type": "Scholarship",
        "badge": "ACTIVE",
        "published_date": "Annual Session",
        "state": "Uttar Pradesh",
        "target_gender": "All",
        "min_age": 16,
        "max_age": 32,
        "target_categories": ["All", "General", "OBC", "SC", "ST", "EWS"],
        "max_income_lakh": 6.0,
        "benefit": "Free high-quality physical & online coaching by IAS/IPS/PCS officers + free tablet/study material distribution.",
        "eligibility_summary": "Students residing in Uttar Pradesh preparing for UPSC, UPPSC, NEET, CDS, NDA, and JEE entrance tests.",
        "official_portal": "https://abhyuday.up.gov.in",
        "source": "Government of Uttar Pradesh",
        "news_snippet": "Divisional headquarters conducting physical classes with free study tablet access for meritorious enrolled aspirants."
    },
    {
        "id": "pm-awas-urban",
        "name": "Pradhan Mantri Awas Yojana - Urban",
        "hindi_name": "प्रधानमंत्री आवास योजना - शहरी",
        "category_type": "Housing & Energy",
        "badge": "NEWLY PUBLISHED",
        "published_date": "Cabinet Notified 2026",
        "state": "All India",
        "target_gender": "All",
        "min_age": 21,
        "max_age": None,
        "target_categories": ["All", "EWS", "LIG", "MIG"],
        "max_income_lakh": 9.0,
        "benefit": "Up to ₹2.5 Lakh financial assistance for building a pucca house or interest subsidy of 4% on home loans up to ₹25 Lakh.",
        "eligibility_summary": "Urban families from EWS/LIG/MIG segments who do not own a pucca house anywhere in India. Female ownership or co-ownership preferred.",
        "official_portal": "https://pmay-urban.gov.in",
        "source": "Ministry of Housing and Urban Affairs (MoHUA)",
        "news_snippet": "Cabinet cleared ₹10 lakh crore investment to build 1 crore new houses for middle-class and poor urban families."
    }
]

def check_scheme_eligibility(
    scheme: Dict[str, Any],
    gender: Optional[str] = None,
    age: Optional[int] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    income_lakh: Optional[float] = None
) -> Dict[str, Any]:
    """
    Evaluates whether the user profile satisfies the scheme criteria.
    Returns: { "is_eligible": bool, "status_label": str, "reasons": List[str] }
    """
    reasons = []
    failed_reasons = []

    # 1. Gender check
    target_gender = scheme.get("target_gender", "All")
    if gender and gender.lower() not in ["all", "any", ""]:
        if target_gender != "All" and gender.lower() != target_gender.lower():
            failed_reasons.append(f"Only for {target_gender} beneficiaries")
        else:
            reasons.append(f"Gender matches ({target_gender})")

    # 2. State check
    scheme_state = scheme.get("state", "All India")
    if state and state.lower() not in ["all", "all india", "any", ""]:
        if scheme_state != "All India" and state.lower() != scheme_state.lower():
            failed_reasons.append(f"Only for {scheme_state} residents")
        else:
            reasons.append(f"State matches ({scheme_state})")

    # 3. Age check
    min_age = scheme.get("min_age")
    max_age = scheme.get("max_age")
    if age is not None and age > 0:
        if min_age and age < min_age:
            failed_reasons.append(f"Minimum age required is {min_age} years")
        elif max_age and age > max_age:
            failed_reasons.append(f"Maximum age limit is {max_age} years")
        else:
            reasons.append("Age criteria satisfied")

    # 4. Category check
    target_cats = [c.lower() for c in scheme.get("target_categories", ["All"])]
    if category and category.lower() not in ["all", "any", ""]:
        if "all" not in target_cats and category.lower() not in target_cats:
            failed_reasons.append(f"Applicable to {', '.join(scheme.get('target_categories', []))} only")
        else:
            reasons.append("Category eligible")

    # 5. Income check
    max_income = scheme.get("max_income_lakh")
    if income_lakh is not None and max_income is not None:
        if income_lakh > max_income:
            failed_reasons.append(f"Family income must be below ₹{max_income} Lakh")
        else:
            reasons.append(f"Income within limit (≤ ₹{max_income}L)")

    is_eligible = len(failed_reasons) == 0

    return {
        "is_eligible": is_eligible,
        "status_label": "100% Eligible (पात्र हैं)" if is_eligible else "Not Eligible (अपात्र)",
        "reasons": reasons if is_eligible else failed_reasons
    }

def get_explorer_schemes(
    gender: Optional[str] = None,
    age: Optional[int] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    income_lakh: Optional[float] = None,
    search: Optional[str] = None
) -> Dict[str, Any]:
    """
    Returns filtered schemes with computed eligibility.
    If no schemes match the exact filters, returns fallback latest schemes with a notice.
    """
    filtered = []
    clean_search = (search or "").strip().lower()

    for s in NEW_GOVT_SCHEMES_DATA:
        if clean_search:
            content_str = f"{s['name']} {s['hindi_name']} {s['benefit']} {s['eligibility_summary']} {s['state']} {s['category_type']}".lower()
            if clean_search not in content_str:
                continue

        matches_filter = True

        if state and state.lower() not in ["all", "all india", ""]:
            if s["state"].lower() != "all india" and s["state"].lower() != state.lower():
                matches_filter = False

        if gender and gender.lower() not in ["all", ""]:
            if s["target_gender"].lower() != "all" and s["target_gender"].lower() != gender.lower():
                matches_filter = False

        if category and category.lower() not in ["all", ""]:
            target_cats = [c.lower() for c in s.get("target_categories", ["All"])]
            if "all" not in target_cats and category.lower() not in target_cats:
                matches_filter = False

        if matches_filter:
            eligibility = check_scheme_eligibility(s, gender, age, category, state, income_lakh)
            scheme_copy = dict(s)
            scheme_copy["eligibility"] = eligibility
            filtered.append(scheme_copy)

    has_exact_matches = len(filtered) > 0

    if not has_exact_matches:
        fallback_list = []
        for s in NEW_GOVT_SCHEMES_DATA:
            if clean_search:
                content_str = f"{s['name']} {s['hindi_name']} {s['benefit']}".lower()
                if clean_search not in content_str:
                    continue
            eligibility = check_scheme_eligibility(s, gender, age, category, state, income_lakh)
            scheme_copy = dict(s)
            scheme_copy["eligibility"] = eligibility
            fallback_list.append(scheme_copy)
            
        return {
            "total_count": len(fallback_list),
            "is_fallback": True,
            "fallback_message": "No brand-new announcements found for this exact filter combination. Showing recently published Central & State welfare initiatives:",
            "schemes": fallback_list
        }

    return {
        "total_count": len(filtered),
        "is_fallback": False,
        "fallback_message": "",
        "schemes": filtered
    }
