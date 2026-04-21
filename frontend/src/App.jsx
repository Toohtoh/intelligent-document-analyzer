import { useAuth0 } from "@auth0/auth0-react";
import Home from "./pages/Home";
import LoginPage from "./components/LoginPage";
import SharePage from "./pages/SharePage";
import "./index.css";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  // Check if current URL is a share link
  const path = window.location.pathname;
  const shareMatch = path.match(/^\/share\/(.+)$/);
  if (shareMatch) {
    return <SharePage documentId={shareMatch[1]} />;
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0f172a", color: "#6366f1",
        fontSize: "18px", fontFamily: "'DM Sans', sans-serif",
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return <Home />;
}

export default App;