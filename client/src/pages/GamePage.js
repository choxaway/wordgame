import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket, api } from '../api';
const EMOJIS = ['😂','👀','🔥','🤯','👎'];
export default function GamePage({ code, onLeave }) {
  const { user, token } = useAuth();
  const [room, setRoom] = useState(null);
  const [chain, setChain] = useState([]);
  const [letter, setLetter] = useState('');
  const [timer, setTimer] = useState(20);
  const [status, setStatus] = useState('');
  const [reactions, setReactions] = useState([]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showDict, setShowDict] = useState(false);
  const [intendedWord, setIntendedWord] = useState('');
  const [dictWord, setDictWord] = useState('');
  const [dictResult, setDictResult] = useState(null);
  const [challengeInfo, setChallengeInfo] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const socket = getSocket(token);
  const myPlayer = room?.players?.find(p => p.id===user.id) || (room ? {id:user.id,lives:4,isEliminated:false,isSpectator:false} : null);
  const activePlayers = room?.players?.filter(p => !p.isEliminated)||[];
  const currentPlayer = activePlayers[room?.currentPlayerIndex % Math.max(activePlayers.length,1)];
  const isMyTurn = currentPlayer?.id===user.id;
  const canChallenge = isMyTurn && chain.length>=2 && !challengeInfo;
  const isChallenged = challengeInfo?.challengedId===user.id;
  const addReaction = useCallback((data) => {
    const id = Date.now()+Math.random();
    setReactions(r => [...r,{...data,id}]);
    setTimeout(() => setReactions(r => r.filter(x => x.id!==id)),2200);
  },[]);
  useEffect(() => {
    socket.emit('room:join',{code});
    socket.on('room:updated',(r) => { setRoom(r); setChain(r.chain||[]); });
    socket.on('game:started',(r) => { setRoom(r); setChain([]); setStatus('Game started!'); });
    socket.on('game:letter_added',({letter:l,chain:c,playerId}) => { setChain(c); const p=room?.players?.find(pl=>pl.id===playerId); setStatus(`${p?.username||'Player'} added "${l}"`); });
    socket.on('game:turn_changed',({currentPlayerId}) => { if(currentPlayerId===user.id){setStatus('Your turn!'); setTimeout(()=>inputRef.current?.focus(),100);} });
    socket.on('game:timer_tick',({secondsRemaining}) => setTimer(secondsRemaining));
    socket.on('game:timer_expired',({playerId}) => { const p=room?.players?.find(pl=>pl.id===playerId); setStatus(`${p?.username||'Player'} ran out of time!`); });
    socket.on('game:life_lost',({playerId,livesRemaining}) => { setRoom(r => r?{...r,players:r.players.map(p=>p.id===playerId?{...p,lives:livesRemaining}:p)}:r); });
    socket.on('game:player_eliminated',({playerId,username}) => { setStatus(`${username} has been eliminated!`); setRoom(r => r?{...r,players:r.players.map(p=>p.id===playerId?{...p,isEliminated:true,isSpectator:true}:p)}:r); });
    socket.on('game:challenge_raised',(info) => { setChallengeInfo(info); setStatus(`${info.challengerName} challenges ${info.challengedName}!`); setShowChallenge(info.challengedId===user.id); });
    socket.on('game:challenge_result',({result,word}) => { setChallengeInfo(null); setShowChallenge(false); setStatus(result==='challenger_loses'?`Challenge failed! "${word}" is valid.`:`Challenge succeeded! "${word}" not valid.`); });
    socket.on('game:three_letter_word',({word}) => setStatus(`"${word}" — 3-letter word! Safe. New round…`));
    socket.on('game:round_reset',({chain:c,roundNumber,currentPlayerId}) => { setChain([]); setLetter(''); setChallengeInfo(null); setShowChallenge(false); setStatus(`Round ${roundNumber}`); if(currentPlayerId===user.id) setTimeout(()=>inputRef.current?.focus(),200); });
    socket.on('game:winner',({winnerId,username}) => setGameOver({winnerId,username,isMe:winnerId===user.id}));
    socket.on('game:reaction',addReaction);
    socket.on('error',(e) => { setError(e.message); setTimeout(()=>setError(''),3000); });
    return () => { ['room:updated','game:started','game:letter_added','game:turn_changed','game:timer_tick','game:timer_expired','game:life_lost','game:player_eliminated','game:challenge_raised','game:challenge_result','game:three_letter_word','game:round_reset','game:winner','game:reaction','error'].forEach(ev=>socket.off(ev)); };
  },[code,token]);
  const sendLetter = () => { if(!letter||!isMyTurn||myPlayer?.isEliminated) return; socket.emit('game:add_letter',{code,letter:letter.toUpperCase()}); setLetter(''); };
  const raiseChallenge = () => { if(!canChallenge) return; socket.emit('game:challenge',{code}); };
  const submitWord = () => { socket.emit('game:submit_word',{code,word:intendedWord}); setIntendedWord(''); setShowChallenge(false); };
  const lookupWord = async () => { if(!dictWord.trim()) return; try { const r=await api.dictionary(dictWord.trim(),token); setDictResult(r); } catch { setDictResult({valid:false,definition:'Error looking up word.'}); } };
  const sendReact = (emoji) => socket.emit('game:react',{code,emoji});
  if(!room) return <div style={{padding:40,textAlign:'center',color:'#888'}}>Connecting…</div>;
  if(gameOver) return (
    <div style={{minHeight:'100vh',background:'#f8f8f6',display:'flex',justifyContent:'center',padding:16}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{marginTop:80,background:'#fff',border:'1px solid #e8e8e4',borderRadius:16,padding:40,textAlign:'center'}}>
          <div style={{fontSize:56,marginBottom:12}}>{gameOver.isMe?'🏆':'🎮'}</div>
          <div style={{fontSize:28,fontWeight:800,color:'#1a3a5c',marginBottom:8}}>{gameOver.isMe?'You win!':`${gameOver.username} wins!`}</div>
          <div style={{fontSize:15,color:'#888',marginBottom:24}}>{gameOver.isMe?'Last player standing.':'Better luck next time.'}</div>
          <button style={{width:'100%',padding:14,fontSize:16,fontWeight:600,background:'#1a3a5c',color:'#fff',border:'none',borderRadius:10,cursor:'pointer'}} onClick={onLeave}>Back to home</button>
        </div>
      </div>
    </div>
  );
  const timerPct=(timer/20)*100;
  const timerLow=timer<=6;
  return (
    <div style={{minHeight:'100vh',background:'#f8f8f6',display:'flex',justifyContent:'center',padding:'8px 12px 32px'}}>
      <div style={{width:'100%',maxWidth:440,position:'relative'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:8,marginBottom:12}}>
          <span style={{fontSize:12,background:'#e8eef5',color:'#1a3a5c',padding:'4px 10px',borderRadius:6,fontWeight:600}}>Round {room.roundNumber||1}</span>
          <button style={{fontSize:12,color:'#888',background:'none',border:'1px solid #e0e0dc',borderRadius:6,cursor:'pointer',padding:'4px 10px'}} onClick={onLeave}>Leave</button>
        </div>
        {reactions.length>0 && <div style={{position:'absolute',top:0,right:0,display:'flex',flexDirection:'column',gap:6,zIndex:10,pointerEvents:'none',padding:8}}>
          {reactions.map(r => <div key={r.id} style={{background:'#fff',border:'1px solid #e8e8e4',borderRadius:20,padding:'4px 10px',display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:18}}>{r.emoji}</span><span style={{fontSize:11,color:'#666'}}>{r.username}</span></div>)}
        </div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>
          {room.players.map(p => {
            const isActive=currentPlayer?.id===p.id;
            return <div key={p.id} style={{background:'#fff',border:isActive?'2px solid #1a3a5c':'0.5px solid #e8e8e4',borderRadius:10,padding:'8px 6px',textAlign:'center',position:'relative',opacity:p.isEliminated?0.4:1}}>
              {isActive && <div style={{position:'absolute',top:-7,left:'50%',transform:'translateX(-50%)',width:0,height:0,borderLeft:'6px solid transparent',borderRight:'6px solid transparent',borderTop:'7px solid #1a3a5c'}}/>}
              <div style={{fontSize:11,fontWeight:600,color:'#222',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.username}</div>
              <div style={{display:'flex',justifyContent:'center',gap:3}}>{[0,1,2,3].map(i => <div key={i} style={{width:7,height:7,borderRadius:'50%',background:i<p.lives?'#1a3a5c':'#e8e8e4'}}/>)}</div>
              {p.isEliminated && <div style={{fontSize:9,color:'#aaa',marginTop:3}}>out</div>}
            </div>;
          })}
        </div>
        <div style={{background:'#fff',border:'1px solid #e8e8e4',borderRadius:12,padding:'14px 12px',textAlign:'center',marginBottom:10}}>
          <div style={{fontSize:11,color:'#aaa',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Current letters</div>
          <div style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:5,minHeight:50,alignItems:'center'}}>
            {chain.length===0 && <div style={{fontSize:24,color:'#ccc'}}>—</div>}
            {chain.map((l,i) => <div key={i} style={{width:42,height:50,border:i===chain.length-1?'2px solid #1a3a5c':'1px solid #d0d0cc',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,color:'#222',background:i===chain.length-1?'#fff':'#f8f8f6'}}>{l}</div>)}
            {chain.length>0 && chain.length<10 && <div style={{width:42,height:50,border:'2px dashed #d0d0cc',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'#ccc'}}>?</div>}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <div style={{fontSize:12,color:'#666',minWidth:90}}>{isMyTurn?'Your turn':`${currentPlayer?.username||''}'s turn`}</div>
          <div style={{flex:1,height:4,background:'#eee',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',borderRadius:2,width:`${timerPct}%`,background:timerLow?'#dc2626':'#1a3a5c',transition:'width 1s linear'}}/></div>
          <div style={{fontSize:13,fontWeight:700,minWidth:28,textAlign:'right',color:timerLow?'#dc2626':'#222'}}>{timer}s</div>
        </div>
        {error && <div style={{background:'#fef2f2',border:'1px solid #fca5a5',color:'#991b1b',borderRadius:8,padding:'8px 12px',fontSize:13,marginBottom:8}}>{error}</div>}
        {status && <div style={{fontSize:13,color:'#444',textAlign:'center',padding:'6px 0',marginBottom:6}}>{status}</div>}
        {!myPlayer?.isEliminated && <div style={{display:'flex',gap:8,marginBottom:10}}>
          <input ref={inputRef} style={{width:60,height:50,fontSize:24,textAlign:'center',textTransform:'uppercase',border:'1.5px solid #d0d0cc',borderRadius:8,fontWeight:700,outline:'none',fontFamily:'inherit',opacity:isMyTurn&&!challengeInfo?1:0.4}} value={letter} onChange={e=>setLetter(e.target.value.replace(/[^a-zA-Z]/g,'').slice(-1).toUpperCase())} onKeyDown={e=>e.key==='Enter'&&sendLetter()} maxLength={1} placeholder="A" disabled={!isMyTurn||!!challengeInfo}/>
          <button style={{flex:1,height:50,fontSize:15,fontWeight:600,background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',opacity:isMyTurn&&letter&&!challengeInfo?1:0.4}} onClick={sendLetter} disabled={!isMyTurn||!letter||!!challengeInfo}>Add letter</button>
        </div>}
        {myPlayer?.isEliminated && <div style={{textAlign:'center',fontSize:13,color:'#aaa',padding:'10px 0'}}>You are spectating</div>}
        <div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:10}}>
          {EMOJIS.map(e => <button key={e} style={{width:42,height:42,fontSize:20,border:'1px solid #e8e8e4',borderRadius:8,background:'#fff',cursor:'pointer'}} onClick={()=>sendReact(e)}>{e}</button>)}
        </div>
        {!myPlayer?.isEliminated && !isChallenged && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
          <button style={{height:40,fontSize:13,fontWeight:600,border:'1px solid #fca5a5',borderRadius:8,background:'#fef2f2',cursor:'pointer',color:'#991b1b',opacity:canChallenge?1:0.4}} onClick={raiseChallenge} disabled={!canChallenge}>Challenge{chain.length<2?' (2+ letters)':''}</button>
          <button style={{height:40,fontSize:13,fontWeight:600,border:'1px solid #e8e8e4',borderRadius:8,background:showDict?'#e8eef5':'#fff',cursor:'pointer',color:'#444'}} onClick={()=>setShowDict(d=>!d)}>Dictionary</button>
        </div>}
        {isChallenged&&showChallenge && <div style={{background:'#fff',border:'1px solid #e8e8e4',borderRadius:12,padding:16,marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600,color:'#222',marginBottom:8}}>You've been challenged! What word were you building?</div>
          <div style={{fontSize:12,color:'#666',marginBottom:8}}>Chain so far: <strong>{chain.join('')}</strong></div>
          <input style={{width:'100%',padding:'10px 12px',fontSize:14,border:'1px solid #e8e8e4',borderRadius:8,marginBottom:10,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}} placeholder={`Word starting with "${chain.join('')}"…`} value={intendedWord} onChange={e=>setIntendedWord(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submitWord()} autoFocus/>
          <div style={{display:'flex',gap:8}}>
            <button style={{flex:1,height:34,fontSize:13,border:'1px solid #e8e8e4',borderRadius:8,background:'#fff',cursor:'pointer'}} onClick={()=>setShowChallenge(false)}>Cancel</button>
            <button style={{flex:1,height:34,fontSize:13,border:'1px solid #185FA5',borderRadius:8,background:'#1a3a5c',color:'#fff',cursor:'pointer'}} onClick={submitWord}>Submit word</button>
          </div>
        </div>}
        {showDict && <div style={{background:'#fff',border:'1px solid #e8e8e4',borderRadius:12,padding:16,marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600,color:'#222',marginBottom:8}}>Dictionary lookup</div>
          <div style={{display:'flex',gap:6}}>
            <input style={{flex:1,padding:'10px 12px',fontSize:14,border:'1px solid #e8e8e4',borderRadius:8,fontFamily:'inherit',outline:'none'}} placeholder="Enter a word…" value={dictWord} onChange={e=>setDictWord(e.target.value)} onKeyDown={e=>e.key==='Enter'&&lookupWord()}/>
            <button style={{padding:'0 14px',fontSize:12,border:'1px solid #1a3a5c',borderRadius:8,background:'#1a3a5c',color:'#fff',cursor:'pointer'}} onClick={lookupWord}>Look up</button>
          </div>
          {dictResult && <div style={{marginTop:8,padding:'10px 12px',borderRadius:8,border:'1px solid',borderColor:dictResult.valid?'#86efac':'#fca5a5',background:dictResult.valid?'#f0fdf4':'#fef2f2',fontSize:13,color:'#222',lineHeight:1.5}}><strong>{dictWord}</strong> — {dictResult.definition}</div>}
        </div>}
      </div>
    </div>
  );
}
