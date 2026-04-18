import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../api';
export default function LobbyPage({ code, onStart, onBack }) {
  const { user, token } = useAuth();
  const [room, setRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const socket = getSocket(token);
    socket.emit('room:join', { code });
    socket.on('room:updated', setRoom);
    socket.on('game:started', (r) => { setRoom(r); onStart(code); });
    socket.on('error', (e) => setError(e.message));
    return () => { socket.off('room:updated',setRoom); socket.off('game:started'); socket.off('error'); };
  }, [code, token]);
  const start = () => getSocket(token).emit('room:start', { code });
  const copyLink = () => {
    const url = `${window.location.origin}?room=${code}`;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  const isHost = room?.players?.[0]?.id === user?.id || !room;
  const canStart = room?.players?.length >= 2;
  const s = {
    page:{minHeight:'100vh',background:'#f8f8f6',display:'flex',justifyContent:'center',padding:16},
    inner:{width:'100%',maxWidth:440},
    back:{background:'none',border:'none',color:'#2e6da4',fontSize:14,cursor:'pointer',padding:'12px 0',marginBottom:8},
    title:{margin:'0 0 20px',fontSize:24,fontWeight:700,color:'#1a3a5c'},
    codeCard:{background:'#fff',border:'1px solid #e8e8e4',borderRadius:14,padding:20,textAlign:'center',marginBottom:16},
    codeLabel:{fontSize:13,color:'#888',marginBottom:10},
    codeDisplay:{fontSize:40,fontWeight:800,letterSpacing:8,color:'#1a3a5c',fontFamily:'monospace',marginBottom:14},
    copyBtn:{padding:'10px 24px',fontSize:14,fontWeight:600,background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',marginBottom:8},
    hint:{fontSize:12,color:'#aaa'},
    playersCard:{background:'#fff',border:'1px solid #e8e8e4',borderRadius:14,padding:'16px 20px',marginBottom:20},
    playersHeader:{fontSize:13,fontWeight:600,color:'#888',marginBottom:12,textTransform:'uppercase',letterSpacing:0.5},
    playerRow:{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #f0f0ee'},
    avatar:{width:36,height:36,borderRadius:'50%',background:'#d6e8f7',color:'#1a3a5c',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15},
    playerName:{flex:1,fontSize:15,fontWeight:500,color:'#222'},
    hostBadge:{fontSize:11,background:'#1a3a5c',color:'#fff',borderRadius:6,padding:'2px 8px',fontWeight:600},
    error:{background:'#fef2f2',border:'1px solid #fca5a5',color:'#991b1b',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:12},
    startBtn:{width:'100%',padding:'16px',fontSize:16,fontWeight:700,background:'#1a3a5c',color:'#fff',border:'none',borderRadius:10,cursor:'pointer'},
    waitMsg:{textAlign:'center',fontSize:14,color:'#888',padding:20},
  };
  return (
    <div style={s.page}><div style={s.inner}>
      <button style={s.back} onClick={onBack}>← Back</button>
      <h2 style={s.title}>Game lobby</h2>
      <div style={s.codeCard}>
        <div style={s.codeLabel}>Share this code with friends</div>
        <div style={s.codeDisplay}>{code}</div>
        <button style={s.copyBtn} onClick={copyLink}>{copied?'Copied!':'Copy invite link'}</button>
        <div style={s.hint}>Send via WhatsApp, iMessage, or any app</div>
      </div>
      <div style={s.playersCard}>
        <div style={s.playersHeader}>Players ({room?.players?.length||0}/12)</div>
        {(room?.players||[]).map((p,i) => (
          <div key={p.id} style={s.playerRow}>
            <div style={s.avatar}>{p.username[0].toUpperCase()}</div>
            <div style={s.playerName}>{p.username}</div>
            {i===0 && <div style={s.hostBadge}>Host</div>}
          </div>
        ))}
        {!room?.players?.length && <div style={{fontSize:14,color:'#aaa',textAlign:'center',padding:'8px 0'}}>Joining room…</div>}
      </div>
      {error && <div style={s.error}>{error}</div>}
      {isHost
        ? <button style={{...s.startBtn,opacity:canStart?1:0.5}} onClick={start} disabled={!canStart}>{canStart?'Start game':'Waiting for more players…'}</button>
        : <div style={s.waitMsg}>Waiting for the host to start…</div>
      }
    </div></div>
  );
}
