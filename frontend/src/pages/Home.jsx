import { useState, useEffect } from "react";
import UploadZone from "../components/UploadZone";
import ResultCard from "../components/ResultCard";
import DocumentList from "../components/DocumentList";
import { uploadAndAnalyze, listDocuments, getDocument, deleteDocument } from "../services/api";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => { fetchDocuments(); }, []);

  useEffect(() => {
    document.body.classList.toggle("light", !isDark);
  }, [isDark]);

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

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)", transition: "all 0.3s" }}>

      {/* Background grid */}
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

      {/* Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: isDark ? "rgba(10,15,30,0.85)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--navy-border)",
        padding: "0 32px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", height: "64px",
        transition: "all 0.3s",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, var(--indigo), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", animation: "float 3s ease-in-out infinite",
          }}>🧠</div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: "700",
            fontSize: "18px", color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>DocAnalyzer</span>
          <span style={{
            fontSize: "10px", fontWeight: "600",
            background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "0.1em", marginLeft: "4px",
          }}>BY EURASTECH</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[
            { id: "upload", label: "Upload" },
            { id: "result", label: "Résultat" },
            { id: "history", label: `Historique (${documents.length})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 16px", borderRadius: "8px", border: "none",
              cursor: "pointer", fontSize: "14px", fontFamily: "var(--font-body)",
              fontWeight: activeTab === tab.id ? "600" : "400",
              background: activeTab === tab.id ? "rgba(99,102,241,0.15)" : "transparent",
              color: activeTab === tab.id ? "var(--indigo-light)" : "var(--text-muted)",
              transition: "all 0.2s",
            }}>{tab.label}</button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Dark/Light Toggle — improved */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Mode clair" : "Mode sombre"}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 14px", borderRadius: "20px",
              border: "1px solid var(--navy-border)",
              background: "var(--navy-card)",
              cursor: "pointer", transition: "all 0.3s",
              fontSize: "13px", fontWeight: "600",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--indigo)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--navy-border)"}
          >
            <span style={{
              width: "18px", height: "18px", borderRadius: "50%",
              background: isDark
                ? "linear-gradient(135deg, #1E293B, #334155)"
                : "linear-gradient(135deg, #FCD34D, #F59E0B)",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "11px",
              boxShadow: isDark ? "none" : "0 0 8px rgba(245,158,11,0.5)",
              transition: "all 0.3s",
            }}>
              {isDark ? "🌙" : "☀️"}
            </span>
            <span>{isDark ? "Sombre" : "Clair"}</span>
          </button>

          {/* CTA */}
          <button
            onClick={() => setActiveTab("upload")}
            style={{
              padding: "9px 20px", borderRadius: "10px", border: "none",
              cursor: "pointer", fontSize: "13px", fontWeight: "600",
              fontFamily: "var(--font-body)",
              background: "linear-gradient(135deg, var(--indigo), #4F46E5)",
              color: "white",
              boxShadow: "0 0 20px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.3)"}
          >
            Analyser →
          </button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Hero */}
        {activeTab === "upload" && (
          <div style={{
            textAlign: "center", padding: "80px 24px 48px",
            maxWidth: "800px", margin: "0 auto",
          }}>
            <div className="animate-fadeUp" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "20px", padding: "6px 16px", marginBottom: "24px",
              fontSize: "13px", color: "var(--indigo-light)",
            }}>
              <span style={{
                animation: "pulse-ring 2s infinite",
                display: "inline-block", width: "8px", height: "8px",
                borderRadius: "50%", background: "var(--green)",
              }}></span>
              Powered by Azure OpenAI GPT-4o
            </div>

            <h1 className="animate-fadeUp-delay-1" style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: "800", lineHeight: "1.1",
              letterSpacing: "-0.03em", marginBottom: "20px",
              color: "var(--text-primary)",
            }}>
              Analysez vos documents{" "}
              <span style={{
                background: "linear-gradient(90deg, var(--indigo-light), var(--cyan-light))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>intelligemment</span>
            </h1>

            <p className="animate-fadeUp-delay-2" style={{
              fontSize: "18px", color: "var(--text-soft)", lineHeight: "1.6",
              marginBottom: "48px", maxWidth: "500px", margin: "0 auto 48px",
            }}>
              OCR précis + résumé GPT-4o + extraction d'entités en quelques secondes.
            </p>

            {/* Stats */}
            <div className="animate-fadeUp-delay-3" style={{
              display: "flex", justifyContent: "center",
              background: "var(--navy-card)", border: "1px solid var(--navy-border)",
              borderRadius: "16px", padding: "20px 32px", marginBottom: "40px",
              flexWrap: "wrap", gap: "0",
            }}>
              {[
                { value: documents.length || "0", label: "Documents analysés", color: "var(--indigo-light)" },
                { value: "GPT-4o", label: "Modèle IA", color: "var(--cyan)" },
                { value: "Azure", label: "Cloud provider", color: "var(--green)" },
                { value: "99.9%", label: "Disponibilité", color: "var(--amber)" },
              ].map((stat, i) => (
                <div key={i} style={{
                  textAlign: "center", padding: "0 32px",
                  borderRight: i < 3 ? "1px solid var(--navy-border)" : "none",
                }}>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "24px",
                    fontWeight: "800", color: stat.color,
                  }}>{stat.value}</div>
                  <div style={{
                    fontSize: "12px", color: "var(--text-muted)", marginTop: "2px",
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px 80px" }}>

          {activeTab === "upload" && (
            <div>
              <UploadZone onUpload={handleUpload} isLoading={isLoading} />
              {error && (
                <div style={{
                  marginTop: "16px",
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.3)",
                  borderRadius: "12px", padding: "16px",
                  color: "#FB7185", fontSize: "14px",
                }}>❌ {error}</div>
              )}
            </div>
          )}

          {activeTab === "result" && (
            result ? (
              <ResultCard result={result} isDark={isDark} />
            ) : (
              <div style={{
                textAlign: "center", padding: "80px 32px",
                background: "var(--navy-card)",
                border: "1px solid var(--navy-border)",
                borderRadius: "20px",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
                  Aucun résultat. Uploadez un document d'abord.
                </p>
                <button onClick={() => setActiveTab("upload")} style={{
                  marginTop: "20px", padding: "10px 24px",
                  background: "linear-gradient(135deg, var(--indigo), #4F46E5)",
                  border: "none", borderRadius: "10px",
                  color: "white", cursor: "pointer",
                  fontSize: "14px", fontWeight: "600",
                  fontFamily: "var(--font-body)",
                }}>Analyser un document →</button>
              </div>
            )
          )}

          {activeTab === "history" && (
            <DocumentList
              documents={documents}
              onSelect={handleSelectDocument}
              onDelete={handleDeleteDocument}
            />
          )}
        </div>

        {/* Footer */}
        <footer style={{
          borderTop: "1px solid var(--navy-border)",
          background: "var(--navy-soft)",
          padding: "48px 32px 32px",
          transition: "all 0.3s",
        }}>
          <div style={{
            maxWidth: "1000px", margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "40px", marginBottom: "40px",
          }}>
            <div>
              <div style={{
                display: "flex", alignItems: "center",
                gap: "10px", marginBottom: "16px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "linear-gradient(135deg, var(--indigo), var(--cyan))",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "16px",
                }}>🧠</div>
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: "700",
                  color: "var(--text-primary)",
                }}>DocAnalyzer</span>
              </div>
              <p style={{
                color: "var(--text-muted)", fontSize: "13px",
                lineHeight: "1.7", maxWidth: "260px",
              }}>
                Solution d'analyse documentaire intelligente propulsée par Azure AI.
                Développé dans le cadre d'un stage chez Eurastech.
              </p>
            </div>

            {[
              { title: "Navigation", links: ["Upload", "Résultats", "Historique"] },
              { title: "Technologies", links: ["FastAPI", "React", "Azure OpenAI", "Cosmos DB"] },
              { title: "Azure", links: ["Blob Storage", "Doc Intelligence", "App Service", "Key Vault"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{
                  fontFamily: "var(--font-display)", fontSize: "13px",
                  fontWeight: "700", color: "var(--text-muted)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: "16px",
                }}>{col.title}</h4>
                {col.links.map((link, j) => (
                  <div key={j} style={{
                    color: "var(--text-soft)", fontSize: "13px", marginBottom: "8px",
                  }}>{link}</div>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid var(--navy-border)",
            paddingTop: "24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              © 2026 DocAnalyzer — Stage ISGI × Eurastech
            </span>
            <span style={{
              fontSize: "12px", fontWeight: "600",
              background: "linear-gradient(90deg, var(--indigo-light), var(--cyan))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Powered by Microsoft Azure</span>
          </div>
        </footer>
      </div>
    </div>
  );
}