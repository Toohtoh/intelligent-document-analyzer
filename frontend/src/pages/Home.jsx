import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import UploadZone from "../components/UploadZone";
import ResultCard from "../components/ResultCard";
import DocumentList from "../components/DocumentList";
import { useApi } from "../services/api";

const translations = {
  fr: {
    tagline: "BY EURASTECH",
    upload: "Upload",
    result: "Résultat",
    history: "Historique",
    analyze: "Analyser →",
    hero_badge: "Powered by Azure OpenAI GPT-4o",
    hero_title_1: "Analysez vos documents",
    hero_title_2: "intelligemment",
    hero_sub: "OCR précis + résumé GPT-4o + extraction d'entités en quelques secondes.",
    stat_docs: "Documents analysés",
    stat_model: "Modèle IA",
    stat_cloud: "Cloud provider",
    stat_uptime: "Disponibilité",
    no_result: "Aucun résultat. Uploadez un document d'abord.",
    analyze_doc: "Analyser un document →",
    footer_desc: "Solution d'analyse documentaire intelligente propulsée par Azure AI. Développé dans le cadre d'un stage chez Eurastech.",
    nav_title: "Navigation",
    tech_title: "Technologies",
    azure_title: "Azure",
    footer_copy: "© 2026 DocAnalyzer — Stage ISGI × Eurastech",
    footer_power: "Powered by Microsoft Azure",
    error_upload: "Erreur lors du téléversement",
    logout: "Déconnexion",
    greeting: "Bonjour",
    regen_title: "Régénérer le résumé",
    regen_bullet: "En points clés",
    regen_short: "Résumé court",
    regen_detailed: "Résumé détaillé",
    regen_formal: "Ton formel",
    regen_simple: "Langage simple",
    regen_btn: "Régénérer",
    regen_generating: "Génération...",
  },
  en: {
    tagline: "BY EURASTECH",
    upload: "Upload",
    result: "Result",
    history: "History",
    analyze: "Analyze →",
    hero_badge: "Powered by Azure OpenAI GPT-4o",
    hero_title_1: "Analyze your documents",
    hero_title_2: "intelligently",
    hero_sub: "Precise OCR + GPT-4o summary + entity extraction in seconds.",
    stat_docs: "Documents analyzed",
    stat_model: "AI Model",
    stat_cloud: "Cloud provider",
    stat_uptime: "Availability",
    no_result: "No results yet. Upload a document first.",
    analyze_doc: "Analyze a document →",
    footer_desc: "Intelligent document analysis solution powered by Azure AI. Developed as part of an internship at Eurastech.",
    nav_title: "Navigation",
    tech_title: "Technologies",
    azure_title: "Azure",
    footer_copy: "© 2026 DocAnalyzer — ISGI Internship × Eurastech",
    footer_power: "Powered by Microsoft Azure",
    error_upload: "Upload error",
    logout: "Logout",
    greeting: "Hello",
    regen_title: "Regenerate Summary",
    regen_bullet: "Bullet points",
    regen_short: "Short summary",
    regen_detailed: "Detailed summary",
    regen_formal: "Formal tone",
    regen_simple: "Simple language",
    regen_btn: "Regenerate",
    regen_generating: "Generating...",
  },
  ar: {
    tagline: "بواسطة يوراستك",
    upload: "رفع",
    result: "النتيجة",
    history: "السجل",
    analyze: "تحليل ←",
    hero_badge: "مدعوم بـ Azure OpenAI GPT-4o",
    hero_title_1: "حلل مستنداتك",
    hero_title_2: "بذكاء",
    hero_sub: "OCR دقيق + ملخص GPT-4o + استخراج الكيانات في ثوانٍ.",
    stat_docs: "المستندات المحللة",
    stat_model: "نموذج الذكاء الاصطناعي",
    stat_cloud: "مزود السحابة",
    stat_uptime: "التوفر",
    no_result: "لا توجد نتائج. قم برفع مستند أولاً.",
    analyze_doc: "تحليل مستند ←",
    footer_desc: "حل ذكي لتحليل المستندات مدعوم بـ Azure AI. تم تطويره في إطار تدريب في يوراستك.",
    nav_title: "التنقل",
    tech_title: "التقنيات",
    azure_title: "Azure",
    footer_copy: "© 2026 DocAnalyzer — تدريب ISGI × يوراستك",
    footer_power: "مدعوم بـ Microsoft Azure",
    error_upload: "خطأ في الرفع",
    logout: "تسجيل الخروج",
    greeting: "مرحباً",
    regen_title: "إعادة توليد الملخص",
    regen_bullet: "نقاط رئيسية",
    regen_short: "ملخص قصير",
    regen_detailed: "ملخص مفصل",
    regen_formal: "أسلوب رسمي",
    regen_simple: "لغة بسيطة",
    regen_btn: "إعادة توليد",
    regen_generating: "جارٍ التوليد...",
  },
};

