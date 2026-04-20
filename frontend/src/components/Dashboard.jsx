import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const t = {
  fr: {
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble de votre activité",
    total_docs: "Documents analysés",
    total_words: "Mots extraits",
    total_size: "Volume traité",
    avg_words: "Mots / document",
    recent_activity: "Activité récente",
    doc_types: "Types de documents",
    docs_per_day: "Documents par jour",
    no_data: "Aucune donnée disponible",
    upload_first: "Uploadez des documents pour voir vos statistiques",
    mb: "MB", words: "mots", docs: "docs",
  },
  en: {
    title: "Dashboard",
    subtitle: "Overview of your activity",
    total_docs: "Documents analyzed",
    total_words: "Words extracted",
    total_size: "Volume processed",
    avg_words: "Words / document",
    recent_activity: "Recent activity",
    doc_types: "Document types",
    docs_per_day: "Documents per day",
    no_data: "No data available",
    upload_first: "Upload documents to see your statistics",
    mb: "MB", words: "words", docs: "docs",
  },
  ar: {
    title: "لوحة التحكم",
    subtitle: "نظرة عامة على نشاطك",
    total_docs: "المستندات المحللة",
    total_words: "الكلمات المستخرجة",
    total_size: "الحجم المعالج",
    avg_words: "كلمات / مستند",
    recent_activity: "النشاط الأخير",
    doc_types: "أنواع المستندات",
    docs_per_day: "المستندات يومياً",
    no_data: "لا توجد بيانات",
    upload_first: "ارفع مستندات لرؤية إحصائياتك",
    mb: "MB", words: "كلمة", docs: "مستند",
  },
};

const TYPE_COLORS = {
  invoice: "#F59E0B", contract: "#6366F1", cv: "#8B5CF6",
  report: "#06B6D4", id_document: "#10B981", letter: "#EC4899", unknown: "#64748B",
};

const TYPE_ICONS = {
  invoice: "🧾", contract: "📜", cv: "👤",
  report: "📊", id_document: "🪪", letter: "📬", unknown: "❓",
};

function StatCard({ icon, label, value, color, delay = 0, isDark }) {
  return (
    <div style={{
      background: isDark ? "var(--navy-card)" : "#FFFFFF",
      border: `1px solid ${isDark ? "var(--navy-border)" : "#E2E8F0"}`,
      boxShadow: isDark ? "none" : "0 1px 8px rgba(0,0,0,0.06)",
      borderRadius: "20px", padding: "24px",
      position: "relative", overflow: "hidden",
      animation: `fadeUp 0.5s ease ${delay}s both`,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{
        width: "44px", height: "44px", borderRadius: "12px",
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "20px", marginBottom: "16px",
      }}>{icon}</div>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "28px",
        fontWeight: "800", color: "var(--text-primary)",
        letterSpacing: "-0.03em", lineHeight: "1", marginBottom: "6px",
      }}>{value}</div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: isDark ? "#0F172A" : "#FFFFFF",
      border: `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "#E2E8F0"}`,
      borderRadius: "10px", padding: "10px 14px",
      fontSize: "13px", color: "var(--text-primary)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    }}>
      <div style={{ fontWeight: "700", marginBottom: "4px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.value} {p.name}</div>
      ))}
    </div>
  );
};

export default function Dashboard({ documents, lang = "fr", isDark }) {
  const text = t[lang] || t["fr"];
  const isRTL = lang === "ar";

  const totalDocs = documents.length;
  const totalSize = documents.reduce((sum, d) => sum + (d.size_bytes || 0), 0);
  const totalWords = documents.reduce((sum, d) => sum + (d.ocr_result?.word_count || d.word_count || 0), 0);
  const avgWords = totalDocs > 0 ? Math.round(totalWords / totalDocs) : 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const docsPerDay = last7Days.map(date => ({
    date: date.slice(5),
    docs: documents.filter(d => (d.uploaded_at || d.saved_at || "").startsWith(date)).length,
  }));

  const typeCounts = documents.reduce((acc, d) => {
    const type = d.ai_result?.document_type || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(typeCounts).map(([type, count]) => ({
    name: type, value: count, color: TYPE_COLORS[type] || "#64748B",
  }));

  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.uploaded_at || b.saved_at) - new Date(a.uploaded_at || a.saved_at))
    .slice(0, 5);

  const cardStyle = {
    background: isDark ? "var(--navy-card)" : "#FFFFFF",
    border: `1px solid ${isDark ? "var(--navy-border)" : "#E2E8F0"}`,
    boxShadow: isDark ? "none" : "0 1px 8px rgba(0,0,0,0.06)",
    borderRadius: "20px", padding: "24px",
  };

  if (totalDocs === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: "80px 32px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📊</div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
          {text.no_data}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{text.upload_first}</p>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div style={{ animation: "fadeUp 0.4s ease both" }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "24px",
          fontWeight: "800", color: "var(--text-primary)",
          letterSpacing: "-0.03em", marginBottom: "4px",
        }}>{text.title}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{text.subtitle}</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <StatCard icon="📄" label={text.total_docs} value={totalDocs} color="#6366F1" delay={0.05} isDark={isDark} />
        <StatCard icon="📝" label={text.total_words} value={totalWords.toLocaleString()} color="#06B6D4" delay={0.1} isDark={isDark} />
        <StatCard icon="💾" label={text.total_size} value={`${(totalSize / 1024 / 1024).toFixed(1)} ${text.mb}`} color="#10B981" delay={0.15} isDark={isDark} />
        <StatCard icon="🧠" label={text.avg_words} value={avgWords.toLocaleString()} color="#F59E0B" delay={0.2} isDark={isDark} />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>

        {/* Area chart */}
        <div style={{ ...cardStyle, animation: "fadeUp 0.5s ease 0.25s both" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", marginBottom: "20px" }}>
            {text.docs_per_day}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={docsPerDay}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "var(--navy-border)" : "#E2E8F0"} />
              <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Area type="monotone" dataKey="docs" name={text.docs} stroke="#6366F1" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{ ...cardStyle, animation: "fadeUp 0.5s ease 0.3s both" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", marginBottom: "20px" }}>
            {text.doc_types}
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                {pieData.map((entry, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{TYPE_ICONS[entry.name]} {entry.name}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: entry.color }}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "40px 0" }}>{text.no_data}</div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div style={{ ...cardStyle, animation: "fadeUp 0.5s ease 0.35s both" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", marginBottom: "16px" }}>
          {text.recent_activity}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {recentDocs.map((doc, i) => {
            const dtype = doc.ai_result?.document_type || "unknown";
            const color = TYPE_COLORS[dtype] || "#64748B";
            const icon = TYPE_ICONS[dtype] || "❓";
            return (
              <div key={doc.id || i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px",
                background: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                border: `1px solid ${isDark ? "var(--navy-border)" : "#E2E8F0"}`,
                borderRadius: "12px", gap: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `${color}15`, border: `1px solid ${color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", flexShrink: 0,
                  }}>{icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.original_filename || doc.filename}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {new Date(doc.uploaded_at || doc.saved_at).toLocaleString(
                        lang === "fr" ? "fr-FR" : lang === "ar" ? "ar-MA" : "en-US"
                      )}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color, background: `${color}15`, border: `1px solid ${color}25`, borderRadius: "6px", padding: "2px 8px" }}>
                    {dtype}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {(doc.size_bytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}