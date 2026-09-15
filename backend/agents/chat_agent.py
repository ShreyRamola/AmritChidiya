# backend/agents/chat_agent.py

from dotenv import load_dotenv
load_dotenv(override=True)

import os
import re
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Annotated
import operator
from pydantic import BaseModel, Field

from prompts.system_prompt import SYSTEM_PROMPT
import urllib.parse

SCHEME_URL_MAP = {
    "national scholarship portal": "https://scholarships.gov.in",
    "nsp": "https://scholarships.gov.in",
    "up post matric scholarship": "https://scholarship.up.gov.in",
    "up pre matric scholarship": "https://scholarship.up.gov.in",
    "up scholarship": "https://scholarship.up.gov.in",
    "pm kisan samman nidhi": "https://pmkisan.gov.in",
    "pm kisan": "https://pmkisan.gov.in",
    "pm vishwakarma": "https://pmvishwakarma.gov.in",
    "pm awas yojana": "https://pmaymis.gov.in",
    "pm mudra yojana": "https://www.mudra.org.in",
    "mahadbt": "https://mahadbt.maharashtra.gov.in",
    "sukanya samriddhi": "https://www.indiapost.gov.in",
    "ayushman bharat": "https://pmjay.gov.in",
    "pm-jay": "https://pmjay.gov.in",
    "e-shram": "https://eshram.gov.in",
    "pm svanidhi": "https://pmsvanidhi.mohua.gov.in",
    "pm yashasvi": "https://yet.nta.ac.in",
    "begum hazrat mahal": "https://bhmns-medu.gov.in",
    "aicte pragati": "https://www.aicte-india.org/schemes/students-development-schemes",
    "naps": "https://www.apprenticeshipindia.gov.in",
    "medhasoft": "https://medhasoft.bih.nic.in",
    "mp scholarship": "https://scholarshipportal.mp.nic.in",
}

def resolve_scheme_url(scheme_name: str, extracted_url: str = None) -> str:
    if extracted_url and (extracted_url.startswith("http://") or extracted_url.startswith("https://")):
        return extracted_url
    clean_lower = scheme_name.lower().strip()
    for key, url in SCHEME_URL_MAP.items():
        if key in clean_lower:
            return url
    return f"https://www.myscheme.gov.in/search?q={urllib.parse.quote(scheme_name)}"

class Scheme(BaseModel):
    name: str = Field(description="The exact name of the specific scheme or scholarship (e.g. 'Post Matric Scholarship for Minorities'). DO NOT use generic portal names like 'National Scholarship Portal' or 'NSP'.")
    eligibility_match: str = Field(description="Eligibility match percentage or reason (e.g. '87% match' or 'Eligible based on income')")
    apply_url: Optional[str] = Field(default=None, description="Official application site URL (e.g. 'https://scholarship.up.gov.in')")

class AgentResponse(BaseModel):
    message: str = Field(description="Your conversational response in the selected language")
    schemes: List[Scheme] = Field(default_factory=list, description="Any specific government schemes you are suggesting or discussing. Empty list if none.")


# ── State definition ────────────────────────────────────────────────────────
class AgentState(TypedDict):
    messages: Annotated[List, operator.add]
    user_context: dict


# ── LLM setup ───────────────────────────────────────────────────────────────
def get_llm(model_name: str = None):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    if not model_name:
        model_name = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    return ChatGroq(
        model=model_name,
        temperature=0.5,
        api_key=api_key,
        max_tokens=750
    )


