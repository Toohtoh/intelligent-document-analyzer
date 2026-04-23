import { useState, useRef, useEffect } from "react";

const t = {
  fr: {
    drop: "Déposez votre document ici",
    dragging: "Déposez le fichier ici",
    browse: "ou cliquez pour parcourir — PDF, DOCX, TXT, JPEG, PNG, TIFF (max 10MB)",
    analyzing: "Analyse en cours...",
    steps: [
      { id: "upload", label: "Téléversement",  desc: "Envoi du fichier vers Azure Blob Storage..." },
      { id: "ocr",    label: "Lecture OCR",    desc: "Azure Document Intelligence extrait le texte..." },
      { id: "ai",     label: "Analyse GPT-4o", desc: "Azure OpenAI génère le résumé et les entités..." },
      { id: "save",   label: "Sauvegarde",     desc: "Résultats stockés dans Cosmos DB..." },
      { id: "done",   label: "Terminé",        desc: "Analyse complète !" },
    ],
  },
  en: {
    drop: "Drop your document here",
    dragging: "Drop the file here",
    browse: "or click to browse — PDF, DOCX, TXT, JPEG, PNG, TIFF (max 10MB)",
    analyzing: "Analyzing...",
    steps: [
      { id: "upload", label: "Uploading",       desc: "Sending file to Azure Blob Storage..." },
      { id: "ocr",    label: "OCR Reading",     desc: "Azure Document Intelligence extracting text..." },
      { id: "ai",     label: "GPT-4o Analysis", desc: "Azure OpenAI generating summary and entities..." },
      { id: "save",   label: "Saving",          desc: "Results stored in Cosmos DB..." },
      { id: "done",   label: "Done",            desc: "Analysis complete!" },
    ],
  },
  ar: {
    drop: "أسقط مستندك هنا",
    dragging: "أسقط الملف هنا",
    browse: "أو انقر للتصفح — PDF, DOCX, TXT, JPEG, PNG, TIFF (الحد الأقصى 10MB)",
    analyzing: "جارٍ التحليل...",
    steps: [
      { id: "upload", label: "رفع الملف",    desc: "إرسال الملف إلى Azure Blob Storage..." },
      { id: "ocr",    label: "استخراج النص", desc: "استخراج النص بواسطة Azure Document Intelligence..." },
      { id: "ai",     label: "تحليل GPT-4o", desc: "توليد الملخص والكيانات بواسطة Azure OpenAI..." },
      { id: "save",   label: "حفظ",          desc: "تخزين النتائج في Cosmos DB..." },
      { id: "done",   label: "اكتمل",        desc: "اكتمل التحليل!" },
    ],
  },
};

const STEP_DURATIONS = [1800, 3500, 4500, 1500, 700];

const FORMAT_BADGES = [
  { ext: "PDF",  color: "#EF4444" },
  { ext: "DOCX", color: "#3B82F6" },
  { ext: "TXT",  color: "#6366F1" },
  { ext: "JPEG", color: "#10B981" },
  { ext: "PNG",  color: "#8B5CF6" },
  { ext: "TIFF", color: "#F59E0B" },
];

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="14" fill="url(#uploadGrad)" fillOpacity="0.15"/>
    <rect width="48" height="48" rx="14" stroke="url(#uploadGrad)" strokeWidth="1" strokeOpacity="0.3"/>
    <path d="M24 32V22M24 22L19 27M24 22L29 27" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 34H32" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="uploadGrad" x1="0" y1="0" x2="48" y2="48">
        <stop stopColor="#6366F1"/>
        <stop offset="1" stopColor="#06B6D4"/>
      </linearGradient>
    </defs>
  </svg>
);

