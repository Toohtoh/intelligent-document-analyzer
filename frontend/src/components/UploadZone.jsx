import { useState, useRef, useEffect } from "react";

const t = {
  fr: {
    drop: "Déposez votre document ici",
    dragging: "Déposez le fichier ici",
    browse: "ou cliquez pour parcourir — PDF, JPEG, PNG, TIFF, DOCX (max 10MB)",
    analyzing: "Analyse en cours...",
    steps: [
      { id: "upload", label: "Téléversement",     icon: "☁️", desc: "Envoi du fichier vers Azure Blob Storage..." },
      { id: "ocr",    label: "Lecture OCR",        icon: "🔍", desc: "Azure Document Intelligence extrait le texte..." },
      { id: "ai",     label: "Analyse GPT-4o",     icon: "🧠", desc: "Azure OpenAI génère le résumé et les entités..." },
      { id: "save",   label: "Sauvegarde",         icon: "💾", desc: "Résultats stockés dans Cosmos DB..." },
      { id: "done",   label: "Terminé",            icon: "✅", desc: "Analyse complète !" },
    ],
  },
  en: {
    drop: "Drop your document here",
    dragging: "Drop the file here",
    browse: "or click to browse — PDF, JPEG, PNG, TIFF, DOCX (max 10MB)",
    analyzing: "Analyzing...",
    steps: [
      { id: "upload", label: "Uploading",          icon: "☁️", desc: "Sending file to Azure Blob Storage..." },
      { id: "ocr",    label: "OCR Reading",        icon: "🔍", desc: "Azure Document Intelligence extracting text..." },
      { id: "ai",     label: "GPT-4o Analysis",    icon: "🧠", desc: "Azure OpenAI generating summary and entities..." },
      { id: "save",   label: "Saving",             icon: "💾", desc: "Results stored in Cosmos DB..." },
      { id: "done",   label: "Done",               icon: "✅", desc: "Analysis complete!" },
    ],
  },
  ar: {
    drop: "أسقط مستندك هنا",
    dragging: "أسقط الملف هنا",
    browse: "أو انقر للتصفح — PDF, JPEG, PNG, TIFF, DOCX (الحد الأقصى 10MB)",
    analyzing: "جارٍ التحليل...",
    steps: [
      { id: "upload", label: "رفع الملف",          icon: "☁️", desc: "إرسال الملف إلى Azure Blob Storage..." },
      { id: "ocr",    label: "قراءة OCR",          icon: "🔍", desc: "استخراج النص بواسطة Azure Document Intelligence..." },
      { id: "ai",     label: "تحليل GPT-4o",       icon: "🧠", desc: "توليد الملخص والكيانات بواسطة Azure OpenAI..." },
      { id: "save",   label: "حفظ",                icon: "💾", desc: "تخزين النتائج في Cosmos DB..." },
      { id: "done",   label: "اكتمل",              icon: "✅", desc: "اكتمل التحليل!" },
    ],
  },
};

// Step durations in ms — calibrated to feel realistic for ~12s total
const STEP_DURATIONS = [1800, 3500, 4500, 1500, 700];

