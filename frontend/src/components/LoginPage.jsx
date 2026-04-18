import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "24px",
        padding: "48px",
        textAlign: "center",
        maxWidth: "420px",
        width: "90%",
      }}>
        {/* Logo */}
        <div style={{
          width: "64px",
          height: "64px",
          background: "linear-gradient(135deg, #6366f1, #06b6d4)",
          borderRadius: "16px",
          margin: "0 auto 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
        }}>
          🧠
        </div>

        <h1 style={{
          color: "#fff",
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "8px",
        }}>
          Intelligent Document Analyzer
        </h1>

        <p style={{
          color: "#94a3b8",
          fontSize: "15px",
          marginBottom: "36px",
          lineHeight: "1.6",
        }}>
          Sign in to upload and analyze your documents with AI
        </p>

        <button
          onClick={() => loginWithRedirect()}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "12px",
          }}
        >
          Sign In
        </button>

        <button
          onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" }})}
          style={{
            width: "100%",
            padding: "14px 24px",
            background: "transparent",
            color: "#6366f1",
            border: "1px solid #6366f1",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}