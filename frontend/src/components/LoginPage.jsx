import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

const DocSVGLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="3" width="16" height="20" rx="2" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
    <rect x="9" y="7" width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.7"/>
    <rect x="9" y="11" width="10" height="1.5" rx="0.75" fill="white" fillOpacity="0.7"/>
    <rect x="9" y="15" width="6" height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
    <circle cx="23" cy="22" r="6" fill="#06b6d4" fillOpacity="0.9"/>
    <path d="M20.5 22l1.8 1.8 3-3.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    label: "PDF, DOCX, TXT, Images",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
    label: "Instant AI analysis",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    label: "Secure & private",
  },
];

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [loadingSignUp, setLoadingSignUp] = useState(false);

  const handleSignIn = async () => {
    setLoadingSignIn(true);
    await loginWithRedirect();
  };

  const handleSignUp = async () => {
    setLoadingSignUp(true);
    await loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0f1e;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Subtle mesh background */
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(139,92,246,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Grid overlay */
        .login-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .login-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 44px 40px;
          width: 90%;
          max-width: 400px;
          backdrop-filter: blur(12px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1) inset;
        }

        .logo-wrap {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
        }

        .app-name {
          color: #f8fafc;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          letter-spacing: -0.4px;
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .app-tagline {
          color: #64748b;
          font-size: 14px;
          text-align: center;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          padding: 16px;
          background: rgba(255,255,255,0.025);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .feature-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #94a3b8;
          font-size: 13.5px;
          font-weight: 500;
        }

        .feature-icon {
          color: #6366f1;
          flex-shrink: 0;
          display: flex;
        }

        .btn-primary {
          width: 100%;
          padding: 13px 20px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #fff;
          border: none;
          border-radius: 11px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 10px;
          transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          width: 100%;
          padding: 13px 20px;
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(99,102,241,0.08);
          color: #a5b4fc;
          border-color: rgba(99,102,241,0.4);
          transform: translateY(-1px);
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 12px 0;
          color: #334155;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .footer-note {
          text-align: center;
          margin-top: 20px;
          color: #334155;
          font-size: 12px;
          line-height: 1.5;
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">
          <div className="logo-wrap">
            <DocSVGLogo />
          </div>

          <h1 className="app-name">Intelligent Document<br/>Analyzer</h1>
          <p className="app-tagline">Upload documents. Get AI-powered insights instantly.</p>

          <div className="features">
            {features.map((f, i) => (
              <div className="feature-row" key={i}>
                <span className="feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={handleSignIn}
            disabled={loadingSignIn || loadingSignUp}
          >
            {loadingSignIn ? <span className="spinner" /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            )}
            {loadingSignIn ? "Redirecting..." : "Sign In"}
          </button>

          <div className="divider">or</div>

          <button
            className="btn-secondary"
            onClick={handleSignUp}
            disabled={loadingSignIn || loadingSignUp}
          >
            {loadingSignUp ? <span className="spinner" style={{borderTopColor: "#a5b4fc"}} /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            )}
            {loadingSignUp ? "Redirecting..." : "Create Account"}
          </button>

          <p className="footer-note">Secured by Auth0 · Azure-hosted · Your data stays private</p>
        </div>
      </div>
    </>
  );
}