// DocumentList.jsx

const t = {
  fr: {
    count_single: "document analysé",
    count_plural: "documents analysés",
    empty_title: "Aucun document analysé",
    empty_sub: "Uploadez votre premier document pour commencer",
    delete_confirm: (name) => `Supprimer "${name}" ?`,
  },
  en: {
    count_single: "document analyzed",
    count_plural: "documents analyzed",
    empty_title: "No documents analyzed",
    empty_sub: "Upload your first document to get started",
    delete_confirm: (name) => `Delete "${name}"?`,
  },
  ar: {
    count_single: "مستند محلل",
    count_plural: "مستندات محللة",
    empty_title: "لا توجد مستندات محللة",
    empty_sub: "قم برفع مستندك الأول للبدء",
    delete_confirm: (name) => `حذف "${name}"؟`,
  },
};

const IconFileEmpty = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="11" y2="17"/>
  </svg>
);

const IconFile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--indigo)" }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="11" y2="17"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function DocumentList({ documents, onSelect, onDelete, lang = "fr" }) {
  const text = t[lang] || t["fr"];

  if (!documents || documents.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "64px 32px",
        background: "var(--navy-card)", border: "1px solid var(--navy-border)",
        borderRadius: "20px",
      }}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
          <IconFileEmpty />
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
          {text.empty_title}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{text.empty_sub}</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "500" }}>
        {documents.length} {documents.length > 1 ? text.count_plural : text.count_single}
      </div>
      {documents.map((doc) => (
        <div
          key={doc.id}
          style={{
            background: "var(--navy-card)", border: "1px solid var(--navy-border)",
            borderRadius: "16px", padding: "18px 20px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)";
            e.currentTarget.style.background = "rgba(99,102,241,0.03)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--navy-border)";
            e.currentTarget.style.background = "var(--navy-card)";
          }}
        >
          <div onClick={() => onSelect(doc.document_id)} style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, cursor: "pointer" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))",
              border: "1px solid rgba(99,102,241,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <IconFile />
            </div>
            <div>
              <p style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "14px", marginBottom: "3px" }}>
                {doc.original_filename || doc.filename}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {new Date(doc.uploaded_at).toLocaleString(
                  lang === "fr" ? "fr-FR" : lang === "ar" ? "ar-MA" : "en-US"
                )} · {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              color: "var(--green)", borderRadius: "20px",
              padding: "3px 12px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap",
            }}>✓ {doc.status}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(text.delete_confirm(doc.original_filename || doc.filename))) {
                  onDelete(doc.document_id);
                }
              }}
              style={{
                width: "32px", height: "32px", borderRadius: "8px",
                border: "1px solid rgba(244,63,94,0.15)",
                background: "rgba(244,63,94,0.06)",
                color: "#F43F5E", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(244,63,94,0.15)";
                e.currentTarget.style.borderColor = "rgba(244,63,94,0.35)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(244,63,94,0.06)";
                e.currentTarget.style.borderColor = "rgba(244,63,94,0.15)";
              }}
            >
              <IconTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}