// ─── Regenerate Summary Panel ────────────────────────────────────────────────
function RegenerateSummaryPanel({ result, lang, isDark, onNewSummary }) {
  const t = translations[lang];
  const isRTL = lang === "ar";
  const [selectedStyle, setSelectedStyle] = useState("bullet");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const styles = [
    { id: "bullet",   icon: "•••", label: t.regen_bullet },
    { id: "short",    icon: "─",   label: t.regen_short },
    { id: "detailed", icon: "≡",   label: t.regen_detailed },
    { id: "formal",   icon: "▣",   label: t.regen_formal },
    { id: "simple",   icon: "◎",   label: t.regen_simple },
  ];

  const stylePrompts = {
    bullet:   "Rewrite the summary as a concise bullet-point list. Use • for each point. No intro sentence.",
    short:    "Rewrite the summary in 2-3 sentences maximum. Be extremely concise.",
    detailed: "Rewrite the summary in detail, covering all key aspects, context, and implications.",
    formal:   "Rewrite the summary in a formal, professional tone suitable for a business report.",
    simple:   "Rewrite the summary using simple, everyday language as if explaining to a non-expert.",
  };

  const handleRegenerate = async () => {
    if (!result?.ai_analysis?.summary && !result?.ocr_text) return;
    setIsGenerating(true);
    setError(null);

    try {
      const originalSummary = result?.ai_analysis?.summary || "";
      const ocrSnippet = (result?.ocr_text || "").slice(0, 1500);
      const prompt = `${stylePrompts[selectedStyle]}\n\nOriginal summary:\n${originalSummary}\n\nDocument excerpt:\n${ocrSnippet}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const newSummary = data.content?.[0]?.text || "";
      if (newSummary) onNewSummary(newSummary);
    } catch (e) {
      setError("Regeneration failed. Please try again.");
    }
    setIsGenerating(false);
  };

  return (
    <div style={{
      background: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.04)",
      border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`,
      borderRadius: "16px",
      padding: "20px 24px",
      marginTop: "16px",
      direction: isRTL ? "rtl" : "ltr",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "16px",
      }}>
        <span style={{ fontSize: "16px" }}>✨</span>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: "700",
          fontSize: "14px", color: "var(--indigo)",
        }}>{t.regen_title}</span>
      </div>

      {/* Style selector */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "8px",
        marginBottom: "16px",
      }}>
        {styles.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedStyle(s.id)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "10px",
              border: `1.5px solid ${selectedStyle === s.id ? "var(--indigo)" : isDark ? "rgba(255,255,255,0.1)" : "#CBD5E1"}`,
              background: selectedStyle === s.id
                ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.08))"
                : "transparent",
              color: selectedStyle === s.id ? "var(--indigo)" : "var(--text-muted)",
              fontSize: "13px", fontWeight: selectedStyle === s.id ? "600" : "400",
              fontFamily: "var(--font-body)",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: "11px", opacity: 0.7 }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Regenerate button */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          style={{
            padding: "10px 24px",
            background: isGenerating
              ? "rgba(99,102,241,0.3)"
              : "linear-gradient(135deg, var(--indigo), #4F46E5)",
            border: "none", borderRadius: "10px",
            color: "white", cursor: isGenerating ? "not-allowed" : "pointer",
            fontSize: "13px", fontWeight: "600",
            fontFamily: "var(--font-body)",
            display: "flex", alignItems: "center", gap: "8px",
            transition: "all 0.2s",
            boxShadow: isGenerating ? "none" : "0 4px 12px rgba(99,102,241,0.3)",
          }}
        >
          {isGenerating ? (
            <>
              <span style={{
                display: "inline-block", width: "12px", height: "12px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
              {t.regen_generating}
            </>
          ) : (
            <>{t.regen_btn} ✨</>
          )}
        </button>
        {error && (
          <span style={{ fontSize: "12px", color: "#F43F5E" }}>{error}</span>
        )}
      </div>
    </div>
  );
}

