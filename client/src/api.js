import { io } from 'socket.io-client';
const SERVER_URL = process.env.REACT_APP_SERVER_URL || '';
let socket = null;
export function getSocket(token) {
  if (!socket || !socket.connected) {
    socket = io(SERVER_URL, { auth: { token }, transports: ['websocket','polling'] });
  }
  return socket;
}
export function disconnectSocket() { if (socket) { socket.disconnect(); socket = null; } }
async function apiFetch(path, options={}, token=null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${SERVER_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
export const api = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: (token) => apiFetch('/auth/me', {}, token),
  createRoom: (token) => apiFetch('/rooms/create', { method: 'POST', body: '{}' }, token),
  getRoom: (code, token) => apiFetch(`/rooms/${code}`, {}, token),
  dictionary: (word, token) => apiFetch(`/dictionary?word=${encodeURIComponent(word)}`, {}, token),
  leaderboard: (token) => apiFetch('/leaderboard', {}, token),
};

export const matchmaking = {
  join: (token) => apiFetch('/matchmaking/join', { method: 'POST', body: '{}' }, token),
  leave: (token) => apiFetch('/matchmaking/leave', { method: 'POST', body: '{}' }, token),
};
export const botGame = {
  create: (token) => apiFetch('/rooms/create-vs-bot', { method: 'POST', body: '{}' }, token),
};
