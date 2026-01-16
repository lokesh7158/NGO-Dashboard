import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", { name, email, password, role });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "40px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #141928 0%, #1a2244 100%)",
          border: "1px solid #2d3561",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "32px",
              background: "linear-gradient(135deg, #00d4ff 0%, #00f0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "#7a8ab3", margin: "0", fontSize: "14px" }}>
            Join us today
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "#3d2d2d",
              color: "#ff6b6b",
              borderRadius: "6px",
              border: "1px solid #ff6b6b40",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            style={{
              padding: "12px 16px",
              fontSize: "16px",
            }}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            style={{
              padding: "12px 16px",
              fontSize: "16px",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            style={{
              padding: "12px 16px",
              fontSize: "16px",
            }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: "12px 16px",
              fontSize: "16px",
              backgroundColor: "#1a1f3a",
              color: "#ffffff",
              border: "1px solid #2d3561",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: "12px",
            fontSize: "16px",
            fontWeight: "600",
            background: "linear-gradient(135deg, #00d4ff 0%, #00a8d8 100%)",
            color: "#0a0e27",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
          }}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "16px",
            fontWeight: "600",
            background: "transparent",
            color: "#00d4ff",
            border: "2px solid #00d4ff",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#00d4ff20";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default Register;
