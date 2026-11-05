# backend/agents/domain_shield.py

import os
import re
import json
import urllib.request
import urllib.parse
from typing import Optional, Dict, Any
from dotenv import load_dotenv
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path, override=True)
load_dotenv(override=True)
from groq import Groq

# Known trusted official and informational domains
OFFICIAL_SUFFIXES = (
    ".gov.in",
    ".nic.in",
    ".ac.in",
    ".edu.in",
    "myscheme.gov.in",
    "scholarships.gov.in",
    "pmkisan.gov.in",
    "pmjay.gov.in",
    "mudra.org.in",
    "aicte-india.org",
    "indiapost.gov.in",
    "eshram.gov.in",
    "pmsvanidhi.mohua.gov.in",
)

KNOWN_INFORMATIONAL_DOMAINS = (
    "govtschemes.in",
    "vikaspedia.in",
    "sarkariyojnaa.com",
    "yojanabot.com",
    "jagranjosh.com",
    "jagran.com",
    "hindustantimes.com",
    "timesofindia.indiatimes.com",
    "indiatimes.com",
    "ndtv.com",
    "indianexpress.com",
    "amarujala.com",
    "livehindustan.com",
    "patrika.com",
    "drishtiias.com",
    "egovtschemes.com",
    "govtschemesindia.com",
)

KNOWN_SCAM_TLDS = (".xyz", ".top", ".club", ".site", ".tk", ".ml", ".ga", ".cf", ".gq", ".work", ".click", ".buzz", ".vip")

def search_ddg_html(query: str, max_results: int = 5) -> list:
    """Fetch real-time web results via DuckDuckGo HTML endpoint without rate-limit issues."""
    url = "https://html.duckduckgo.com/html/?" + urllib.parse.urlencode({"q": query})
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    req = urllib.request.Request(url, headers=headers)
    results = []
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
            blocks = re.findall(r'<div class="result results_links results_links_deep[^"]*"[\s\S]*?</div>\s*</div>', html)
            for b in blocks[:max_results]:
                title_match = re.search(r'<a class="result__url" href="([^"]+)">([\s\S]*?)</a>', b)
                snippet_match = re.search(r'<a class="result__snippet"[^>]*>([\s\S]*?)</a>', b)
                if title_match:
                    raw_href = title_match.group(1)
                    raw_title = title_match.group(2)
                    raw_snippet = snippet_match.group(1) if snippet_match else ""
                    actual_url = raw_href
                    if "uddg=" in raw_href:
                        match = re.search(r"uddg=([^&]+)", raw_href)
                        if match:
                            actual_url = urllib.parse.unquote(match.group(1))
                    clean_title = re.sub(r"<[^>]+>", "", raw_title).strip()
                    clean_snippet = re.sub(r"<[^>]+>", "", raw_snippet).strip()
                    results.append({
                        "title": clean_title,
                        "url": actual_url,
                        "snippet": clean_snippet
                    })
    except Exception as e:
        print(f"Domain shield DDG search notice: {e}")
    return results