export default function UploadZone({ onUpload, isLoading, lang = "fr" }) {
  const [isDragging, setIsDragging]   = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);   // -1 = not started
  const [stepDone, setStepDone]       = useState([]);   // array of completed step indices
  const fileInputRef = useRef(null);
  const text = t[lang] || t["fr"];
  const isRTL = lang === "ar";

  // Drive the fake progress when isLoading flips to true
  useEffect(() => {
    if (!isLoading) {
      // Reset when done
      setCurrentStep(-1);
      setStepDone([]);
      return;
    }

    let cancelled = false;
    let elapsed = 0;

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
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const totalDuration  = STEP_DURATIONS.reduce((a, b) => a + b, 0);
  const progressPercent = currentStep < 0
    ? 0
    : Math.min(
        100,
        Math.round(
          (STEP_DURATIONS.slice(0, currentStep).reduce((a, b) => a + b, 0) /
            totalDuration) * 100
        )
      );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current.click()}
      style={{
        border: `2px dashed ${isDragging ? "var(--indigo)" : isLoading ? "rgba(99,102,241,0.3)" : "var(--navy-border)"}`,
        borderRadius: "20px",
        padding: "56px 40px",
        textAlign: "center",
        cursor: isLoading ? "default" : "pointer",
        background: isDragging
          ? "rgba(99,102,241,0.05)"
          : isLoading
          ? "rgba(99,102,241,0.03)"
          : "var(--navy-card)",
        transition: "all 0.3s",
        position: "relative",
        overflow: "hidden",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* Animated shimmer behind progress bar */}
      {isLoading && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)",
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
        /* ── Progress UI ── */
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>

          {/* Spinning icon */}
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", margin: "0 auto 28px",
            boxShadow: "0 0 24px rgba(99,102,241,0.15)",
          }}>
            {currentStep >= 0 && currentStep < text.steps.length
              ? text.steps[currentStep].icon
              : "⚙️"}
          </div>

          {/* Current step label */}
          <p style={{
            fontFamily: "var(--font-display)", fontSize: "20px",
            fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px",
          }}>
            {currentStep >= 0 && currentStep < text.steps.length
              ? text.steps[currentStep].label
              : text.analyzing}
          </p>
          <p style={{
            color: "var(--text-muted)", fontSize: "13px", marginBottom: "32px",
            minHeight: "20px",
          }}>
            {currentStep >= 0 && currentStep < text.steps.length
              ? text.steps[currentStep].desc
              : ""}
          </p>

          {/* Progress bar */}
          <div style={{
            width: "100%", height: "6px",
            background: "var(--navy-border)",
            borderRadius: "99px", overflow: "hidden",
            marginBottom: "28px",
          }}>
            <div style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
              borderRadius: "99px",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 0 8px rgba(99,102,241,0.5)",
            }} />
          </div>

          {/* Step dots */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "4px",
          }}>
            {text.steps.map((step, i) => {
              const isDone    = stepDone.includes(i);
              const isActive  = currentStep === i;
              const isPending = currentStep < i;

              return (
                <div key={step.id} style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "6px",
                  flex: 1,
                }}>
                  {/* Dot */}
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px",
                    background: isDone
                      ? "linear-gradient(135deg, var(--indigo), var(--cyan))"
                      : isActive
                      ? "rgba(99,102,241,0.15)"
                      : "var(--navy-border)",
                    border: isActive
                      ? "2px solid var(--indigo)"
                      : isDone
                      ? "none"
                      : "2px solid transparent",
                    boxShadow: isActive ? "0 0 12px rgba(99,102,241,0.4)" : "none",
                    transition: "all 0.4s",
                    animation: isActive ? "pulse-ring 2s infinite" : "none",
                  }}>
                    {isDone ? "✓" : isActive ? (
                      <div style={{
                        width: "10px", height: "10px", borderRadius: "50%",
                        background: "var(--indigo)",
                      }} />
                    ) : (
                      <div style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: "var(--text-muted)", opacity: 0.4,
                      }} />
                    )}
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: "10px", fontWeight: isActive ? "700" : "400",
                    color: isDone
                      ? "var(--cyan)"
                      : isActive
                      ? "var(--indigo)"
                      : "var(--text-muted)",
                    textAlign: "center", lineHeight: "1.3",
                    transition: "all 0.3s",
                  }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Default drop UI ── */
        <div>
          {isDragging && (
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle at center, rgba(99,102,241,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
          )}
          <div style={{
            width: "80px", height: "80px", borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))",
            border: "1px solid rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "36px", margin: "0 auto 24px",
            animation: "float 3s ease-in-out infinite",
          }}>📄</div>

          <p style={{
            fontFamily: "var(--font-display)", fontSize: "22px",
            fontWeight: "700", color: "var(--text-primary)", marginBottom: "10px",
          }}>{isDragging ? text.dragging : text.drop}</p>

          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "28px" }}>
            {text.browse}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
            {[
              { ext: "PDF",  color: "#EF4444" },
              { ext: "DOCX", color: "#3B82F6" },
              { ext: "JPEG", color: "#10B981" },
              { ext: "PNG",  color: "#8B5CF6" },
              { ext: "TIFF", color: "#F59E0B" },
            ].map((f) => (
              <span key={f.ext} style={{
                fontSize: "11px", fontWeight: "700", color: f.color,
                background: `${f.color}12`, border: `1px solid ${f.color}25`,
                borderRadius: "6px", padding: "3px 10px", letterSpacing: "0.06em",
              }}>{f.ext}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}