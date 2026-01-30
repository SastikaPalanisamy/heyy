import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search, MapPin, Users, ArrowRight,
  HardHat, TreePine, Lightbulb, ShieldAlert,
  Globe, PlusCircle, Clock
} from "lucide-react";
import "../Dashboard.css";
import "../petition.css";

export default function PetitionsPage({ onNavigate }) {
  const [petitions, setPetitions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = [
    { name: "All", icon: <Globe size={16} /> },
    { name: "Infrastructure", icon: <HardHat size={16} /> },
    { name: "Environment", icon: <TreePine size={16} /> },
    { name: "Education", icon: <Lightbulb size={16} /> },
    { name: "Safety", icon: <ShieldAlert size={16} /> }
  ];

  // 1. Fetch Data from Backend
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        setLoading(true);
        // Backend API call
        const res = await axios.get("http://localhost:5000/api/petitions");
        setPetitions(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPetitions();
  }, []);

  // 2. Search and Filter Logic
  useEffect(() => {
    let result = petitions;

    if (activeFilter !== "All") {
      result = result.filter(p => p.category === activeFilter);
    }

    if (searchTerm) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFiltered(result);
  }, [activeFilter, searchTerm, petitions]);

  return (
    <div className="civix-body">
      {/* --- HERO SECTION --- */}
      <section className="welcome-hero">
        <div className="hero-content">
          <h2>Community Petitions</h2>
          <p>Browse active movements in <strong>{localStorage.getItem("userLoc") || "Sathy"} Node</strong>.</p>
        </div>

        <div
          className="action-card-btn"
          onClick={() => onNavigate("create-petition")}
          style={{ cursor: "pointer" }}
        >
          <PlusCircle size={22} color="#10b981" />
          <div className="loc-text">
            <label>ACTION</label>
            <p>Create New</p>
          </div>
        </div>
      </section>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="feed-head" style={{ marginBottom: "25px", display: "flex", flexWrap: "wrap", gap: "15px" }}>
        <div className="petition-search-wrapper" style={{ flex: 1, minWidth: "300px" }}>
          <div className="glass-icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {categories.map(cat => (
            <button
              key={cat.name}
              className={`filter-btn ${activeFilter === cat.name ? "active" : ""}`}
              onClick={() => setActiveFilter(cat.name)}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- PETITIONS GRID --- */}
      {loading ? (
        <div className="loading-text" style={{ textAlign: "center", padding: "50px", color: "var(--accent)" }}>
          <div className="spinner"></div>
          Syncing with Civix Node...
        </div>
      ) : (
        <div className="petition-grid">
          {filtered.length > 0 ? (
            filtered.map(p => {
              // Calculate Progress
              const progress = Math.min(Math.round((p.currentSignatures / p.targetSignatures) * 100), 100);
              
              return (
                <div className="case-card" key={p._id}>
                  <div className="case-top">
                    <span className="priority">{p.category}</span>
                    <span className="timer">
                      <Clock size={12} />
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="case-title">{p.title}</h3>

                  <div className="case-meta">
                    <div>
                      <Users size={15} />
                      <span>{p.currentSignatures} Signed</span>
                    </div>
                    <div>
                      <MapPin size={15} />
                      <span>{p.location || "Sathy"}</span>
                    </div>
                  </div>

                  {/* Progress Bar UI */}
                  <div className="pg-wrap" style={{ margin: "15px 0" }}>
                    <div className="pg-meta">
                      <span><strong>{progress}%</strong> complete</span>
                      <span>Target: {p.targetSignatures}</span>
                    </div>
                    <div className="pg-track">
                      <div className="pg-fill" style={{ width: `${progress}%`, background: "var(--accent)" }}></div>
                    </div>
                  </div>

                  <div className="case-author">
                    <div className="u-box">
                      {p.author ? p.author[0].toUpperCase() : "C"}
                    </div>
                    <p>Organized by <strong>@{p.author || "Citizen"}</strong></p>
                  </div>

                  <button
                    className="btn-main full"
                    onClick={() => onNavigate("petition-detail", p)}
                  >
                    View Full Details <ArrowRight size={18} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="empty-state" style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
              <p className="empty-text">No movements found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}