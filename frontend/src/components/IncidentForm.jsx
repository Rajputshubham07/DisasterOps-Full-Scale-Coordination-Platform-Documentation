import React, { useState, useRef } from 'react';
import { Send, MapPin, Mic, MicOff, Camera, CheckCircle2 } from 'lucide-react';

export default function IncidentForm({ onSubmit, userLocation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [formData, setFormData] = useState({
    type: 'fire',
    severity: 'high',
    description: '',
    media: null
  });

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFormData(prev => ({ ...prev, media: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) return alert("Please provide a description or use the voice note feature.");
    
    let mediaData = null;
    if (formData.media && formData.media.type.startsWith('image/')) {
      mediaData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800; // Optimize for real-time socket transmission
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(formData.media);
      });
    }
    
    let finalDesc = formData.description;
    if (fileName) {
       finalDesc += `\n[Attached Media: ${fileName}]`;
    }

    onSubmit({
      type: formData.type,
      severity: formData.severity,
      description: finalDesc,
      location: userLocation,
      mediaData
    });
    
    setFormData({ type: 'fire', severity: 'high', description: '', media: null });
    setFileName('');
    setSuccessMsg('Submit success. Our team will reach you ASAP.');
    
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="glass-panel" style={{ marginTop: '1rem', border: '1px solid var(--danger-color)' }}>
      <h2 style={{ color: '#ff7b72', marginBottom: '1rem' }}>Broadcast SOS</h2>
      
      {successMsg && (
        <div style={{ background: 'rgba(46, 160, 67, 0.15)', color: '#3fb950', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '0.875rem' }}>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group location-status" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <MapPin size={18} color={userLocation ? "#2ea043" : "#f85149"} />
          <span>
            {userLocation 
              ? `GPS Locked: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` 
              : "Fetching Location Access..."}
          </span>
        </div>

        <div className="form-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           <div className="form-group">
             <label>Emergency Type</label>
             <select 
               value={formData.type}
               onChange={(e) => setFormData({...formData, type: e.target.value})}
               style={{ background: 'rgba(0,0,0,0.5)' }}
             >
               <option value="fire">🔥 Fire</option>
               <option value="flood">🌊 Flood</option>
               <option value="medical">🚑 Medical Emergency</option>
               <option value="accident">💥 Accident</option>
               <option value="crime">👮 Crime/Safety</option>
               <option value="other">⚠️ Other</option>
             </select>
           </div>

           <div className="form-group">
             <label>Severity</label>
             <select 
               value={formData.severity}
               onChange={(e) => setFormData({...formData, severity: e.target.value})}
               style={{ background: 'rgba(0,0,0,0.5)' }}
             >
               <option value="high">Critical</option>
               <option value="medium">Medium</option>
               <option value="low">Low</option>
             </select>
           </div>
        </div>

        <div className="form-group">
          <label>Voice Note & Description</label>
          <div className="voice-input-wrapper">
            <textarea 
              rows="3" 
              placeholder="Describe or hold mic to dictate..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ background: 'rgba(0,0,0,0.5)' }}
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
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              {isRecording ? <Mic size={24} color="#f85149" /> : <MicOff size={24} color="#8b949e" />}
            </button>
          </div>
        </div>
        
        <div className="form-group">
           <label>Media Proof (Optional)</label>
           <input 
             type="file" 
             accept=".jpg, .png, .jpeg, .mp4" 
             ref={fileInputRef}
             onChange={handleFileChange}
             style={{ display: 'none' }} 
             id="media-upload"
           />
           <button 
             type="button" 
             onClick={() => fileInputRef.current.click()}
             style={{ background: 'rgba(0,0,0,0.5)', border: '1px dashed var(--border-color)', color: '#8b949e', display: 'flex', gap: '8px', padding: '1rem' }}
           >
             <Camera size={18} />
             {fileName ? fileName : 'Upload Photo or Video (.jpg, .png, .mp4)'}
           </button>
        </div>

        <button type="submit" className="submit-alert-btn" disabled={!userLocation || !formData.description}>
          <Send size={18} />
          Broadcast RED ALERT
        </button>
      </form>
    </div>
  );
}
