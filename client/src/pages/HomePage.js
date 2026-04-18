import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, matchmaking, botGame, getSocket } from '../api';
export default function HomePage({ onJoinRoom, onCreateRoom, onBotGame, onLeaderboard }) {
  const { user, token, logout } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [queueing, setQueueing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const pollRef = useRef(null);
  useEffect(() => {
    const socket = getSocket(token);
    socket.on('matchmaking:matched', ({ code }) => { stopQueue(); onJoinRoom(code); });
    return () => { socket.off('matchmaking:matched'); stopQueue(); };
  }, [token]);
  const startQueue = async () => {
    setQueueing(true); setError('');
    const res = await matchmaking.join(token);
    if (res.status === 'matched') { stopQueue(); onJoinRoom(res.code); return; }
    pollRef.current = setInterval(async () => {
      setQueueCount(c => c + 1);
      const r = await matchmaking.join(token);
      if (r.status === 'matched') { stopQueue(); onJoinRoom(r.code); }
    }, 3000);
  };
  const stopQueue = async () => {
    setQueueing(false); setQueueCount(0);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    try { await matchmaking.leave(token); } catch {}
  };
  const createRoom = async () => {
    setLoading('create'); setError('');
    try { const { code } = await api.createRoom(token); onCreateRoom(code); }
    catch (e) { setError(e.message); }
    setLoading('');
  };
  const joinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setLoading('join'); setError('');
    try { await api.getRoom(code, token); onJoinRoom(code); }
    catch (e) { setError('Room not found. Check the code and try again.'); }
    setLoading('');
  };
  const playVsBot = async () => {
    setLoading('bot'); setError('');
    try { const { code } = await botGame.create(token); onBotGame(code); }
    catch (e) { setError(e.message); }
    setLoading('');
  };
  const s = {
    page:{minHeight:'100vh',background:'#f8f8f6',display:'flex',justifyContent:'center',padding:'16px 16px 40px'},
    inner:{width:'100%',maxWidth:440},
    header:{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:16,marginBottom:24},
    logo:{width:40,height:40,borderRadius:8,background:'#1a3a5c',color:'#fff',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',letterSpacing:1},
    userInfo:{display:'flex',alignItems:'center',gap:10},
    username:{fontSize:14,fontWeight:600,color:'#1a3a5c'},
    elo:{fontSize:13,color:'#888'},
    logoutBtn:{fontSize:12,color:'#888',background:'none',border:'none',cursor:'pointer',padding:'4px 8px'},
    title:{margin:'0 0 8px',fontSize:32,fontWeight:800,color:'#1a3a5c',letterSpacing:-0.5},
    sub:{margin:'0 0 24px',fontSize:15,color:'#666',lineHeight:1.5},
    stats:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20},
    stat:{background:'#fff',border:'1px solid #e8e8e4',borderRadius:10,padding:'12px 8px',textAlign:'center'},
    statVal:{fontSize:22,fontWeight:700,color:'#1a3a5c'},
    statLbl:{fontSize:11,color:'#999',marginTop:2},
    card:{background:'#fff',border:'1px solid #e8e8e4',borderRadius:14,padding:20,marginBottom:12},
    quickBtn:{width:'100%',padding:'16px',fontSize:16,fontWeight:700,background:'#1a3a5c',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',marginBottom:10},
    botBtn:{width:'100%',padding:'14px',fontSize:15,fontWeight:600,background:'#fff',color:'#1a3a5c',border:'2px solid #1a3a5c',borderRadius:10,cursor:'pointer',marginBottom:10},
    queueBox:{background:'#e8eef5',borderRadius:10,padding:'14px',textAlign:'center',marginBottom:10},
    queueText:{fontSize:14,color:'#1a3a5c',fontWeight:500,marginBottom:8},
    cancelBtn:{fontSize:13,color:'#666',background:'none',border:'1px solid #ccc',borderRadius:8,cursor:'pointer',padding:'6px 16px'},
    divider:{textAlign:'center',position:'relative',margin:'14px 0',borderTop:'1px solid #e8e8e4'},
    dividerText:{background:'#fff',padding:'0 10px',fontSize:12,color:'#aaa',position:'relative',top:-10},
    secondaryRow:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8},
    secBtn:{padding:'12px',fontSize:14,fontWeight:600,background:'#fff',color:'#1a3a5c',border:'1px solid #1a3a5c',borderRadius:10,cursor:'pointer'},
    joinRow:{display:'flex',gap:6},
    codeInput:{flex:1,padding:'12px 10px',fontSize:14,border:'1px solid #e8e8e4',borderRadius:8,fontFamily:'monospace',textTransform:'uppercase',letterSpacing:1,outline:'none'},
    joinBtn:{padding:'12px 14px',fontSize:14,fontWeight:600,background:'#2e6da4',color:'#fff',border:'none',borderRadius:8,cursor:'pointer'},
    error:{marginTop:10,background:'#fef2f2',border:'1px solid #fca5a5',color:'#991b1b',borderRadius:8,padding:'10px 14px',fontSize:13},
    lbBtn:{width:'100%',padding:'12px',fontSize:14,fontWeight:500,background:'none',border:'1px solid #e8e8e4',borderRadius:10,cursor:'pointer',color:'#555',marginBottom:24},
    howTo:{background:'#fff',border:'1px solid #e8e8e4',borderRadius:14,padding:20},
    howTitle:{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:12},
    rule:{fontSize:13,color:'#555',marginBottom:8,paddingLeft:4,lineHeight:1.4},
  };
  return (
    <div style={s.page}><div style={s.inner}>
      <div style={s.header}>
        <div style={s.logo}>TWG</div>
        <div style={s.userInfo}>
          <span style={s.username}>{user.username}</span>
          <span style={s.elo}>★ {user.elo}</span>
          <button style={s.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </div>
      <h1 style={s.title}>The Word Game</h1>
      <p style={s.sub}>Add a letter. Don't complete the word. Last player standing wins.</p>
      <div style={s.stats}>
        <div style={s.stat}><div style={s.statVal}>{user.wins}</div><div style={s.statLbl}>Wins</div></div>
        <div style={s.stat}><div style={s.statVal}>{user.losses}</div><div style={s.statLbl}>Losses</div></div>
        <div style={s.stat}><div style={s.statVal}>{user.elo}</div><div style={s.statLbl}>Rating</div></div>
      </div>
      <div style={s.card}>
        {!queueing ? (
          <>
            <button style={{...s.quickBtn,opacity:loading?0.6:1}} onClick={startQueue} disabled={!!loading}>
              Quick Play — match with a player
            </button>
            <button style={{...s.botBtn,opacity:loading?0.6:1}} onClick={playVsBot} disabled={!!loading}>
              {loading==='bot'?'Starting…':'Practice vs WordBot'}
            </button>
          </>
        ) : (
          <div style={s.queueBox}>
            <div style={s.queueText}>Finding players… ({queueCount * 3}s)</div>
            <div style={{fontSize:12,color:'#666',marginBottom:10}}>Or cancel and try Practice vs WordBot</div>
            <button style={s.cancelBtn} onClick={stopQueue}>Cancel</button>
          </div>
        )}
        <div style={s.divider}><span style={s.dividerText}>or play with friends</span></div>
        <div style={s.secondaryRow}>
          <button style={{...s.secBtn,opacity:loading==='create'?0.6:1}} onClick={createRoom} disabled={!!loading}>{loading==='create'?'Creating…':'+ Create room'}</button>
          <div style={s.joinRow}>
            <input style={s.codeInput} placeholder="Room code" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={6} onKeyDown={e=>e.key==='Enter'&&joinRoom()} />
            <button style={{...s.joinBtn,opacity:loading==='join'?0.6:1}} onClick={joinRoom} disabled={!!loading}>Go</button>
          </div>
        </div>
        {error && <div style={s.error}>{error}</div>}
      </div>
      <button style={s.lbBtn} onClick={onLeaderboard}>View leaderboard →</button>
      <div style={s.howTo}>
        <div style={s.howTitle}>How to play</div>
        <div style={s.rule}>1. Take turns adding one letter to the chain</div>
        <div style={s.rule}>2. Every letter must keep a real word possible</div>
        <div style={s.rule}>3. Complete a word of 4+ letters — lose a life</div>
        <div style={s.rule}>4. Challenge if you think no word can be built</div>
        <div style={s.rule}>5. Lose all 4 lives — you're out. Last one wins!</div>
      </div>
    </div></div>
  );
}