const StepIcons = {
  upload: (active) => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <path d="M8 10V4M8 4L5 7M8 4L11 7" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 12H13" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  ocr: (active) => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="2" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5"/>
      <path d="M5 6H11M5 8H9M5 10H10" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  ai: (active) => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5"/>
      <path d="M8 5V8L10 10" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  save: (active) => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <path d="M3 3H11L13 5V13H3V3Z" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="5" y="9" width="6" height="4" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5"/>
      <path d="M6 3H10V6H6V3Z" stroke={active ? "#6366F1" : "#94A3B8"} strokeWidth="1.5"/>
    </svg>
  ),
  done: (active) => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5" stroke={active ? "#10B981" : "#94A3B8"} strokeWidth="1.5"/>
      <path d="M5.5 8L7 9.5L10.5 6" stroke={active ? "#10B981" : "#94A3B8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function UploadZone({ onUpload, isLoading, lang = "fr" }) {
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepDone, setStepDone] = useState([]);
  const fileInputRef = useRef(null);
  const text = t[lang] || t["fr"];
  const isRTL = lang === "ar";

  useEffect(() => {
    if (!isLoading) { setCurrentStep(-1); setStepDone([]); return; }
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < STEP_DURATIONS.length; i++) {
        if (cancelled) return;
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, STEP_DURATIONS[i]));
        if (cancelled) return;
        setStepDone(prev => [...prev, i]);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [isLoading]);

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const totalDuration = STEP_DURATIONS.reduce((a, b) => a + b, 0);
  const progressPercent = currentStep < 0 ? 0 : Math.min(100,
    Math.round((STEP_DURATIONS.slice(0, currentStep).reduce((a, b) => a + b, 0) / totalDuration) * 100)
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current.click()}
      style={{
        width: "100%",
        border: `2px dashed ${isDragging ? "var(--indigo)" : isLoading ? "rgba(99,102,241,0.3)" : "var(--navy-border)"}`,
        borderRadius: "24px",
        /* KEY FIX: generous padding so it feels spacious */
        padding: "80px 48px",
        textAlign: "center",
        cursor: isLoading ? "default" : "pointer",
        background: isDragging ? "rgba(99,102,241,0.05)" : isLoading ? "rgba(99,102,241,0.03)" : "var(--navy-card)",
        transition: "all 0.3s", position: "relative", overflow: "hidden",
        direction: isRTL ? "rtl" : "ltr",
        boxSizing: "border-box",
      }}
    >
      {isLoading && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}

      <input
        ref={fileInputRef} type="file"
        accept=".pdf,.jpg,.jpeg,.png,.tiff,.docx,.txt"
        onChange={(e) => { const f = e.target.files[0]; if (f) onUpload(f); }}
        style={{ display: "none" }}
      />

      {isLoading ? (
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))",
            border: "1px solid rgba(99,102,241,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: "0 0 32px rgba(99,102,241,0.12)",
          }}>
            {currentStep >= 0 && currentStep < text.steps.length
              ? StepIcons[text.steps[currentStep].id]?.(true) || null : null}
          </div>

          <p style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
            {currentStep >= 0 && currentStep < text.steps.length ? text.steps[currentStep].label : text.analyzing}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "40px", minHeight: "20px" }}>
            {currentStep >= 0 && currentStep < text.steps.length ? text.steps[currentStep].desc : ""}
          </p>

          <div style={{ width: "100%", height: "6px", background: "var(--navy-border)", borderRadius: "99px", overflow: "hidden", marginBottom: "36px" }}>
            <div style={{
              height: "100%", width: `${progressPercent}%`,
              background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
              borderRadius: "99px", transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 0 8px rgba(99,102,241,0.5)",
            }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "4px" }}>
            {text.steps.map((step, i) => {
              const isDone = stepDone.includes(i);
              const isActive = currentStep === i;
              return (
                <div key={step.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", flex: 1 }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isDone ? "linear-gradient(135deg, var(--indigo), var(--cyan))" : isActive ? "rgba(99,102,241,0.15)" : "var(--navy-border)",
                    border: isActive ? "2px solid var(--indigo)" : isDone ? "none" : "2px solid transparent",
                    boxShadow: isActive ? "0 0 12px rgba(99,102,241,0.4)" : "none",
                    transition: "all 0.4s",
                  }}>
                    {isDone ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : isActive ? (
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--indigo)" }} />
                    ) : (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--text-muted)", opacity: 0.4 }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: "11px", fontWeight: isActive ? "700" : "400",
                    color: isDone ? "var(--cyan)" : isActive ? "var(--indigo)" : "var(--text-muted)",
                    textAlign: "center", lineHeight: "1.3", transition: "all 0.3s",
                  }}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          {isDragging && (
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
          )}

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
            <UploadIcon />
          </div>

          <p style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px" }}>
            {isDragging ? text.dragging : text.drop}
          </p>

          <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "32px" }}>
            {text.browse}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {FORMAT_BADGES.map((f) => (
              <span key={f.ext} style={{
                fontSize: "12px", fontWeight: "700", color: f.color,
                background: `${f.color}12`, border: `1px solid ${f.color}25`,
                borderRadius: "8px", padding: "5px 14px", letterSpacing: "0.06em",
              }}>{f.ext}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}