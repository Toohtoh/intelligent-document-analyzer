import Dashboard from "../components/Dashboard";
import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import UploadZone from "../components/UploadZone";
import ResultCard from "../components/ResultCard";
import DocumentList from "../components/DocumentList";
import { useApi } from "../services/api";

const translations = {
  fr: {
    tagline: "BY EURASTECH", upload: "Upload", result: "Résultat", history: "Historique",
    hero_badge: "Powered by Azure OpenAI GPT-4o",
    hero_title_1: "Analysez vos documents", hero_title_2: "intelligemment",
    hero_sub: "OCR précis + résumé GPT-4o + extraction d'entités en quelques secondes.",
    stat_docs: "Documents analysés", stat_model: "Modèle IA", stat_cloud: "Cloud", stat_uptime: "Uptime",
    no_result: "Aucun résultat. Uploadez un document d'abord.", analyze_doc: "Analyser un document →",
    footer_desc: "Solution d'analyse documentaire intelligente propulsée par Azure AI. Développé dans le cadre d'un stage chez Eurastech.",
    nav_title: "Navigation", tech_title: "Technologies", azure_title: "Azure",
    footer_copy: "© 2026 DocAnalyzer — Stage ISGI × Eurastech", footer_power: "Powered by Microsoft Azure",
    logout: "Déconnexion", greeting: "Bonjour",
    regen_title: "Régénérer le résumé", regen_bullet: "En points clés", regen_short: "Résumé court",
    regen_detailed: "Résumé détaillé", regen_formal: "Ton formel", regen_simple: "Langage simple",
    regen_btn: "Régénérer", regen_generating: "Génération...", dashboard: "Dashboard",
  },
  en: {
    tagline: "BY EURASTECH", upload: "Upload", result: "Result", history: "History",
    hero_badge: "Powered by Azure OpenAI GPT-4o",
    hero_title_1: "Analyze your documents", hero_title_2: "intelligently",
    hero_sub: "Precise OCR + GPT-4o summary + entity extraction in seconds.",
    stat_docs: "Documents analyzed", stat_model: "AI Model", stat_cloud: "Cloud", stat_uptime: "Uptime",
    no_result: "No results yet. Upload a document first.", analyze_doc: "Analyze a document →",
    footer_desc: "Intelligent document analysis solution powered by Azure AI. Developed as part of an internship at Eurastech.",
    nav_title: "Navigation", tech_title: "Technologies", azure_title: "Azure",
    footer_copy: "© 2026 DocAnalyzer — ISGI Internship × Eurastech", footer_power: "Powered by Microsoft Azure",
    logout: "Logout", greeting: "Hello",
    regen_title: "Regenerate Summary", regen_bullet: "Bullet points", regen_short: "Short summary",
    regen_detailed: "Detailed summary", regen_formal: "Formal tone", regen_simple: "Simple language",
    regen_btn: "Regenerate", regen_generating: "Generating...", dashboard: "Dashboard",
  },
  ar: {
    tagline: "بواسطة يوراستك", upload: "رفع", result: "النتيجة", history: "السجل",
    hero_badge: "مدعوم بـ Azure OpenAI GPT-4o",
    hero_title_1: "حلل مستنداتك", hero_title_2: "بذكاء",
    hero_sub: "OCR دقيق + ملخص GPT-4o + استخراج الكيانات في ثوانٍ.",
    stat_docs: "المستندات", stat_model: "نموذج AI", stat_cloud: "السحابة", stat_uptime: "التوفر",
    no_result: "لا توجد نتائج. قم برفع مستند أولاً.", analyze_doc: "تحليل مستند ←",
    footer_desc: "حل ذكي لتحليل المستندات مدعوم بـ Azure AI.",
    nav_title: "التنقل", tech_title: "التقنيات", azure_title: "Azure",
    footer_copy: "© 2026 DocAnalyzer — تدريب ISGI × يوراستك", footer_power: "مدعوم بـ Microsoft Azure",
    logout: "تسجيل الخروج", greeting: "مرحباً",
    regen_title: "إعادة توليد", regen_bullet: "نقاط", regen_short: "قصير",
    regen_detailed: "مفصل", regen_formal: "رسمي", regen_simple: "بسيط",
    regen_btn: "توليد", regen_generating: "جارٍ...", dashboard: "لوحة",
  },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconUpload = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconResult = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/>
  </svg>
);
const IconHistory = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconDashboard = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "1.8"} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconLogout = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const IconChevron = ({ open }) => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>);
const IconError = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);
const IconEmpty = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="11" y2="17"/></svg>);
const IconSparkle = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>);

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="10" fill="url(#lg)"/>
    <path d="M10 18C10 13.58 13.58 10 18 10C20.21 10 22.21 10.89 23.66 12.34L21.54 14.46C20.6 13.52 19.37 13 18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23C19.37 23 20.6 22.48 21.54 21.54L23.66 23.66C22.21 25.11 20.21 26 18 26C13.58 26 10 22.42 10 18Z" fill="white" fillOpacity="0.9"/>
    <circle cx="24" cy="12" r="3" fill="#67E8F9"/>
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#06B6D4"/>
      </linearGradient>
    </defs>
  </svg>
);

