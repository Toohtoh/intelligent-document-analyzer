import { useAuth0 } from "@auth0/auth0-react";
import Home from "./pages/Home";
import LoginPage from "./components/LoginPage";
import SharePage from "./pages/SharePage";
import "./index.css";

const LoadingScreen = () => (
  <>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#0a0f1e",
      fontFamily: "'DM Sans', sans-serif",
      gap: "20px",
      animation: "fadeIn 0.3s ease",
    }}>
      {/* Logo mark */}
      <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
        <rect width="36" height="36" rx="10" fill="url(#loadGrad)"/>
        <path d="M10 18C10 13.58 13.58 10 18 10C20.21 10 22.21 10.89 23.66 12.34L21.54 14.46C20.6 13.52 19.37 13 18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23C19.37 23 20.6 22.48 21.54 21.54L23.66 23.66C22.21 25.11 20.21 26 18 26C13.58 26 10 22.42 10 18Z" fill="white" fillOpacity="0.9"/>
        <circle cx="24" cy="12" r="3" fill="#67E8F9"/>
        <defs>
          <linearGradient id="loadGrad" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#6366F1"/>
            <stop offset="100%" stopColor="#06B6D4"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Spinner */}
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        border: "3px solid rgba(99,102,241,0.15)",
        borderTopColor: "#6366f1",
        animation: "spin 0.7s linear infinite",
      }} />

      <span style={{ color: "#475569", fontSize: "13px", fontWeight: "500", letterSpacing: "0.04em" }}>
        DocAnalyzer
      </span>
    </div>
  </>
);

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  const path = window.location.pathname;
  const shareMatch = path.match(/^\/share\/(.+)$/);
  if (shareMatch) return <SharePage documentId={shareMatch[1]} />;

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <LoginPage />;

  return <Home />;
}

export default App;