def extract_domain_and_keywords(input_text: str) -> tuple[str, str, str]:
    """
    Parses user input to extract (domain, clean_url, search_keywords).
    Handles phonetically transliterated slugs (e.g. utatara-paradaesa -> uttar pradesh).
    """
    clean_input = input_text.strip()
    domain = ""
    clean_url = clean_input
    
    if clean_input.startswith("http://") or clean_input.startswith("https://") or ("." in clean_input and "/" in clean_input):
        url_to_parse = clean_input if "://" in clean_input else f"https://{clean_input}"
        try:
            parsed = urllib.parse.urlparse(url_to_parse)
            domain = parsed.hostname or ""
            path = urllib.parse.unquote(parsed.path)
            
            # Remove leading language codes like /hi/, /en/
            path_clean = re.sub(r"^/(hi|en|mr|ta)/", "/", path, flags=re.I)
            
            # Convert slug hyphens/underscores to spaces
            slug_words = re.sub(r"[/_\-]+", " ", path_clean).strip()
            
            # Decode common Indic phonetic transliterations
            phonetic_subs = [
                (r"\butatara\s+paradaesa\b", "uttar pradesh"),
                (r"\braanai\s+lakasamai\s+baai\b", "rani laxmibai"),
                (r"\bsakauutai\b", "scooty"),
                (r"\byaojanaa\b", "yojana"),
                (r"\bkisaana\b", "kisan"),
                (r"\bsamman\s+nidhi\b", "samman nidhi"),
                (r"\baavaasa\b", "awas"),
                (r"\bchhatravritti\b", "scholarship"),
            ]
            decoded_slug = slug_words
            for pat, rep in phonetic_subs:
                decoded_slug = re.sub(pat, rep, decoded_slug, flags=re.I)
                
            keywords = f"{domain} {decoded_slug}".strip()
            return domain, url_to_parse, keywords
        except Exception:
            pass

    # Bare domain or raw text query
    if "." in clean_input and " " not in clean_input:
        domain = clean_input.lower()
        return domain, f"https://{domain}", domain
        
    return domain, clean_input, clean_input

