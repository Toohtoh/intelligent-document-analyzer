export default function DocumentList({ documents, onSelect, onDelete }) {
  if (!documents || documents.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "64px 32px",
        background: "var(--navy-card)", border: "1px solid var(--navy-border)",
        borderRadius: "20px",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
        <p style={{
          fontFamily: "var(--font-display)", fontSize: "18px",
          fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px",
        }}>Aucun document analysé</p>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Uploadez votre premier document pour commencer
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{
        fontSize: "13px", color: "var(--text-muted)",
        marginBottom: "8px", fontWeight: "500",
      }}>
        {documents.length} document{documents.length > 1 ? "s" : ""} analysé{documents.length > 1 ? "s" : ""}
      </div>

      {documents.map((doc) => (
        <div
          key={doc.id}
          style={{
            background: "var(--navy-card)", border: "1px solid var(--navy-border)",
            borderRadius: "16px", padding: "20px 24px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
            e.currentTarget.style.background = "rgba(99,102,241,0.05)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--navy-border)";
            e.currentTarget.style.background = "var(--navy-card)";
          }}
        >
          {/* Left — clickable area */}
          <div
            onClick={() => onSelect(doc.document_id)}
            style={{
              display: "flex", alignItems: "center",
              gap: "16px", flex: 1, cursor: "pointer",
            }}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", flexShrink: 0,
            }}>📄</div>
            <div>
              <p style={{
                fontWeight: "600", color: "var(--text-primary)",
                fontSize: "15px", marginBottom: "4px",
              }}>{doc.original_filename || doc.filename}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {new Date(doc.uploaded_at).toLocaleString("fr-FR")} · {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Right — status + delete */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "var(--green)", borderRadius: "20px",
              padding: "4px 14px", fontSize: "12px", fontWeight: "600",
              whiteSpace: "nowrap",
            }}>✓ {doc.status}</span>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Supprimer "${doc.original_filename || doc.filename}" ?`)) {
                  onDelete(doc.document_id);
                }
              }}
              style={{
                width: "34px", height: "34px", borderRadius: "8px",
                border: "1px solid rgba(244,63,94,0.2)",
                background: "rgba(244,63,94,0.08)",
                color: "#FB7185", cursor: "pointer",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "14px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(244,63,94,0.2)";
                e.currentTarget.style.borderColor = "rgba(244,63,94,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(244,63,94,0.08)";
                e.currentTarget.style.borderColor = "rgba(244,63,94,0.2)";
              }}
              title="Supprimer"
            >🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}