function RegenerateSummaryPanel({ result, lang, isDark, onNewSummary, getToken }) {
  const t = translations[lang];
  const isRTL = lang === "ar";
  const [selectedStyle, setSelectedStyle] = useState("bullet");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const styles = [
    { id: "bullet", label: t.regen_bullet }, { id: "short", label: t.regen_short },
    { id: "detailed", label: t.regen_detailed }, { id: "formal", label: t.regen_formal },
    { id: "simple", label: t.regen_simple },
  ];
  const handleRegenerate = async () => {
    if (!result?.document_id) return;
    setIsGenerating(true); setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || "https://app-docanalyzer-25eb89.azurewebsites.net"}/regenerate-summary`,
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ document_id: result.document_id, style: selectedStyle }) }
      );
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      const s = data.summary || data.new_summary || "";
      if (s) onNewSummary(s);
    } catch { setError("Regeneration failed. Please try again."); }
    setIsGenerating(false);
  };
  return (
    <div style={{ background: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)", border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`, borderRadius: "16px", padding: "20px 24px", marginTop: "16px", direction: isRTL ? "rtl" : "ltr" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <span style={{ color: "var(--indigo)" }}><IconSparkle /></span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "14px", color: "var(--indigo)" }}>{t.regen_title}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {styles.map(s => <button key={s.id} onClick={() => setSelectedStyle(s.id)} style={{ padding: "7px 14px", borderRadius: "10px", border: `1.5px solid ${selectedStyle === s.id ? "var(--indigo)" : isDark ? "rgba(255,255,255,0.1)" : "#CBD5E1"}`, background: selectedStyle === s.id ? "rgba(99,102,241,0.12)" : "transparent", color: selectedStyle === s.id ? "var(--indigo)" : "var(--text-muted)", fontSize: "13px", fontWeight: selectedStyle === s.id ? "600" : "400", fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.2s" }}>{s.label}</button>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={handleRegenerate} disabled={isGenerating} style={{ padding: "10px 24px", background: isGenerating ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, var(--indigo), #4F46E5)", border: "none", borderRadius: "10px", color: "white", cursor: isGenerating ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: "8px", boxShadow: isGenerating ? "none" : "0 4px 12px rgba(99,102,241,0.3)" }}>
          {isGenerating ? <><span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />{t.regen_generating}</> : <><IconSparkle />{t.regen_btn}</>}
        </button>
        {error && <span style={{ fontSize: "12px", color: "#F43F5E" }}>{error}</span>}
      </div>
    </div>
  );
}

