import { useState } from "react";
import { askQuestion } from "../services/api";
import jsPDF from "jspdf";

export default function ResultCard({ result, isDark }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [showOCR, setShowOCR] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsAsking(true);
    try {
      const res = await askQuestion(
        result.document_id,
        result.ocr_result.full_text,
        question
      );
      setAnswer(res.answer);
    } catch (e) { setAnswer("Erreur: " + e.message); }
    setIsAsking(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text("DocAnalyzer — Rapport d'analyse", margin, y);
    y += 10;

    // Separator
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Document info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fichier: ${result.original_filename}`, margin, y); y += 6;
    doc.text(`Pages: ${result.ocr_result.page_count} | Mots: ${result.ocr_result.word_count} | Taille: ${(result.size_bytes / 1024 / 1024).toFixed(2)} MB`, margin, y); y += 6;
    doc.text(`Analysé le: ${new Date(result.uploaded_at).toLocaleString("fr-FR")}`, margin, y); y += 12;

    // Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text("Résumé IA — GPT-4o", margin, y); y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const summaryLines = doc.splitTextToSize(result.ai_result.summary || "", maxWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 12;

    // Entities
    if (result.ai_result.entities) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text("Entités extraites", margin, y); y += 8;

      const entityLabels = {
        organizations: "Organisations", people: "Personnes",
        dates: "Dates", locations: "Lieux", amounts: "Montants",
      };

      Object.entries(result.ai_result.entities).forEach(([type, items]) => {
        if (!items?.length) return;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(99, 102, 241);
        doc.text(`${entityLabels[type]}:`, margin, y); y += 5;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const line = doc.splitTextToSize(items.join(", "), maxWidth);
        doc.text(line, margin, y);
        y += line.length * 5 + 4;
      });
      y += 8;
    }

    // Q&A answer if exists
    if (answer) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text("Dernière réponse Q&A", margin, y); y += 8;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Question: ${question}`, margin, y); y += 6;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const answerLines = doc.splitTextToSize(answer, maxWidth);
      doc.text(answerLines, margin, y);
      y += answerLines.length * 5 + 8;
    }

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Généré par DocAnalyzer — Powered by Azure OpenAI GPT-4o × Eurastech", margin, 285);

    doc.save(`rapport_${result.filename || "document"}.pdf`);
  };

  const entityColors = {
    organizations: { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.3)", text: "var(--indigo-light)" },
    people: { bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.3)", text: "#C084FC" },
    dates: { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", text: "#FCD34D" },
    locations: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", text: "#6EE7B7" },
    amounts: { bg: "rgba(244,63,94,0.15)", border: "rgba(244,63,94,0.3)", text: "#FDA4AF" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Header */}
      <div style={{
        background: "var(--navy-card)", border: "1px solid var(--navy-border)",
        borderRadius: "20px", padding: "24px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <div style={{
            fontSize: "12px", fontWeight: "600", color: "var(--indigo-light)",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px",
          }}>Document analysé</div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "22px",
            fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px",
          }}>{result.original_filename}</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { icon: "📄", value: `${result.ocr_result.page_count} pages` },
              { icon: "📝", value: `${result.ocr_result.word_count} mots` },
              { icon: "💾", value: `${(result.size_bytes / 1024 / 1024).toFixed(2)} MB` },
            ].map((stat, i) => (
              <span key={i} style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {stat.icon} {stat.value}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
          <span style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "var(--green)", borderRadius: "20px",
            padding: "6px 16px", fontSize: "13px", fontWeight: "600",
          }}>✓ Complété</span>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, var(--indigo), #4F46E5)",
              color: "white", cursor: "pointer",
              fontSize: "13px", fontWeight: "600",
              fontFamily: "var(--font-body)",
              boxShadow: "0 0 16px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.5)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 16px rgba(99,102,241,0.3)"}
          >
            📥 Télécharger PDF
          </button>
        </div>
      </div>

      {/* AI Summary */}
      <div style={{
        background: "var(--navy-card)", border: "1px solid var(--navy-border)",
        borderRadius: "20px", padding: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, var(--indigo), var(--cyan))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
          }}>🧠</div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: "700",
            fontSize: "15px", color: "var(--text-primary)",
          }}>Résumé IA — GPT-4o</span>
        </div>
        <p style={{
          color: "var(--text-soft)", lineHeight: "1.8", fontSize: "15px",
          borderLeft: "3px solid var(--indigo)", paddingLeft: "16px",
        }}>
          {result.ai_result.summary}
        </p>
      </div>

      {/* Entities */}
      {result.ai_result.entities && Object.keys(result.ai_result.entities).some(
        k => result.ai_result.entities[k]?.length > 0
      ) && (
        <div style={{
          background: "var(--navy-card)", border: "1px solid var(--navy-border)",
          borderRadius: "20px", padding: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
            }}>🏷️</div>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: "700",
              fontSize: "15px", color: "var(--text-primary)",
            }}>Entités extraites</span>
          </div>
          {Object.entries(entityColors).map(([type, colors]) => {
            const items = result.ai_result.entities[type];
            if (!items?.length) return null;
            const labels = {
              organizations: "Organisations", people: "Personnes",
              dates: "Dates", locations: "Lieux", amounts: "Montants",
            };
            return (
              <div key={type} style={{ marginBottom: "12px" }}>
                <div style={{
                  fontSize: "11px", fontWeight: "600", color: "var(--text-muted)",
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px",
                }}>{labels[type]}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {items.map((item, i) => (
                    <span key={i} style={{
                      background: colors.bg, border: `1px solid ${colors.border}`,
                      color: colors.text, borderRadius: "8px",
                      padding: "4px 12px", fontSize: "13px", fontWeight: "500",
                    }}>{item}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OCR Text — Collapsible */}
      <div style={{
        background: "var(--navy-card)", border: "1px solid var(--navy-border)",
        borderRadius: "20px", overflow: "hidden",
      }}>
        <button
          onClick={() => setShowOCR(!showOCR)}
          style={{
            width: "100%", padding: "20px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            background: "transparent", border: "none",
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
            }}>📝</div>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: "700",
              fontSize: "15px", color: "var(--text-primary)",
            }}>Texte extrait — OCR</span>
            <span style={{
              fontSize: "11px", color: "var(--text-muted)",
              background: "var(--navy-border)", borderRadius: "6px", padding: "2px 8px",
            }}>{result.ocr_result.word_count} mots</span>
          </div>
          <span style={{
            color: "var(--text-muted)", fontSize: "18px",
            transition: "transform 0.3s",
            transform: showOCR ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}>▼</span>
        </button>

        {showOCR && (
          <div style={{ padding: "0 24px 24px" }}>
            <pre style={{
              background: "var(--navy)", border: "1px solid var(--navy-border)",
              borderRadius: "12px", padding: "16px",
              fontSize: "12px", color: "var(--text-muted)",
              maxHeight: "220px", overflowY: "auto",
              whiteSpace: "pre-wrap",
              fontFamily: "'Courier New', monospace",
              lineHeight: "1.7",
            }}>{result.ocr_result.full_text}</pre>
          </div>
        )}
      </div>

      {/* Q&A */}
      <div style={{
        background: "var(--navy-card)", border: "1px solid var(--navy-border)",
        borderRadius: "20px", padding: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
          }}>❓</div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: "700",
            fontSize: "15px", color: "var(--text-primary)",
          }}>Questions / Réponses</span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Posez une question sur ce document..."
            style={{
              flex: 1, padding: "12px 16px",
              background: "var(--navy)", border: "1px solid var(--navy-border)",
              borderRadius: "12px", color: "var(--text-primary)",
              fontSize: "14px", fontFamily: "var(--font-body)",
              outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--indigo)"}
            onBlur={e => e.target.style.borderColor = "var(--navy-border)"}
          />
          <button
            onClick={handleAsk}
            disabled={isAsking || !question.trim()}
            style={{
              padding: "12px 24px", borderRadius: "12px", border: "none",
              background: isAsking || !question.trim()
                ? "var(--navy-border)"
                : "linear-gradient(135deg, var(--indigo), #4F46E5)",
              color: "white",
              cursor: isAsking || !question.trim() ? "not-allowed" : "pointer",
              fontSize: "14px", fontWeight: "600",
              fontFamily: "var(--font-body)", transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >{isAsking ? "..." : "Demander →"}</button>
        </div>

        {answer && (
          <div style={{
            marginTop: "16px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "12px", padding: "16px",
          }}>
            <div style={{
              fontSize: "11px", fontWeight: "600", color: "var(--indigo-light)",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px",
            }}>Réponse GPT-4o</div>
            <p style={{ color: "var(--text-soft)", lineHeight: "1.7", fontSize: "14px" }}>
              {answer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}