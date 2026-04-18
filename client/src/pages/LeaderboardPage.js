import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
export default function LeaderboardPage({ onBack }) {
  const { token } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.leaderboard(token).then(d => { setLeaders(d); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);
  const s = {
    page:{minHeight:'100vh',background:'#f8f8f6',display:'flex',justifyContent:'center',padding:16},
    inner:{width:'100%',maxWidth:440},
    back:{background:'none',border:'none',color:'#2e6da4',fontSize:14,cursor:'pointer',padding:'12px 0',marginBottom:8},
    title:{margin:'0 0 20px',fontSize:24,fontWeight:700,color:'#1a3a5c'},
    card:{background:'#fff',border:'1px solid #e8e8e4',borderRadius:14,overflow:'hidden'},
    row:{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',borderBottom:'1px solid #f0f0ee'},
    rank:{fontSize:13,color:'#aaa',fontWeight:700,minWidth:30},
    avatar:{width:32,height:32,borderRadius:'50%',background:'#d6e8f7',color:'#1a3a5c',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14},
    name:{flex:1,fontSize:15,fontWeight:500,color:'#222'},
    elo:{fontSize:13,fontWeight:700,color:'#1a3a5c'},
    record:{fontSize:11,color:'#aaa'},
  };
  return (
    <div style={s.page}><div style={s.inner}>
      <button style={s.back} onClick={onBack}>← Back</button>
      <h2 style={s.title}>Global leaderboard</h2>
      {loading ? <div style={{textAlign:'center',color:'#aaa',padding:40}}>Loading…</div> : (
        <div style={s.card}>
          {leaders.length===0 && <div style={{textAlign:'center',color:'#aaa',padding:40}}>No players yet. Be the first!</div>}
          {leaders.map(p => (
            <div key={p.username} style={s.row}>
              <div style={{...s.rank,color:p.rank<=3?'#1a3a5c':'#aaa'}}>#{p.rank}</div>
              <div style={s.avatar}>{p.username[0].toUpperCase()}</div>
              <div style={s.name}>{p.username}</div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
                <span style={s.elo}>★ {p.elo}</span>
                <span style={s.record}>{p.wins}W/{p.losses}L</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div></div>
  );
}