function ResultTabContent({ result, setResult, isDark, lang, getToken }) {
  const t = translations[lang];
  const [showRegen, setShowRegen] = useState(false);
  const handleNewSummary = (s) => { setResult(prev => ({ ...prev, ai_analysis: { ...prev.ai_analysis, summary: s } })); setShowRegen(false); };
  if (!result) return (
    <div style={{ textAlign: "center", padding: "80px 32px", background: "var(--navy-card)", border: "1px solid var(--navy-border)", borderRadius: "20px" }}>
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}><IconEmpty /></div>
      <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>{t.no_result}</p>
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <button onClick={() => setShowRegen(!showRegen)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", border: `1.5px solid ${showRegen ? "var(--indigo)" : isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1"}`, background: showRegen ? "rgba(99,102,241,0.1)" : isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC", color: showRegen ? "var(--indigo)" : "var(--text-muted)", fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.2s" }}>
          <IconSparkle /> {t.regen_title}
        </button>
      </div>
      {showRegen && <RegenerateSummaryPanel result={result} lang={lang} isDark={isDark} onNewSummary={handleNewSummary} getToken={getToken} />}
      <ResultCard result={result} isDark={isDark} lang={lang} />
    </div>
  );
}

export default function Home() {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState("fr");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { uploadAndAnalyze, listDocuments, getDocument, deleteDocument } = useApi();

  const t = translations[lang];
  const isRTL = lang === "ar";
  const sidePad = "clamp(16px, 4vw, 64px)";
  const maxW = "1280px";

  useEffect(() => { fetchDocuments(); }, []);
  useEffect(() => { document.body.classList.toggle("light", !isDark); }, [isDark]);
  useEffect(() => {
    const h = (e) => { if (!e.target.closest("#user-menu-container")) setShowUserMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchDocuments = async () => { try { const d = await listDocuments(); setDocuments(d.documents || []); } catch (e) { console.error(e); } };
  const handleUpload = async (file) => { setIsLoading(true); setError(null); setResult(null); try { const d = await uploadAndAnalyze(file); setResult(d); setActiveTab("result"); fetchDocuments(); } catch (e) { setError(e.message); } setIsLoading(false); };
  const handleSelectDocument = async (id) => { try { const d = await getDocument(id); setResult(d); setActiveTab("result"); } catch (e) { setError(e.message); } };
  const handleDeleteDocument = async (id) => { try { await deleteDocument(id); fetchDocuments(); if (result?.document_id === id) setResult(null); } catch (e) { alert("Erreur: " + e.message); } };
  const getUserInitials = () => { if (user?.name) return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2); return user?.email?.[0]?.toUpperCase() || "U"; };

  const tabs = [
    { id: "upload",    label: t.upload,    icon: (a) => <IconUpload active={a} />    },
    { id: "result",    label: t.result,    icon: (a) => <IconResult active={a} />    },
    { id: "history",   label: `${t.history} (${documents.length})`, icon: (a) => <IconHistory active={a} /> },
    { id: "dashboard", label: t.dashboard, icon: (a) => <IconDashboard active={a} /> },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", width: "100%", background: "var(--navy)", transition: "background 0.3s, color 0.3s", paddingBottom: "72px" }}>

      {isDark && (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundImage: `radial-gradient(circle at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)`, pointerEvents: "none" }} />
      )}

      {/* ── TOP NAVBAR — logo + lang + toggle + user only ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: isDark ? "rgba(10,15,30,0.95)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
        height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `0 ${sidePad}`,
        transition: "all 0.3s",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <Logo />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: "800", fontSize: "16px", color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: "1.1" }}>DocAnalyzer</div>
            <div style={{ fontSize: "8px", fontWeight: "700", background: "linear-gradient(90deg, var(--indigo), var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "0.1em" }}>{t.tagline}</div>
          </div>
        </div>

        {/* Center tabs — visible on large screens only via CSS */}
        <div className="top-tabs" style={{ gap: "2px" }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px", border: "none",
                cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-body)",
                fontWeight: isActive ? "600" : "400",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                color: isActive ? "var(--indigo)" : "var(--text-muted)",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}>
                {tab.icon(isActive)}
                <span>{tab.id === "history" ? `${t.history} (${documents.length})` : tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Lang */}
          <div style={{ display: "flex", background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}`, borderRadius: "8px", padding: "2px", gap: "1px" }}>
            {["fr", "en", "ar"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "5px 9px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: "700", fontFamily: "var(--font-body)", textTransform: "uppercase", background: lang === l ? "linear-gradient(135deg, var(--indigo), #4F46E5)" : "transparent", color: lang === l ? "white" : "var(--text-muted)", transition: "all 0.2s" }}>{l}</button>
            ))}
          </div>

          {/* Dark toggle */}
          <button onClick={() => setIsDark(!isDark)} style={{ display: "flex", alignItems: "center", width: "52px", height: "28px", borderRadius: "14px", border: `1.5px solid ${isDark ? "rgba(99,102,241,0.4)" : "#CBD5E1"}`, background: isDark ? "linear-gradient(135deg, #1E1B4B, #1E3A5F)" : "linear-gradient(135deg, #FEF9C3, #FEF3C7)", cursor: "pointer", position: "relative", transition: "all 0.4s", padding: 0, overflow: "hidden", flexShrink: 0 }}>
            <div style={{ position: "absolute", left: isDark ? "26px" : "2px", top: "2px", width: "22px", height: "22px", borderRadius: "50%", background: isDark ? "linear-gradient(135deg, #C7D2FE, #818CF8)" : "linear-gradient(135deg, #FCD34D, #F59E0B)", transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "10px", lineHeight: 1 }}>{isDark ? "☾" : "☼"}</span>
            </div>
          </button>

          {/* User */}
          <div id="user-menu-container" style={{ position: "relative" }}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px 4px 4px", background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}`, borderRadius: "10px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--indigo)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}>
              {user?.picture
                ? <img src={user.picture} alt="" style={{ width: "26px", height: "26px", borderRadius: "50%", border: "2px solid var(--indigo)" }} />
                : <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg, var(--indigo), var(--cyan))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>{getUserInitials()}</div>
              }
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name?.split(" ")[0] || user?.email}</span>
              <IconChevron open={showUserMenu} />
            </button>

            {showUserMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: isRTL ? "auto" : "0", left: isRTL ? "0" : "auto", width: "220px", background: isDark ? "#0F172A" : "#FFFFFF", border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "#E2E8F0"}`, borderRadius: "14px", boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 200 }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"}` }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px" }}>{t.greeting}, {user?.name?.split(" ")[0] || "there"}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                </div>
                <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }} />
                <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: "#F87171", fontFamily: "var(--font-body)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <IconLogout />{t.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── PAGE BODY ── */}
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>

        {/* Hero */}
        {activeTab === "upload" && (
          <div style={{ width: "100%", background: "var(--navy)" }}>
            <div style={{ textAlign: "center", padding: `72px ${sidePad} 48px`, maxWidth: maxW, margin: "0 auto" }}>
              <div className="animate-fadeUp" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "20px", padding: "6px 16px", marginBottom: "32px", fontSize: "13px", color: "var(--indigo)" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "pulse-ring 2s infinite" }} />
                {t.hero_badge}
              </div>

              <h1 className="animate-fadeUp-delay-1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4.5vw, 56px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.02em", marginBottom: "20px", color: "var(--text-primary)" }}>
                {t.hero_title_1}{" "}
                <span style={{ background: "linear-gradient(90deg, var(--indigo), var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.hero_title_2}</span>
              </h1>

              <p className="animate-fadeUp-delay-2" style={{ fontSize: "17px", color: "var(--text-soft)", lineHeight: "1.7", maxWidth: "560px", margin: "0 auto 48px" }}>
                {t.hero_sub}
              </p>

              <div className="animate-fadeUp-delay-3" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "var(--navy-card)", border: "1px solid var(--navy-border)", borderRadius: "16px", marginBottom: "48px", overflow: "hidden" }}>
                {[
                  { value: documents.length || "0", label: t.stat_docs,   color: "var(--indigo)" },
                  { value: "GPT-4o",                label: t.stat_model,  color: "var(--cyan)"   },
                  { value: "Azure",                 label: t.stat_cloud,  color: "var(--green)"  },
                  { value: "99.9%",                 label: t.stat_uptime, color: "var(--amber)"  },
                ].map((stat, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "24px 12px", borderRight: i < 3 ? "1px solid var(--navy-border)" : "none" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "800", color: stat.color, whiteSpace: "nowrap" }}>{stat.value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ width: "100%", background: "var(--navy)" }}>
          <div style={{ maxWidth: maxW, margin: "0 auto", padding: activeTab === "upload" ? `0 ${sidePad} 80px` : `40px ${sidePad} 80px` }}>

            {activeTab === "upload" && (
              <div>
                <UploadZone onUpload={handleUpload} isLoading={isLoading} lang={lang} />
                {error && (
                  <div style={{ marginTop: "16px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: "12px", padding: "16px", color: "#F43F5E", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconError /> {error}
                  </div>
                )}
              </div>
            )}

            {activeTab === "result" && (
              result
                ? <ResultTabContent result={result} setResult={setResult} isDark={isDark} lang={lang} getToken={getAccessTokenSilently} />
                : (
                  <div style={{ textAlign: "center", padding: "80px 32px", background: "var(--navy-card)", border: "1px solid var(--navy-border)", borderRadius: "20px" }}>
                    <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}><IconEmpty /></div>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>{t.no_result}</p>
                    <button onClick={() => setActiveTab("upload")} style={{ marginTop: "20px", padding: "10px 24px", background: "linear-gradient(135deg, var(--indigo), #4F46E5)", border: "none", borderRadius: "10px", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "600", fontFamily: "var(--font-body)" }}>{t.analyze_doc}</button>
                  </div>
                )
            )}

            {activeTab === "history" && <DocumentList documents={documents} onSelect={handleSelectDocument} onDelete={handleDeleteDocument} lang={lang} />}
            {activeTab === "dashboard" && <Dashboard documents={documents} lang={lang} isDark={isDark} />}
          </div>
        </div>

        {/* Footer */}
        <footer style={{ width: "100%", borderTop: "1px solid var(--navy-border)", background: "var(--navy-soft)", padding: `48px ${sidePad} 32px`, transition: "all 0.3s" }}>
          <div style={{ maxWidth: maxW, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "40px", marginBottom: "40px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Logo />
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: "800", color: "var(--text-primary)", fontSize: "15px" }}>DocAnalyzer</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.7", maxWidth: "280px" }}>{t.footer_desc}</p>
              </div>
              {[
                { title: t.nav_title,   links: [t.upload, t.result, t.history] },
                { title: t.tech_title,  links: ["FastAPI", "React", "Azure OpenAI", "Cosmos DB"] },
                { title: t.azure_title, links: ["Blob Storage", "Doc Intelligence", "App Service", "Key Vault"] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>{col.title}</h4>
                  {col.links.map((link, j) => <div key={j} style={{ color: "var(--text-soft)", fontSize: "13px", marginBottom: "8px" }}>{link}</div>)}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--navy-border)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{t.footer_copy}</span>
              <span style={{ fontSize: "12px", fontWeight: "600", background: "linear-gradient(90deg, var(--indigo), var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.footer_power}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ── BOTTOM NAV BAR ── */}
      <div className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: isDark ? "rgba(10,15,30,0.97)" : "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}`,
        height: "64px",
        display: "flex", alignItems: "center",
        padding: "0 8px",
        boxShadow: isDark ? "0 -4px 24px rgba(0,0,0,0.3)" : "0 -4px 24px rgba(0,0,0,0.06)",
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "4px",
                height: "100%",
                border: "none", background: "transparent", cursor: "pointer",
                color: isActive ? "var(--indigo)" : "var(--text-muted)",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              {/* Active indicator pill at top */}
              {isActive && (
                <div style={{
                  position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                  width: "32px", height: "3px", borderRadius: "0 0 4px 4px",
                  background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
                }} />
              )}
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                transition: "all 0.2s",
              }}>
                {tab.icon(isActive)}
              </div>
              <span style={{
                fontSize: "10px", fontWeight: isActive ? "700" : "400",
                fontFamily: "var(--font-body)", lineHeight: 1,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: "64px",
              }}>
                {tab.id === "history" ? `${t.history} (${documents.length})` : tab.label}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}