// ─── Logo ────────────────────────────────────────────────────────────────────
const Logo = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="10" fill="url(#logoGrad)"/>
    <path d="M10 18C10 13.58 13.58 10 18 10C20.21 10 22.21 10.89 23.66 12.34L21.54 14.46C20.6 13.52 19.37 13 18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23C19.37 23 20.6 22.48 21.54 21.54L23.66 23.66C22.21 25.11 20.21 26 18 26C13.58 26 10 22.42 10 18Z" fill="white" fillOpacity="0.9"/>
    <circle cx="24" cy="12" r="3" fill="#67E8F9"/>
    <circle cx="24" cy="24" r="2" fill="white" fillOpacity="0.6"/>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#6366F1"/>
        <stop offset="100%" stopColor="#06B6D4"/>
      </linearGradient>
    </defs>
  </svg>
);

// ─── Result Tab with Regenerate ───────────────────────────────────────────────
function ResultTabContent({ result, setResult, isDark, lang }) {
  const t = translations[lang];
  const [showRegen, setShowRegen] = useState(false);

  const handleNewSummary = (newSummary) => {
    setResult(prev => ({
      ...prev,
      ai_analysis: {
        ...prev.ai_analysis,
        summary: newSummary,
      },
    }));
    setShowRegen(false);
  };

  if (!result) return (
    <div style={{
      textAlign: "center", padding: "80px 32px",
      background: "var(--navy-card)",
      border: "1px solid var(--navy-border)",
      borderRadius: "20px",
    }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
      <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>{t.no_result}</p>
    </div>
  );

  return (
    <div>
      {/* Regenerate toggle button */}
      <div style={{
        display: "flex", justifyContent: "flex-end",
        marginBottom: "12px",
      }}>
        <button
          onClick={() => setShowRegen(!showRegen)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "10px",
            border: `1.5px solid ${showRegen ? "var(--indigo)" : isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1"}`,
            background: showRegen
              ? "rgba(99,102,241,0.1)"
              : isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
            color: showRegen ? "var(--indigo)" : "var(--text-muted)",
            fontSize: "13px", fontWeight: "600",
            fontFamily: "var(--font-body)",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          ✨ {t.regen_title}
        </button>
      </div>

      {showRegen && (
        <RegenerateSummaryPanel
          result={result}
          lang={lang}
          isDark={isDark}
          onNewSummary={handleNewSummary}
        />
      )}

      <ResultCard result={result} isDark={isDark} lang={lang} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { user, logout } = useAuth0();
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

  useEffect(() => { fetchDocuments(); }, []);
  useEffect(() => {
    document.body.classList.toggle("light", !isDark);
  }, [isDark]);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest("#user-menu-container")) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch (e) { console.error(e); }
  };

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await uploadAndAnalyze(file);
      setResult(data);
      setActiveTab("result");
      fetchDocuments();
    } catch (e) { setError(e.message); }
    setIsLoading(false);
  };

  const handleSelectDocument = async (documentId) => {
    try {
      const data = await getDocument(documentId);
      setResult(data);
      setActiveTab("result");
    } catch (e) { setError(e.message); }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId);
      fetchDocuments();
      if (result?.document_id === documentId) setResult(null);
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Erreur lors de la suppression: " + e.message);
    }
  };

  const getUserInitials = () => {
    if (user?.name) return user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{
      minHeight: "100vh",
      background: "var(--navy)",
      transition: "all 0.3s",
    }}>

      {/* Background grid — dark mode only */}
      {isDark && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 50%),
            linear-gradient(rgba(30,42,66,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,42,66,0.4) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 100% 100%, 40px 40px, 40px 40px",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Navbar ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: isDark ? "rgba(10,15,30,0.92)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${isDark ? "rgba(30,42,66,0.8)" : "rgba(203,213,225,0.8)"}`,
        padding: "0 48px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px",
        transition: "all 0.3s",
        boxShadow: isDark ? "none" : "0 1px 12px rgba(0,0,0,0.06)",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <Logo />
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: "800",
              fontSize: "17px", color: "var(--text-primary)",
              letterSpacing: "-0.03em", lineHeight: "1.1",
            }}>DocAnalyzer</div>
            <div style={{
              fontSize: "9px", fontWeight: "700",
              background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "0.12em",
            }}>{t.tagline}</div>
          </div>
        </div>

        {/* Tabs — centered */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { id: "upload",  label: t.upload },
            { id: "result",  label: t.result },
            { id: "history", label: `${t.history} (${documents.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 18px", borderRadius: "8px", border: "none",
              cursor: "pointer", fontSize: "14px", fontFamily: "var(--font-body)",
              fontWeight: activeTab === tab.id ? "600" : "400",
              background: activeTab === tab.id ? "rgba(99,102,241,0.12)" : "transparent",
              color: activeTab === tab.id ? "var(--indigo)" : "var(--text-muted)",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>

          {/* Language Switch */}
          <div style={{
            display: "flex", alignItems: "center",
            background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}`,
            borderRadius: "10px", padding: "3px", gap: "2px",
          }}>
            {["fr", "en", "ar"].map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "5px 10px", borderRadius: "7px", border: "none",
                cursor: "pointer", fontSize: "12px", fontWeight: "700",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.05em", textTransform: "uppercase",
                background: lang === l
                  ? "linear-gradient(135deg, var(--indigo), #4F46E5)"
                  : "transparent",
                color: lang === l ? "white" : "var(--text-muted)",
                transition: "all 0.2s",
                boxShadow: lang === l ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
              }}>{l}</button>
            ))}
          </div>

          {/* Dark/Light Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              display: "flex", alignItems: "center",
              width: "60px", height: "32px", borderRadius: "16px",
              border: `1.5px solid ${isDark ? "rgba(99,102,241,0.4)" : "#CBD5E1"}`,
              background: isDark
                ? "linear-gradient(135deg, #1E1B4B, #1E3A5F)"
                : "linear-gradient(135deg, #FEF9C3, #FEF3C7)",
              cursor: "pointer", position: "relative",
              transition: "all 0.4s", padding: 0, overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              opacity: isDark ? 1 : 0, transition: "opacity 0.4s",
              background: `radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 1px, transparent 1px),
                radial-gradient(circle at 60% 70%, rgba(255,255,255,0.6) 1px, transparent 1px),
                radial-gradient(circle at 80% 20%, rgba(255,255,255,0.7) 1px, transparent 1px)`,
            }} />
            <div style={{
              position: "absolute",
              left: isDark ? "30px" : "3px", top: "3px",
              width: "24px", height: "24px", borderRadius: "50%",
              background: isDark
                ? "linear-gradient(135deg, #C7D2FE, #818CF8)"
                : "linear-gradient(135deg, #FCD34D, #F59E0B)",
              boxShadow: isDark
                ? "0 0 8px rgba(129,140,248,0.6), inset -3px -2px 0 rgba(99,102,241,0.4)"
                : "0 0 12px rgba(245,158,11,0.5)",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px",
            }}>
              {isDark ? "🌙" : "☀️"}
            </div>
          </button>

          {/* User Menu */}
          <div id="user-menu-container" style={{ position: "relative" }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "6px 12px 6px 6px",
                background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}`,
                borderRadius: "12px", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--indigo)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"}
            >
              {user?.picture ? (
                <img src={user.picture} alt={user.name} style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  border: "2px solid var(--indigo)",
                }} />
              ) : (
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--indigo), var(--cyan))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: "700", color: "white",
                }}>{getUserInitials()}</div>
              )}
              <span style={{
                fontSize: "13px", fontWeight: "500", color: "var(--text-primary)",
                maxWidth: "120px", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{user?.name || user?.email}</span>
              <span style={{
                fontSize: "10px", color: "var(--text-muted)",
                transition: "transform 0.2s",
                transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
              }}>▼</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: isRTL ? "auto" : "0",
                left: isRTL ? "0" : "auto",
                width: "240px",
                background: isDark ? "#0F172A" : "#FFFFFF",
                border: `1px solid ${isDark ? "rgba(99,102,241,0.2)" : "#E2E8F0"}`,
                borderRadius: "16px",
                boxShadow: isDark
                  ? "0 20px 40px rgba(0,0,0,0.4)"
                  : "0 20px 40px rgba(0,0,0,0.1)",
                overflow: "hidden", zIndex: 200,
              }}>
                <div style={{
                  padding: "16px",
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"}`,
                  background: isDark ? "rgba(99,102,241,0.06)" : "rgba(99,102,241,0.03)",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px" }}>
                    {t.greeting}, {user?.name?.split(" ")[0] || "there"} 👋
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email}
                  </div>
                </div>
                {[
                  { icon: "📄", label: t.upload,   action: () => { setActiveTab("upload");   setShowUserMenu(false); } },
                  { icon: "📊", label: t.result,   action: () => { setActiveTab("result");   setShowUserMenu(false); } },
                  { icon: "🕐", label: `${t.history} (${documents.length})`, action: () => { setActiveTab("history"); setShowUserMenu(false); } },
                ].map((item, i) => (
                  <button key={i} onClick={item.action} style={{
                    width: "100%", padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "transparent", border: "none",
                    cursor: "pointer", textAlign: isRTL ? "right" : "left",
                    fontSize: "13px", color: "var(--text-soft)",
                    fontFamily: "var(--font-body)", transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span>{item.icon}</span><span>{item.label}</span>
                  </button>
                ))}
                <div style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }} />
                <button
                  onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  style={{
                    width: "100%", padding: "12px 16px",
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "transparent", border: "none",
                    cursor: "pointer", textAlign: isRTL ? "right" : "left",
                    fontSize: "13px", color: "#F87171",
                    fontFamily: "var(--font-body)", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span>🚪</span><span>{t.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page Body ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Hero — upload tab only */}
        {activeTab === "upload" && (
          <div style={{
            textAlign: "center",
            padding: "48px 48px 32px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}>
            <div className="animate-fadeUp" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "20px", padding: "6px 16px", marginBottom: "24px",
              fontSize: "13px", color: "var(--indigo)",
            }}>
              <span style={{
                animation: "pulse-ring 2s infinite",
                display: "inline-block", width: "8px", height: "8px",
                borderRadius: "50%", background: "var(--green)",
              }}></span>
              {t.hero_badge}
            </div>

            <h1 className="animate-fadeUp-delay-1" style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 56px)",
              fontWeight: "800", lineHeight: "1.1",
              letterSpacing: "-0.03em", marginBottom: "20px",
              color: "var(--text-primary)",
            }}>
              {t.hero_title_1}{" "}
              <span style={{
                background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{t.hero_title_2}</span>
            </h1>

            <p className="animate-fadeUp-delay-2" style={{
              fontSize: "18px", color: "var(--text-soft)", lineHeight: "1.6",
              maxWidth: "560px", margin: "0 auto 48px",
            }}>
              {t.hero_sub}
            </p>

            {/* Stats bar — full width of content */}
            <div className="animate-fadeUp-delay-3" style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              background: "var(--navy-card)",
              border: "1px solid var(--navy-border)",
              borderRadius: "16px",
              marginBottom: "48px",
              overflow: "hidden",
            }}>
              {[
                { value: documents.length || "0", label: t.stat_docs,   color: "var(--indigo)" },
                { value: "GPT-4o",                label: t.stat_model,  color: "var(--cyan)"   },
                { value: "Azure",                 label: t.stat_cloud,  color: "var(--green)"  },
                { value: "99.9%",                 label: t.stat_uptime, color: "var(--amber)"  },
              ].map((stat, i) => (
                <div key={i} style={{
                  textAlign: "center",
                  padding: "24px 16px",
                  borderRight: i < 3 ? "1px solid var(--navy-border)" : "none",
                }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "26px",
                    fontWeight: "800", color: stat.color,
                  }}>{stat.value}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main content area ── */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: activeTab === "upload" ? "0 48px 80px" : "48px 48px 80px",
        }}>
          {activeTab === "upload" && (
            <div>
              <UploadZone onUpload={handleUpload} isLoading={isLoading} lang={lang} />
              {error && (
                <div style={{
                  marginTop: "16px",
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  borderRadius: "12px", padding: "16px",
                  color: "#F43F5E", fontSize: "14px",
                }}>❌ {error}</div>
              )}
            </div>
          )}

          {activeTab === "result" && (
            result ? (
              <ResultTabContent
                result={result}
                setResult={setResult}
                isDark={isDark}
                lang={lang}
              />
            ) : (
              <div style={{
                textAlign: "center", padding: "80px 32px",
                background: "var(--navy-card)",
                border: "1px solid var(--navy-border)",
                borderRadius: "20px",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>{t.no_result}</p>
                <button onClick={() => setActiveTab("upload")} style={{
                  marginTop: "20px", padding: "10px 24px",
                  background: "linear-gradient(135deg, var(--indigo), #4F46E5)",
                  border: "none", borderRadius: "10px",
                  color: "white", cursor: "pointer",
                  fontSize: "14px", fontWeight: "600",
                  fontFamily: "var(--font-body)",
                }}>{t.analyze_doc}</button>
              </div>
            )
          )}

          {activeTab === "history" && (
            <DocumentList
              documents={documents}
              onSelect={handleSelectDocument}
              onDelete={handleDeleteDocument}
              lang={lang}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: "1px solid var(--navy-border)",
          background: "var(--navy-soft)",
          padding: "48px 48px 32px",
          transition: "all 0.3s",
        }}>
          <div style={{
            maxWidth: "1200px", margin: "0 auto",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "40px", marginBottom: "40px",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Logo />
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: "800",
                    color: "var(--text-primary)", fontSize: "16px",
                  }}>DocAnalyzer</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.7", maxWidth: "280px" }}>
                  {t.footer_desc}
                </p>
              </div>
              {[
                { title: t.nav_title,  links: [t.upload, t.result, t.history] },
                { title: t.tech_title, links: ["FastAPI", "React", "Azure OpenAI", "Cosmos DB"] },
                { title: t.azure_title,links: ["Blob Storage", "Doc Intelligence", "App Service", "Key Vault"] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 style={{
                    fontFamily: "var(--font-display)", fontSize: "11px", fontWeight: "700",
                    color: "var(--text-muted)", letterSpacing: "0.12em",
                    textTransform: "uppercase", marginBottom: "16px",
                  }}>{col.title}</h4>
                  {col.links.map((link, j) => (
                    <div key={j} style={{ color: "var(--text-soft)", fontSize: "13px", marginBottom: "8px" }}>
                      {link}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{
              borderTop: "1px solid var(--navy-border)", paddingTop: "24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{t.footer_copy}</span>
              <span style={{
                fontSize: "12px", fontWeight: "600",
                background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{t.footer_power}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}