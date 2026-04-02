import React, { useState, useRef } from 'react';
import { Send, MapPin, Mic, MicOff, Camera, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

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
      alert("Speech recognition is not supported in this browser.");
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
    
    recognitionRef.current.onerror = () => setIsRecording(false);
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.start();
  };

  const stopRecording = (e) => {
    e.preventDefault();
    if (recognitionRef.current) recognitionRef.current.stop();
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
    if (!formData.description) return;
    
    let mediaData = null;
    if (formData.media && formData.media.type.startsWith('image/')) {
      mediaData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(formData.media);
      });
    }
    
    let finalDesc = formData.description;
    if (fileName) finalDesc += `\n[Attached Media: ${fileName}]`;

    onSubmit({
      type: formData.type,
      severity: formData.severity,
      description: finalDesc,
      location: userLocation,
      mediaData
    });
    
    setFormData({ type: 'fire', severity: 'high', description: '', media: null });
    setFileName('');
    setSuccessMsg('SIGNAL TRANSMITTED. HELP IS INBOUND.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="glass-panel" style={{ 
      marginTop: '1rem', 
      border: '2px solid rgba(248, 81, 73, 0.4)',
      background: 'rgba(22, 27, 34, 0.6)',
      padding: '2rem',
      boxShadow: '0 0 40px rgba(248, 81, 73, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '20px'
    }}>
      {/* Visual background blinker for urgency */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '4px', background: 'var(--danger-color)', opacity: 0.8 }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#ff7b72', margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <AlertTriangle className="pulse-slow" size={24} />
           SOS BROADCAST
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#ff7b72', fontWeight: 'bold' }}>
           <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff7b72', animation: 'pulse-red 1.5s infinite' }}></div>
           LIVE SIGNAL
        </div>
      </div>
      
      {successMsg && (
        <div style={{ background: 'rgba(46, 160, 67, 0.15)', color: '#3fb950', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(46, 160, 67, 0.3)' }}>
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ 
          background: 'rgba(13, 17, 23, 0.6)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          padding: '1rem', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '1.5rem' 
        }}>
          <MapPin size={20} color={userLocation ? "#3fb950" : "#f85149"} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.65rem', color: '#8b949e', fontWeight: 'bold' }}>SATELLITE POSITION</span>
            <span style={{ fontSize: '0.85rem', color: userLocation ? '#e6edf3' : '#ff7b72' }}>
              {userLocation 
                ? `${userLocation.lat.toFixed(6)} / ${userLocation.lng.toFixed(6)}` 
                : "AWAITING GPS LOCK..."}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
           <div className="form-group">
             <label style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Crisis Category</label>
             <select 
               value={formData.type}
               onChange={(e) => setFormData({...formData, type: e.target.value})}
               style={{ background: 'rgba(13, 17, 23, 0.8)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: '#e6edf3' }}
             >
               <option value="fire">Fire / Blast</option>
               <option value="flood">Flood / Rain</option>
               <option value="earthquake">Earthquake</option>
               <option value="gas_leak">Gas Leak / Bio</option>
               <option value="trapped">Trapped Persons</option>
               <option value="medical">Medical / Health</option>
               <option value="accident">Accident</option>
               <option value="crime">Active Threat</option>
               <option value="missing_person">Missing Person</option>
               <option value="cyber_threat">Cyber Threat</option>
             </select>
           </div>

           <div className="form-group">
             <label style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Impact Level</label>
             <select 
               value={formData.severity}
               onChange={(e) => setFormData({...formData, severity: e.target.value})}
               style={{ background: 'rgba(13, 17, 23, 0.8)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: '#ff7b72', fontWeight: 'bold' }}
             >
               <option value="high">Critical / Extreme</option>
               <option value="medium">Serious Impact</option>
               <option value="low">Minor Emergency</option>
             </select>
           </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.7rem', color: '#8b949e', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Situation Description</label>
          <div style={{ position: 'relative' }}>
            <textarea 
              rows="4" 
              placeholder="State the nature of your emergency..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ background: 'rgba(13, 17, 23, 0.8)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', resize: 'none', paddingRight: '60px' }}
            />
            <button 
              type="button" 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '10px',
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isRecording ? 'rgba(248, 81, 73, 0.2)' : 'rgba(255,255,255,0.05)',
                border: isRecording ? '1px solid var(--danger-color)' : '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isRecording ? <Mic className="blink" size={20} color="#f85149" /> : <Mic size={20} color="#8b949e" />}
            </button>
          </div>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
           <input 
             type="file" 
             accept="image/*,video/*" 
             ref={fileInputRef}
             onChange={handleFileChange}
             style={{ display: 'none' }} 
             id="media-upload"
           />
           <button 
             type="button" 
             onClick={() => fileInputRef.current.click()}
             style={{ 
               width: '100%',
               background: 'rgba(255,255,255,0.03)', 
               border: '1px dashed rgba(255,255,255,0.2)', 
               color: '#8b949e', 
               display: 'flex', 
               flexDirection: 'column',
               alignItems: 'center',
               gap: '8px', 
               padding: '1.25rem',
               borderRadius: '14px',
               fontSize: '0.8rem',
               transition: 'all 0.2s ease',
               cursor: 'pointer'
             }}
           >
             <Camera size={22} color="#2f81f7" />
             {fileName ? <span style={{ color: '#fff' }}>✓ {fileName} attached</span> : 'ATTACH PHOTO / VIDEO PROOF'}
           </button>
        </div>

        <button 
          type="submit" 
          disabled={!userLocation || !formData.description}
          style={{ 
            width: '100%',
            background: 'linear-gradient(135deg, #f85149 0%, #a40e26 100%)',
            padding: '1.25rem',
            borderRadius: '14px',
            color: '#fff',
            fontWeight: '900',
            fontSize: '1rem',
            letterSpacing: '0.15em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            border: 'none',
            boxShadow: '0 8px 16px rgba(248, 81, 73, 0.3)',
            cursor: userLocation && formData.description ? 'pointer' : 'default',
            opacity: userLocation && formData.description ? 1 : 0.4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Zap size={22} fill="currentColor" />
          TRANSMIT RED ALERT
        </button>
      </form>
    </div>
  );
}