def verify_domain_realtime(input_text: str, language: str = "English") -> Dict[str, Any]:
    """
    Performs real-time cyber domain safety check and government welfare authentication.
    Combines live web intelligence and LLM analysis.
    """
    domain, clean_url, keywords = extract_domain_and_keywords(input_text)
    domain_lower = domain.lower()

    # Pre-check domain classification flags
    is_official_gov = any(domain_lower.endswith(sfx) or domain_lower == sfx for sfx in OFFICIAL_SUFFIXES)
    is_known_info = any(info_domain in domain_lower for info_domain in KNOWN_INFORMATIONAL_DOMAINS)
    is_scam_tld = any(domain_lower.endswith(tld) for tld in KNOWN_SCAM_TLDS)

    # Perform real-time live search to gather up-to-date context
    search_query = keywords
    # Clean up common redundant words for cleaner search
    search_query_clean = re.sub(r"\b(hi|en|mr|ta)\b", " ", search_query, flags=re.I)
    search_query_clean = re.sub(r"\s+", " ", search_query_clean).strip()
    
    live_results = search_ddg_html(search_query_clean, max_results=5)
    
    # If initial search was sparse, attempt scheme-specific search
    if not live_results and domain:
        clean_name_query = re.sub(re.escape(domain), "", search_query_clean).strip()
        if clean_name_query:
            live_results = search_ddg_html(f"{clean_name_query} scheme", max_results=5)

    search_context = "\n".join([f"- [{r['title']}] ({r['url']}): {r['snippet']}" for r in live_results])

    # Call LLM for real-time verification analysis
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        try:
            client = Groq(api_key=api_key)
            system_prompt = f"""You are the official AmritChidiya Real-Time Cyber Domain Shield and Government Welfare Verifier.
Your job is to analyze links, domains, and WhatsApp scheme forwards with real-time web verification data.

CRITICAL RULES:
1. Status must be one of:
   - "official_gov": Verified Indian government portal (ending in .gov.in, .nic.in, or official statutory bodies like .org.in / .ac.in for Mudra, AICTE, etc.).
   - "legitimate_info": Genuine third-party informational website, aggregator, or news portal (e.g. govtschemes.in, vikaspedia.in, jagranjosh, hindustantimes, ndtv, etc.) that publishes news and guides about REAL schemes. This is NOT a scam/phishing site, but an educational guide. Citizens should be told: The scheme is genuine, this site is safe for reading information, but never pay fees or enter OTPs/passwords on third-party sites, and always apply through the official state/central government portal.
   - "scam": Phishing site, fake portal imitating government (e.g. fake .xyz, .top, sites asking for upfront registration money or OTPs, lottery fraud).

2. Real-Time Scheme Verification:
   - Check if the scheme mentioned actually exists (e.g., 'Uttar Pradesh Rani Laxmibai Scooty Yojana' is an authentic UP government initiative).
   - If the link is an informational portal (like govtschemes.in), acknowledge that the scheme is REAL and the portal is an informational guide, NOT a malicious scam.

3. Provide official alternative:
   - If the site is informational or a scam, specify the official government portal (e.g. 'https://up.gov.in' or 'https://scholarship.up.gov.in' or the relevant department) where citizens can safely check or apply.

Respond ONLY with valid JSON with this exact schema:
{{
  "status": "official_gov" | "legitimate_info" | "scam",
  "domain": string,
  "scheme_name": string,
  "is_scheme_authentic": boolean,
  "title": string,
  "summary": string,
  "official_portal_url": string or null,
  "official_portal_name": string or null,
  "safety_advice": string
}}
In the language requested: {language}.
"""

            user_msg = (
                f"Verify this URL / query in real-time:\n"
                f"Input: {input_text}\n"
                f"Domain: {domain}\n"
                f"Is Official Suffix Detected: {is_official_gov}\n"
                f"Is Known Informational Domain: {is_known_info}\n"
                f"Real-Time Web Search Results:\n{search_context or 'No live snippets found; use verified knowledge.'}"
            )

            resp = client.chat.completions.create(
                model=os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_msg}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            parsed_json = json.loads(resp.choices[0].message.content)
            return parsed_json
        except Exception as e:
            print(f"Domain shield LLM analysis error: {e}")

    # Fallback heuristic if LLM or network is unavailable
    if is_official_gov:
        return {
            "status": "official_gov",
            "domain": domain or input_text,
            "scheme_name": "Official Government Service",
            "is_scheme_authentic": True,
            "title": "Verified Official Government Portal",
            "summary": "This domain is an authentic Government of India or State Government portal (.gov.in / .nic.in). Safe to access and submit applications.",
            "official_portal_url": clean_url if clean_url.startswith("http") else f"https://{domain}",
            "official_portal_name": domain,
            "safety_advice": "Always ensure the address bar displays the official .gov.in or .nic.in domain before entering confidential documents."
        }
    elif is_known_info:
        return {
            "status": "legitimate_info",
            "domain": domain or "govtschemes.in",
            "scheme_name": "Government Welfare Scheme Guide",
            "is_scheme_authentic": True,
            "title": "Legitimate Informational Portal (Third-Party)",
            "summary": "This is a legitimate informational scheme guide portal (such as govtschemes.in). It provides verified details about government welfare schemes and is not a malicious scam.",
            "official_portal_url": "https://up.gov.in",
            "official_portal_name": "Official State / Central Government Portal",
            "safety_advice": "This website is safe for reading information. However, government schemes are 100% free; never pay any fees or enter Aadhaar OTPs on third-party websites. Always submit official applications on .gov.in portals."
        }
    elif is_scam_tld:
        return {
            "status": "scam",
            "domain": domain or input_text,
            "scheme_name": "Unverified / Suspicious Offer",
            "is_scheme_authentic": False,
            "title": "🚨 High-Risk Suspicious Portal",
            "summary": "Warning: Genuine government portals strictly use .gov.in or .nic.in domains. Domains ending in suspicious TLDs like .xyz or .top often host phishing schemes.",
            "official_portal_url": "https://www.myscheme.gov.in",
            "official_portal_name": "National myScheme Official Portal",
            "safety_advice": "Never share your Aadhaar number, OTP, or make any UPI payments on this website."
        }
    else:
        return {
            "status": "legitimate_info",
            "domain": domain or input_text,
            "scheme_name": "Third-Party Web Portal",
            "is_scheme_authentic": True,
            "title": "Informational / Unofficial Domain",
            "summary": "This is a non-governmental domain. While it may provide general information, verify all claims against official government portals.",
            "official_portal_url": "https://www.myscheme.gov.in",
            "official_portal_name": "National myScheme Portal",
            "safety_advice": "Never pay money or enter confidential credentials on non-government websites."
        }