# ── Helper for instant scheme extraction from response text ────────────────
def extract_schemes_from_text(text: str) -> list:
    schemes = []
    
    # If the response is in the profile intake phase asking questions, do NOT extract schemes
    intake_indicators = ["in sawalon", "jawaab dein", "thodi aur jankari", "jankari chahiye", "quick reply suggestions", "annual income", "family background", "main goal"]
    if any(ind in text.lower() for ind in intake_indicators) and "###" not in text:
        return []

    # Extract schemes from explicit scheme headers or numbered scheme items
    raw_matches = re.findall(r'###\s*(?:\d+\.\s*)?\*\*(.*?)\*\*', text)
    if not raw_matches:
        raw_matches = re.findall(r'\*\*\d+\.\s*(.*?)\*\*', text)
    
    ignore_terms = {
        "scholarship", "scholarships", "scheme", "schemes", "yojana", "grant", "portal",
        "up ke students ke liye specific scholarships", "national scholarship portal", "nsp",
        "quick reply suggestions", "annual income", "family background", "main goal", "age", "state"
    }

    seen = set()
    for m in raw_matches:
        extracted_url = None
        # Check if matched text contains markdown link [Name](URL)
        link_match = re.search(r'\[(.*?)\]\((https?://[^\s)]+)\)', m)
        if link_match:
            clean_name = link_match.group(1)
            extracted_url = link_match.group(2)
        else:
            clean_name = m

        clean_name = re.sub(r'[\U00010000-\U0010ffff\u2600-\u26FF\u2700-\u27BF]', '', clean_name).strip()
        clean_name = re.sub(r'^\d+\.\s*', '', clean_name).strip()
        clean_name = clean_name.rstrip('*').rstrip(':').strip()
        
        if (clean_name 
            and clean_name.lower() not in seen 
            and clean_name.lower() not in ignore_terms
            and not any(phrase in clean_name.lower() for phrase in ["sawalon", "jawaab", "suggestions", "income", "background", "question"])
            and 4 < len(clean_name) < 90):
            seen.add(clean_name.lower())
            schemes.append({
                'name': clean_name,
                'eligibility_match': '100% ELIGIBLE - MATCHED PROFILE',
                'apply_url': resolve_scheme_url(clean_name, extracted_url)
            })
    return schemes



# ── Convert raw dicts → LangChain message objects ───────────────────────────
def _to_lc_messages(raw_messages: list, user_context: dict) -> list:
    language = user_context.get("language", "English") if user_context else "English"
    formatted_prompt = SYSTEM_PROMPT.format(language=language)
    result = [SystemMessage(content=formatted_prompt)]
    for m in raw_messages:
        role = m.get("role") if isinstance(m, dict) else m.role
        content = m.get("content") if isinstance(m, dict) else m.content
        if role == "user":
            result.append(HumanMessage(content=content))
        elif role == "assistant":
            result.append(AIMessage(content=content))
    return result


def llm_node(state: AgentState) -> dict:
    llm = get_llm()
    lc_messages = _to_lc_messages(state["messages"], state.get("user_context", {}))
    
    message_content = ""
    schemes_data = []

    try:
        # Fast direct generation
        res = llm.invoke(lc_messages)
        message_content = res.content if hasattr(res, "content") else str(res)
        
        # Extract schemes from text
        schemes_data = extract_schemes_from_text(message_content)

        # If no schemes extracted, try structured parsing
        if not schemes_data:
            try:
                structured_llm = llm.with_structured_output(AgentResponse)
                response_obj = structured_llm.invoke(lc_messages)
                if response_obj and response_obj.schemes:
                    schemes_data = [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in response_obj.schemes]
            except Exception as s_err:
                print(f"Structured fallback skipped: {s_err}")
                
    except Exception as e:
        print(f"LLM generation failed, attempting candidate models: {repr(e)}")
        candidate_models = ["openai/gpt-oss-120b", "groq/compound-mini"]
        for cand in candidate_models:
            try:
                cand_llm = get_llm(model_name=cand)
                fallback_response = cand_llm.invoke(lc_messages)
                message_content = fallback_response.content if hasattr(fallback_response, "content") else str(fallback_response)
                schemes_data = extract_schemes_from_text(message_content)
                break
            except Exception as cand_err:
                print(f"Candidate model {cand} failed: {repr(cand_err)}")

    if not message_content:
        message_content = "Namaste! 🙏 Technical issue aa gaya hai. Kripya thodi der baad dobara try karein."

    msg = AIMessage(
        content=message_content,
        additional_kwargs={"schemes": schemes_data}
    )
    return {"messages": [msg]}


# ── Build the LangGraph ──────────────────────────────────────────────────────
def build_agent():
    graph = StateGraph(AgentState)
    graph.add_node("llm", llm_node)
    graph.set_entry_point("llm")
    graph.add_edge("llm", END)
    return graph.compile()


# This is what main.py imports and calls .invoke() on
chat_agent = build_agent()