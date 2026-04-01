import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// =============================
// Paid Success Page
// =============================
function PaidSuccessPage() {
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      return;
    }

    const exchangeToken = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/paid-success?session_id=${sessionId}`);
        const data = await res.json();

        if (data.success) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("companyId", data.companyId);
          localStorage.setItem("role", data.role);
          setStatus("success");
          setTimeout(() => navigate("/onboarding"), 1500);
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    exchangeToken();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0f0f17", border: "1px solid #1e1e2e", borderRadius: 12, padding: "40px 36px", width: "100%", maxWidth: 400, textAlign: "center" }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Setting up your account...</div>
            <div style={{ fontSize: 13, color: "#555577" }}>Just a moment while we confirm your payment.</div>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Payment successful!</div>
            <div style={{ fontSize: 13, color: "#555577" }}>Redirecting you to onboarding...</div>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: 32, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 13, color: "#555577", marginBottom: 20 }}>Your payment went through but we had trouble setting up your account. Please contact support.</div>
            <a href="mailto:jacksonjallen26@gmail.com" className="btn btn-primary" style={{ justifyContent: "center" }}>Contact Support</a>
          </>
        )}
      </div>
    </div>
  );
}

export default PaidSuccessPage;