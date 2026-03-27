const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8002";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8002";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  // Tournaments
  getTournaments: () => request("/api/tournaments"),
  createTournament: (data) =>
    request("/api/tournaments", { method: "POST", body: JSON.stringify(data) }),
  getTournament: (id) => request(`/api/tournaments/${id}`),
  updateTournament: (id, data) =>
    request(`/api/tournaments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTournament: (id) =>
    request(`/api/tournaments/${id}`, { method: "DELETE" }),

  // Teams
  getTeams: (tournamentId) => request(`/api/tournaments/${tournamentId}/teams`),
  registerTeam: (tournamentId, data) =>
    request(`/api/tournaments/${tournamentId}/teams`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Matches
  getMatches: (tournamentId) =>
    request(`/api/tournaments/${tournamentId}/matches`),
  submitResults: (matchId, results) =>
    request(`/api/matches/${matchId}/results`, {
      method: "POST",
      body: JSON.stringify({ results }),
    }),
  toggleLock: (matchId) =>
    request(`/api/matches/${matchId}/lock`, { method: "PUT" }),
  toggleDispute: (resultId) =>
    request(`/api/match-results/${resultId}/dispute`, { method: "PUT" }),

  // Leaderboard
  getLeaderboard: (tournamentId) =>
    request(`/api/tournaments/${tournamentId}/leaderboard`),
  getTopFraggers: (tournamentId) =>
    request(`/api/tournaments/${tournamentId}/top-fraggers`),

  // Seed
  seed: () => request("/api/seed", { method: "POST" }),
};

export function connectWS(tournamentId, onMessage) {
  const ws = new WebSocket(`${WS_URL}/ws/tournament/${tournamentId}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onclose = () => {
    // Reconnect after 3 seconds
    setTimeout(() => connectWS(tournamentId, onMessage), 3000);
  };

  return ws;
}
