import { useAuth0 } from "@auth0/auth0-react";

export default function UserMenu() {
  const { user, logout } = useAuth0();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}>
      <img
        src={user?.picture}
        alt={user?.name}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "2px solid #6366f1",
        }}
      />
      <span style={{ color: "#e2e8f0", fontSize: "14px" }}>
        {user?.email}
      </span>
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin }})}
        style={{
          padding: "8px 16px",
          background: "transparent",
          color: "#f87171",
          border: "1px solid #f87171",
          borderRadius: "8px",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}