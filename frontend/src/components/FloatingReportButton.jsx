import React, { useState, useRef } from 'react';
import { AlertTriangle, Mic, MicOff, Send, MapPin, X } from 'lucide-react';

export default function FloatingReportButton({ onSubmit, userLocation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState({
    type: 'fire',
    severity: 'high',
    description: '',
  });

  const recognitionRef = useRef(null);

  const startRecording = (e) => {
    e.preventDefault();
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please type the description.");
      return;
    }
    
    setIsRecording(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, description: prev.description + (prev.description ? " " : "") + transcript }));
      setIsRecording(false);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = (e) => {
    e.preventDefault();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    // Note: State resets in onresult/onerror/onend
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description) return alert("Please provide a description or use the voice note feature.");
    
    onSubmit({
      ...formData,
      location: userLocation
    });
    setFormData({ type: 'fire', severity: 'high', description: '' });
    setIsOpen(false);
  };

  return (
    <>
      <button 
        className="fab-button"
        onClick={() => setIsOpen(true)}
        title="Report Emergency"
      >
        <AlertTriangle size={32} />
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button type="button" className="close-btn" onClick={() => setIsOpen(false)}><X size={20}/></button>
            <h2>Emergency Report</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group location-status">
                <MapPin size={18} color={userLocation ? "#2ea043" : "#f85149"} />
                <span>
                  {userLocation 
                    ? `Location Access Verified: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` 
                    : "Fetching Location Access..."}
                </span>
              </div>

              <div className="form-group">
                <label>Emergency Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="fire">🔥 Fire</option>
                  <option value="flood">🌊 Flood</option>
                  <option value="earthquake">🏚️ Earthquake</option>
                  <option value="accident">💥 Accident</option>
                  <option value="other">⚠️ Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Severity</label>
                <select 
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                >
                  <option value="high">Critical (High)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label>Voice Note & Description</label>
                <div className="voice-input-wrapper">
                  <textarea 
                    rows="4" 
                    placeholder="Describe the incident or hold the mic icon to dictate a Voice Note..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                  <button 
                    type="button" 
                    className={`voice-btn ${isRecording ? 'recording' : ''}`}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    title="Hold to record voice note"
                  >
                    {isRecording ? <Mic size={24} color="#f85149" /> : <MicOff size={24} color="#e6edf3" />}
                  </button>
                </div>
                <small style={{color: 'var(--text-secondary)', display: 'block', marginTop: '6px'}}>
                  {isRecording ? "Listening..." : "Hold mic to record voice note via speech recognition"}
                </small>
              </div>

              <button type="submit" className="submit-alert-btn" disabled={!userLocation}>
                <Send size={18} />
                Broadcast RED ALERT
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
