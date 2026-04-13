import { useState, useRef } from "react";

export default function UploadZone({ onUpload, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current.click()}
      style={{
        border: `2px dashed ${isDragging ? "var(--indigo)" : "var(--navy-border)"}`,
        borderRadius: "20px", padding: "64px 32px",
        textAlign: "center",
        cursor: isLoading ? "not-allowed" : "pointer",
        background: isDragging
          ? "rgba(99,102,241,0.08)"
          : "var(--navy-card)",
        transition: "all 0.3s",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Glow effect */}
      {isDragging && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.tiff,.docx"
        onChange={(e) => { const f = e.target.files[0]; if (f) onUpload(f); }}
        style={{ display: "none" }}
      />

      {isLoading ? (
        <div>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            border: "3px solid var(--navy-border)",
            borderTop: "3px solid var(--indigo)",
            animation: "spin 1s linear infinite",
            margin: "0 auto 24px",
          }} />
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "22px",
            fontWeight: "700", color: "var(--white)", marginBottom: "8px",
          }}>Analyse en cours...</p>
          <p style={{ color: "var(--white-muted)", fontSize: "14px" }}>
            OCR + GPT-4o en train de traiter votre document
          </p>
          <div style={{
            marginTop: "24px", display: "flex",
            justifyContent: "center", gap: "16px",
          }}>
            {["📄 Lecture OCR", "🧠 Analyse IA", "💾 Sauvegarde"].map((step, i) => (
              <span key={i} style={{
                fontSize: "12px", color: "var(--indigo-light)",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "20px", padding: "4px 12px",
              }}>{step}</span>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            width: "80px", height: "80px", borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "36px", margin: "0 auto 24px",
            animation: "float 3s ease-in-out infinite",
          }}>📄</div>

          <p style={{
            fontFamily: "var(--font-display)", fontSize: "24px",
            fontWeight: "700", color: "var(--white)", marginBottom: "10px",
          }}>
            {isDragging ? "Déposez votre fichier ici" : "Déposez votre document ici"}
          </p>
          <p style={{ color: "var(--white-muted)", fontSize: "14px", marginBottom: "32px" }}>
            ou cliquez pour parcourir — PDF, JPEG, PNG, TIFF, DOCX (max 10MB)
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            {[
              { ext: "PDF", color: "#EF4444" },
              { ext: "DOCX", color: "#3B82F6" },
              { ext: "JPEG", color: "#10B981" },
              { ext: "PNG", color: "#8B5CF6" },
              { ext: "TIFF", color: "#F59E0B" },
            ].map((f) => (
              <span key={f.ext} style={{
                fontSize: "12px", fontWeight: "700",
                color: f.color, background: `${f.color}15`,
                border: `1px solid ${f.color}30`,
                borderRadius: "8px", padding: "4px 12px",
                letterSpacing: "0.05em",
              }}>{f.ext}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}