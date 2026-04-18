import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { if (mode==='login') await login(form.email, form.password); else await register(form.username, form.email, form.password); }
    catch (err) { setError(err.message); }
    setLoading(false);
  };
  const s = {
    page:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f8f6',padding:16},
    card:{background:'#fff',borderRadius:16,border:'1px solid #e8e8e4',padding:'32px 28px',width:'100%',maxWidth:380,textAlign:'center'},
    logo:{width:56,height:56,borderRadius:12,background:'#1a3a5c',color:'#fff',fontSize:18,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',letterSpacing:1},
    title:{margin:'0 0 4px',fontSize:24,fontWeight:700,color:'#1a3a5c'},
    sub:{margin:'0 0 24px',fontSize:14,color:'#888'},
    tabs:{display:'flex',border:'1px solid #e8e8e4',borderRadius:8,marginBottom:20,overflow:'hidden'},
    tab:{flex:1,padding:'10px 0',fontSize:14,border:'none',background:'#fff',cursor:'pointer',color:'#888',fontWeight:500},
    tabActive:{background:'#1a3a5c',color:'#fff'},
    form:{display:'flex',flexDirection:'column',gap:12},
    input:{padding:'12px 14px',fontSize:15,border:'1px solid #e8e8e4',borderRadius:8,outline:'none',fontFamily:'inherit'},
    error:{background:'#fef2f2',border:'1px solid #fca5a5',color:'#991b1b',borderRadius:8,padding:'10px 14px',fontSize:13,textAlign:'left'},
    btn:{padding:'14px',fontSize:15,fontWeight:600,background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',marginTop:4},
  };
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>TWG</div>
        <h1 style={s.title}>The Word Game</h1>
        <p style={s.sub}>Don't complete the word.</p>
        <div style={s.tabs}>
          <button style={{...s.tab,...(mode==='login'?s.tabActive:{})}} onClick={() => setMode('login')}>Sign in</button>
          <button style={{...s.tab,...(mode==='register'?s.tabActive:{})}} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit} style={s.form}>
          {mode==='register' && <input style={s.input} placeholder="Username (2-20 chars)" value={form.username} onChange={set('username')} required minLength={2} maxLength={20} />}
          <input style={s.input} type="email" placeholder="Email address" value={form.email} onChange={set('email')} required />
          <input style={s.input} type="password" placeholder="Password" value={form.password} onChange={set('password')} required minLength={6} />
          {error && <div style={s.error}>{error}</div>}
          <button style={{...s.btn,opacity:loading?0.6:1}} disabled={loading}>{loading?'Please wait…':mode==='login'?'Sign in':'Create account'}</button>
        </form>
      </div>
    </div>
  );
}
