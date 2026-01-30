import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; 

const Login = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        const { token, user } = data;
        try {
          localStorage.setItem("token", token);
          localStorage.setItem("civixUser", JSON.stringify(user));
        } catch (err) {}
        if (onLoginSuccess) onLoginSuccess(user, token);
        onNavigate("dashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      alert("Server error.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="brand">
        <div className="brand-header">
          <div className="logo-circle">C</div>
          <h1>CivixConnect</h1>
        </div>
        <p>Your Voice. Your City. Your Power.</p>
      </div>
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-desc">Sign in to access your account</p>
        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          
          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ paddingRight: "45px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center"
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
        <div className="link-btn" onClick={() => onNavigate("forgot")}>Forgot Password?</div>
        <div className="link-btn" style={{ marginTop: "10px" }} onClick={() => onNavigate("register")}>
          Don't have an account? <strong>Register now</strong>
        </div>
      </div>
    </>
  );
};
export default Login;