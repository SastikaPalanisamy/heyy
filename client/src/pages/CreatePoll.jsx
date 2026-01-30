import React, { useState } from "react";
import axios from "axios";
import { BarChart3, Info, Plus, Trash2 } from "lucide-react";

export default function CreatePoll({ user, onNavigate }) {
  const [form, setForm] = useState({ title: "", description: "", options: ["", ""] });
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (idx, val) => {
    const copy = [...form.options];
    copy[idx] = val;
    setForm({ ...form, options: copy });
  };

  const addOption = () => setForm({ ...form, options: [...form.options, ""] });
  
  const removeOption = (idx) => {
    if (form.options.length <= 2) return; // Minimum 2 options required
    const copy = form.options.filter((_, i) => i !== idx);
    setForm({ ...form, options: copy });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
        ...form, 
        author: user?.fullName || "Citizen Operator" 
      };
      
      await axios.post("http://localhost:5000/api/polls/create", payload);
      alert("Poll Launched Successfully! 📊");
      try { window.dispatchEvent(new Event('civix:refreshDashboard')); } catch(e){}
      onNavigate("polls"); // Maathuna appram polls feed-ku pogum
    } catch (err) {
      alert("Error: Could not launch poll. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="civix-body" style={{ background: '#f9fafb', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* HEADER AREA */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#111827', fontSize: '22px', fontWeight: '700' }}>
            <BarChart3 size={24} color="#3b82f6" /> Launch a Community Poll
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
            Gather instant feedback from the residents of your locality.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '35px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          
          {/* POLL TITLE */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Poll Question / Title</label>
            <input 
              style={inputStyle}
              placeholder="e.g., Should we install solar street lights in Ward 4?"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* DESCRIPTION */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Context (Optional)</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              placeholder="Provide more details about why this poll is being conducted..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* OPTIONS SECTION */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Poll Options</label>
            {form.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <span style={optionNumberStyle}>{i + 1}</span>
                  <input 
                    style={{ ...inputStyle, paddingLeft: '40px' }}
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    required
                  />
                </div>
                {form.options.length > 2 && (
                  <button 
                    type="button" 
                    onClick={() => removeOption(i)}
                    style={removeBtnStyle}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addOption}
              style={addBtnStyle}
            >
              <Plus size={16} /> Add Another Option
            </button>
          </div>

          {/* INFO BOX */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '18px', display: 'flex', gap: '14px', marginBottom: '30px' }}>
            <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#1e40af', fontSize: '14px' }}>Poll Privacy</strong>
              <p style={{ color: '#1d4ed8', fontSize: '13px', lineHeight: '1.5', marginTop: '4px' }}>
                This poll will be visible to all verified members in your area. Results are updated in real-time.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button type="submit" className="btn-main" disabled={loading} style={{ 
              width: 'auto', 
              padding: '12px 40px', 
              background: '#3b82f6', 
              color: 'white', 
              borderRadius: '6px', 
              fontWeight: '600', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px'
            }}>
              {loading ? 'Launching...' : 'Launch Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// STYLES (Sync with Petition Page)
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111827', outline: 'none', background: '#fff' };
const optionNumberStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '700', color: '#9ca3af', background: '#f3f4f6', width: '20px', height: '20px', borderRadius: '50%', display: 'grid', placeItems: 'center' };
const addBtnStyle = { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px dashed #3b82f6', color: '#3b82f6', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '5px' };
const removeBtnStyle = { background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '10px', borderRadius: '6px', cursor: 'pointer' };