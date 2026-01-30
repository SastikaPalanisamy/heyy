import React, { useState } from "react";
import axios from "axios";
import { FileEdit, Info } from "lucide-react";

export default function CreatePetition({ user, onNavigate }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    location: user?.location || "Sathy",
    targetSignatures: 100,
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // BACKEND SYNC: Adding the 'author' field which is required by your Schema
    const finalData = {
      ...formData,
      author: user?.fullName || "Anonymous Citizen",
    };

    try {
      // API ROUTE FIX: Updated to match your router.post("/create", ...)
      const res = await axios.post("http://localhost:5000/api/petitions/create", finalData);
      alert(res.data.message || "Petition Created Successfully! 🚀");
      onNavigate("petitions");
    } catch (err) {
      console.error("Save error:", err.response?.data);
      alert("Error: " + (err.response?.data?.error || "Could not save petition. Check backend console."));
    }
  };

  return (
    <div className="civix-body" style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* HEADER AREA */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111827', fontSize: '22px', fontWeight: '700' }}>
            <FileEdit size={24} color="#3b82f6" /> Create a New Petition
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            Broadcast your movement to the community. Complete all required fields.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '35px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          
          {/* PETITION TITLE */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Petition Title</label>
            <input 
              style={inputStyle}
              placeholder="Give your petition a clear, specific title"
              required
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            <p style={subTextStyle}>Clear titles (e.g., "Repair Sathy Hospital Road") get more attention.</p>
          </div>

          {/* CATEGORY & LOCATION ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '25px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select 
                style={inputStyle} 
                required 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="General">General</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Environment">Environment</option>
                <option value="Education">Education</option>
                <option value="Public Safety">Public Safety</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input 
                style={inputStyle}
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
              <p style={subTextStyle}>The specific area this petition concerns.</p>
            </div>
          </div>

          {/* SIGNATURE GOAL */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Signature Goal</label>
            <input 
              type="number"
              style={inputStyle}
              value={formData.targetSignatures}
              onChange={(e) => setFormData({...formData, targetSignatures: e.target.value})}
            />
            <p style={subTextStyle}>How many community signatures are needed for impact?</p>
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Description</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '180px', resize: 'vertical', lineHeight: '1.6' }}
              placeholder="Clearly explain the issue, why it matters, and what action you're requesting..."
              required
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* IMPORTANT INFO BOX */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '18px', display: 'flex', gap: '14px', marginBottom: '30px' }}>
            <Info size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#92400e', fontSize: '14px' }}>Submission Guidelines</strong>
              <p style={{ color: '#b45309', fontSize: '13px', lineHeight: '1.5', marginTop: '4px' }}>
                Your petition will be logged under the name <strong>{user?.fullName || "Anonymous"}</strong>. Ensure your description contains factual evidence to increase the success rate of your movement.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="btn-main" style={{ 
              width: 'auto', 
              padding: '12px 40px', 
              background: '#3b82f6', 
              color: 'white', 
              borderRadius: '6px', 
              fontWeight: '600', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '15px'
            }}>
              Submit Petition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// STYLES
const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  color: '#111827',
  outline: 'none',
  background: '#fff',
  transition: 'border-color 0.2s'
};

const subTextStyle = {
  fontSize: '12px',
  color: '#6b7280',
  marginTop: '6px'
};