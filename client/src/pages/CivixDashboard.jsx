import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, Bell, MapPin, TrendingUp, Share2, 
  Clock, Flame, Search, Zap, Award, Activity, Radio, 
  PieChart, ClipboardList
} from "lucide-react";
import "../Dashboard.css";

const ProgressBar = ({ current, total, color }) => {
  const percent = Math.min(Math.round((current / total) * 100), 100);
  return (
    <div className="pg-wrap">
      <div className="pg-meta">
        <span><strong>{current.toLocaleString()}</strong> / {total.toLocaleString()} signatures</span>
        <span style={{ color }}>{percent}%</span>
      </div>
      <div className="pg-track">
        <div className="pg-fill" style={{ width: `${percent}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
};

export default function CivixDashboard({ user, onNavigate }) {
  const [feedType, setFeedType] = useState("Live");
  const [showNotifs, setShowNotifs] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  const [stats, setStats] = useState({
    myPetitions: 0,
    pollsVoted: 0,
    impactPoints: 842,
    activeReports: 0
  });
  const [trendingPetitions, setTrendingPetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    fetchDashboardData();
    return () => clearInterval(t);
  }, []);

  // Listen for external refresh triggers (e.g., after create/vote)
  useEffect(() => {
    const onRefresh = () => fetchDashboardData();
    window.addEventListener('civix:refreshDashboard', onRefresh);
    return () => window.removeEventListener('civix:refreshDashboard', onRefresh);
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return setLoading(false);
    try {
      const res = await axios.get(`http://localhost:5000/api/petitions/dashboard-data/${user?._id}?userName=${encodeURIComponent(user?.fullName || '')}`);
      const { feed, stats: backendStats } = res.data;

      setTrendingPetitions(feed);
      setStats({
        myPetitions: backendStats.myCount,
        pollsVoted: backendStats.pollsVoted || 0,
        impactPoints: ( (backendStats.pollsVoted || 0) * 15) + (backendStats.myCount * 50) + 120,
        activeReports: 2
      });
      setLoading(false);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER SECTION */}
      <header className="civix-header">
        <div className="header-search">
          <Search size={18} className="glass-icon" />
          <input type="text" placeholder="Search petitions, polls..." />
        </div>

        <div className="header-meta">
          <div className="live-clock">{time}</div>
          <div className="v-line"></div>
          
          <div className="notif-wrapper">
            <div className="notif-box" onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={22} /><span className="dot"></span>
            </div>
            {showNotifs && (
              <div className="notif-dropdown">
                <div className="nd-head">Alerts</div>
                <div className="nd-item">Welcome back {user?.fullName}!</div>
              </div>
            )}
          </div>

          <div className="profile-pill">
            <div className="p-info">
              <span className="p-role">VERIFIED</span>
              <span className="p-name">{user?.fullName}</span>
            </div>
            <div className="p-avatar">{user?.fullName?.charAt(0)}</div>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT AREA */}
      <div className="civix-body">
        <section className="welcome-hero">
          <div className="hero-content">
            <h2>Executive Overview</h2>
            <p>Welcome back, Operator. Activity in <strong>{user?.location || "Sathy"}</strong> is stable.</p>
          </div>
          <div className="loc-card">
            <MapPin size={18} color="#3b82f6" />
            <div className="loc-text">
              <label>JURISDICTION</label>
              <p>{user?.location || "Sathy"}, TN</p>
            </div>
          </div>
        </section>

        {/* STATS ROW */}
        <div className="stats-row">
          {[
            { l: "My Petitions", v: stats.myPetitions.toString().padStart(2, '0'), i: FileText, c: "#3b82f6" },
            { l: "Polls Voted", v: stats.pollsVoted.toString().padStart(2, '0'), i: Radio, c: "#10b981" },
            { l: "Impact Points", v: stats.impactPoints, i: Award, c: "#f59e0b" },
            { l: "Active Reports", v: stats.activeReports.toString().padStart(2, '0'), i: ClipboardList, c: "#8b5cf6" },
          ].map((s, idx) => (
            <div key={idx} className="stat-card">
              <div className="s-icon" style={{ backgroundColor: `${s.c}15`, color: s.c }}><s.i size={22} /></div>
              <div className="s-data"><span>{s.l}</span><h3>{s.v}</h3></div>
              <div className="s-graph">
                <div className="bar" style={{height: '40%'}}></div>
                <div className="bar active" style={{height: '60%', backgroundColor: s.c}}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-split">
          <div className="feed-col">
            <div className="feed-head">
              <div className="h-left"><Flame size={20} color="#ff4d4d" fill="#ff4d4d" /> <h3>Live Feed (Last 48h)</h3></div>
              <div className="h-right">
                <button className={`f-btn ${feedType === "Live" ? "active" : ""}`} onClick={() => setFeedType("Live")}>Live</button>
                <button className={`f-btn ${feedType === "Recent" ? "active" : ""}`} onClick={() => setFeedType("Recent")}>Recent</button>
              </div>
            </div>

            {loading ? (
              <p style={{color: 'var(--text-s)', padding: '20px'}}>Syncing with Node...</p>
            ) : trendingPetitions.length > 0 ? (
              trendingPetitions.map((item) => (
                <div className="case-card" key={item._id} style={{marginBottom: '15px'}}>
                  <div className="case-top">
                    <span className="priority">RECENT UPDATE</span>
                    <span className="timer"><Clock size={12} /> {new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <div className="case-author">
                    <div className="u-box" style={{background: 'var(--accent)'}}>{(item.author || 'U')[0]}</div>
                    <p>By <strong>{item.author || 'Unknown'}</strong>
                      {item.type === 'petition' ? (
                        <> in <span className="blue">{item.category}</span></>
                      ) : (
                        <> <span className="blue">(Poll)</span></>
                      )}
                    </p>
                  </div>

                  {item.type === 'petition' ? (
                    <>
                      <ProgressBar 
                        current={item.currentSignatures} 
                        total={item.targetSignatures} 
                        color="#3b82f6" 
                      />
                      <div className="case-foot">
                        <button className="btn-main" onClick={() => onNavigate('petitions')}>Analyze</button>
                        <div className="icon-group">
                          <button className="i-btn"><Share2 size={18}/></button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ margin: '12px 0' }}>
                        {item.options && item.options.map((opt, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <div style={{ color: 'var(--text-s)' }}>{opt.text}</div>
                            <div style={{ color: 'var(--accent)' }}>{(opt.votes || 0)} votes</div>
                          </div>
                        ))}
                      </div>
                      <div className="case-foot">
                        <button className="btn-main" onClick={() => onNavigate('poll-detail', item)}>View Poll</button>
                        <div className="icon-group">
                          <button className="i-btn"><Share2 size={18}/></button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="case-card" style={{textAlign: 'center', padding: '40px'}}>
                <p style={{color: 'var(--text-s)'}}>No new updates in the last 48 hours.</p>
              </div>
            )}
          </div>

          <div className="side-col">
            <div className="impact-box">
              <div className="ib-head"><TrendingUp size={18} color="#f59e0b" /> <h4>Citizen Score</h4></div>
              <div className="ib-main"><h2>{stats.impactPoints}</h2><span className="rank">LEVEL 4</span></div>
              <div className="ib-track"><div className="ib-fill" style={{width: '75%'}}></div></div>
              <p>Track your progress in Sathy node</p>
            </div>

            <div className="status-box">
              <div className="ib-head"><Activity size={18} color="#10b981" /> <h4>Node Status</h4></div>
              <div className="bits">
                {[1,1,1,1,0,1,1,1,1,1,1,1].map((b, i) => <div key={i} className={`bit ${b ? 'up' : 'down'}`}></div>)}
              </div>
              <p>99.9% Connectivity</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}