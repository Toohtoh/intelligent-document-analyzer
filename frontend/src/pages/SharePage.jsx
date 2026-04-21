import { useState, useEffect } from "react";
import ResultCard from "../components/ResultCard";

const API_BASE_URL = process.env.REACT_APP_API_URL ||
  "https://app-docanalyzer-25eb89.azurewebsites.net/api/v1";

export default function SharePage({ documentId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/share/${documentId}`);
        if (!response.ok) throw new Error("Document not found");
        const data = await response.json();
        setResult(data);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchDoc();
  }, [documentId]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F1F5F9",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <nav style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #E2E8F0",
        padding: "0 48px",
        height: "64px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #6366F1, #06B6D4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
          }}>C</div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "17px", color: "#0F172A", letterSpacing: "-0.03em" }}>
              DocAnalyzer
            </div>
            <div style={{ fontSize: "9px", fontWeight: "700", color: "#6366F1", letterSpacing: "0.1em" }}>
              BY EURASTECH
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#6366F1", borderRadius: "20px",
            padding: "5px 14px", fontSize: "12px", fontWeight: "600",
          }}>🔗 Document partagé</span>

          {/* Language switcher */}
          <div style={{
            display: "flex", alignItems: "center",
            background: "#F1F5F9", border: "1px solid #E2E8F0",
            borderRadius: "10px", padding: "3px", gap: "2px",
          }}>
            {["fr", "en", "ar"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "5px 10px", borderRadius: "7px", border: "none",
                cursor: "pointer", fontSize: "12px", fontWeight: "700",
                background: lang === l ? "linear-gradient(135deg, #6366F1, #4F46E5)" : "transparent",
                color: lang === l ? "white" : "#64748B",
                transition: "all 0.2s",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "80px", color: "#64748B" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "3px solid #E2E8F0", borderTopColor: "#6366F1",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }} />
            Chargement...
          </div>
        )}

        {error && (
          <div style={{
            textAlign: "center", padding: "80px",
            background: "#FFFFFF", borderRadius: "20px",
            border: "1px solid #E2E8F0",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", marginBottom: "8px" }}>
              Document introuvable
            </p>
            <p style={{ color: "#64748B", fontSize: "14px" }}>
              Ce lien est invalide ou le document a été supprimé.
            </p>
          </div>
        )}

        {result && !loading && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "13px", color: "#64748B" }}>
                🔗 Résultat partagé — lecture seule
              </p>
            </div>
            <ResultCard result={result} isDark={false} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}