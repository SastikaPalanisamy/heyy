import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, FileText, BarChart3, PlusCircle, 
  LogOut, Zap, ShieldCheck, PieChart 
} from "lucide-react";

// Auth Components
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationCode from "./pages/VerificationCode";
import SetNewPassword from "./pages/SetNewPassword";

// Dashboard & Feature Components
import Dashboard from "./pages/CivixDashboard";
import PetitionsPage from "./pages/PetitionsPage";
import CreatePetition from "./pages/CreatePetition";
import PetitionDetail from "./pages/PetitionDetail";
import PollsPage from "./pages/PollsPage";
import CreatePoll from "./pages/CreatePoll";
import PollDetail from "./pages/PollDetail";

import "./Dashboard.css"; 

function App() {
  const [page, setPage] = useState("loading");
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [email, setEmail] = useState(""); 
  const [tempData, setTempData] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null); 

  useEffect(() => {
    const savedUser = localStorage.getItem("civixUser");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setPage("dashboard");
    } else {
      setPage("login");
    }
  }, []);

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('civixUser', JSON.stringify(userData));
    setUser(userData);
    setPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("civixUser");
    setUser(null);
    setPage("login");
  };

  const navigate = (targetPage, data = null) => {
    if (data) setSelectedItem(data);
    setPage(targetPage);
  };

  if (page === "loading") {
    return (
      <div className="loading-screen" style={{ background: '#020408', height: '100vh', display: 'grid', placeItems: 'center', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#3b82f6' }}>CIVIX CONNECT</h2>
          <p>Initializing Secure Portal...</p>
        </div>
      </div>
    );
  }

  const authPages = ["login", "register", "verify-reg", "set-password-reg", "forgot", "verify", "reset"];
  if (authPages.includes(page)) {
    return (
      <div className="app-root">
        {page === "login" && <Login onNavigate={setPage} onLoginSuccess={handleLoginSuccess} />}
        {page === "register" && <Register onNavigate={setPage} setEmailProp={setEmail} setTempData={setTempData} />}
        {page === "verify-reg" && <VerificationCode setPage={(p) => (p === "reset" ? setPage("set-password-reg") : setPage(p))} emailProp={email} backPage="register" />}
        {page === "set-password-reg" && <SetNewPassword setPage={setPage} emailProp={email} tempData={tempData} isRegistration={true} />}
        {page === "forgot" && <ForgotPassword setPage={setPage} setEmailProp={setEmail} />}
        {page === "verify" && <VerificationCode setPage={setPage} emailProp={email} backPage="forgot" />}
        {page === "reset" && <SetNewPassword setPage={setPage} emailProp={email} isRegistration={false} />}
      </div>
    );
  }

  return (
    <div className="civix-shell">
      {/* 1. FIXED SIDEBAR */}
      <aside className="civix-sidebar">
        <div className="civix-brand">
          <div className="brand-logo"><Zap size={22} fill="white" /></div>
          <div className="brand-text"><h1>CivixConnect</h1><p>CITIZEN PORTAL</p></div>
        </div>
        <nav className="civix-nav">
          <div className="nav-section">
            <p className="nav-label">MENU</p>
            <div className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => navigate("dashboard")}>
              <LayoutDashboard size={20} /> <span>Dashboard</span>
            </div>
            <div className={`nav-link ${page === "petitions" || page === "petition-detail" ? "active" : ""}`} onClick={() => navigate("petitions")}>
              <FileText size={20} /> <span>Petitions</span>
            </div>
            <div className={`nav-link ${page === "polls" || page === "poll-detail" ? "active" : ""}`} onClick={() => navigate("polls")}>
              <PieChart size={20} /> <span>Polls</span>
            </div>
          </div>
          <div className="nav-section">
            <p className="nav-label">CONTRIBUTE</p>
            <div className={`nav-link special-green ${page === "create-petition" ? "active" : ""}`} onClick={() => navigate("create-petition")}>
              <PlusCircle size={20} /> <span>Create Petition</span>
            </div>
            <div className={`nav-link special-green ${page === "create-poll" ? "active" : ""}`} onClick={() => navigate("create-poll")}>
              <PieChart size={20} /> <span>Create Poll</span>
            </div>
          </div>
          <div className="nav-section">
            <p className="nav-label">GOVERNANCE</p>
            <div className="nav-link logout-item" onClick={() => setShowLogoutConfirm(true)}><LogOut size={20} /> <span>Logout</span></div>
          </div>
        </nav>
      </aside>

      {/* 2. DYNAMIC CONTENT AREA */}
      <main className="civix-main">
        {page === "dashboard" && <Dashboard user={user} onNavigate={navigate} />}
        {page === "petitions" && <PetitionsPage user={user} onNavigate={navigate} />}
        {page === "polls" && <PollsPage user={user} onNavigate={navigate} />}
        {page === "create-poll" && <CreatePoll user={user} onNavigate={navigate} />}
        {page === "poll-detail" && <PollDetail poll={selectedItem} user={user} onNavigate={navigate} />}
        {page === "create-petition" && <CreatePetition user={user} onNavigate={navigate} />}
        {page === "petition-detail" && <PetitionDetail petition={selectedItem} user={user} onNavigate={navigate} />}
      </main>

      {/* --- ELITE LOGOUT MESSAGE OVERLAY --- */}
      {showLogoutConfirm && (
        <div style={modalOverlayStyle}>
          <div style={modalContainerStyle}>
            <div style={iconContainerStyle}>
              <div style={pulseRingStyle}>
                <LogOut size={28} color="#ef4444" />
              </div>
            </div>
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <h3 style={modalTitleStyle}>Terminate Session?</h3>
              <p style={modalDescStyle}>You are about to log out of the secure portal. Any unsaved progress will be lost.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
                <button 
                  className="btn-main" 
                  onClick={() => { setShowLogoutConfirm(false); handleLogout(); }} 
                  style={confirmBtnStyle}
                >
                  CONFIRM LOGOUT
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} style={cancelBtnStyle}>
                  RETURN TO DASHBOARD
                </button>
              </div>
            </div>
            <div style={securityFooterStyle}>
              <ShieldCheck size={12} /> SECURE LOGOUT PROTOCOL ENABLED
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- LOGOUT MODAL STYLES --- */
const modalOverlayStyle = {
  position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
  background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(10px)', zIndex: 9999
};
const modalContainerStyle = {
  width: '360px', background: '#0f172a', border: '1px solid #1e293b',
  borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', overflow: 'hidden'
};
const iconContainerStyle = {
  background: 'rgba(239, 68, 68, 0.03)', height: '100px', display: 'grid',
  placeItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)'
};
const pulseRingStyle = {
  padding: '15px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalTitleStyle = { margin: 0, color: 'white', fontSize: '22px', fontWeight: '700' };
const modalDescStyle = { color: '#94a3b8', marginTop: '10px', fontSize: '14px', lineHeight: '1.6' };
const confirmBtnStyle = {
  width: '100%', padding: '14px', background: '#ef4444', color: 'white', border: 'none',
  borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
};
const cancelBtnStyle = {
  width: '100%', padding: '12px', background: 'transparent', color: '#64748b',
  border: '1px solid #1e293b', borderRadius: '12px', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
};
const securityFooterStyle = {
  background: '#020617', padding: '12px', fontSize: '10px', color: '#334155',
  textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
};

export default App;