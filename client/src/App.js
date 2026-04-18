import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getSocket } from './api';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
function AppInner() {
  const { user, token, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [roomCode, setRoomCode] = useState(null);
  const [isBotGame, setIsBotGame] = useState(false);
  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    return () => {};
  }, [token]);
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f8f8f6'}}><div style={{fontSize:28,fontWeight:700,color:'#1a3a5c',letterSpacing:2}}>The Word Game</div></div>;
  if (!user) return <AuthPage />;
  const nav = (p, code=null, bot=false) => { setPage(p); if (code) setRoomCode(code); setIsBotGame(bot); };
  const handleJoinRoom = (code, bot=false) => {
    if (bot) { nav('game', code, true); }
    else { nav('lobby', code, false); }
  };
  if (page==='lobby' && roomCode) return <LobbyPage code={roomCode} onStart={(c) => nav('game',c)} onBack={() => nav('home')} />;
  if (page==='game' && roomCode) return <GamePage code={roomCode} onLeave={() => nav('home')} />;
  if (page==='leaderboard') return <LeaderboardPage onBack={() => nav('home')} />;
  return <HomePage
    onJoinRoom={(code) => handleJoinRoom(code, false)}
    onCreateRoom={(code) => nav('lobby', code)}
    onBotGame={(code) => handleJoinRoom(code, true)}
    onLeaderboard={() => nav('leaderboard')}
  />;
}
export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}
