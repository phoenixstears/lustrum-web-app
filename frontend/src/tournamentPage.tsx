import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext.tsx';
import './tournamentPage.css';

interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
  maxplayersperteam?: number;
}

interface Player {
  playerid: string;
  discordname: string;
  ingamename: string;
  tournamentid: string;
  teamid: string | null;
  teamname?: string | null;
}

interface PlayersByTeam {
  [teamId: string]: Player[];
}

interface GroupedPlayers {
  teams: PlayersByTeam;
  solo: Player[];
}

const API_URL = "http://localhost:5000/api";

export default function TournamentPage(){
  const { id } = useParams<{ id: string }>();
  const { discordUser, logout } = useAuth();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<GroupedPlayers>({ teams: {}, solo: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      fetchTournamentData();
    }
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [tournamentRes, playersRes] = await Promise.all([
        fetch(`${API_URL}/tournaments/${id}`),
        fetch(`${API_URL}/players/tournament/${id}/withteams`)
      ]);
      
      if (!tournamentRes.ok) {
        throw new Error('Tournament not found');
      }
      
      const tournamentData = await tournamentRes.json();
      setTournament(tournamentData);
      
      if (playersRes.ok) {
        const playersData = await playersRes.json();
        groupPlayersByTeam(playersData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tournament');
      setTournament(null);
    } finally {
      setLoading(false);
    }
  };

  const groupPlayersByTeam = (playersList: Player[]) => {
    const grouped: GroupedPlayers = { teams: {}, solo: [] };
    
    playersList.forEach(player => {
      if (player.teamid) {
        if (!grouped.teams[player.teamid]) {
          grouped.teams[player.teamid] = [];
        }
        grouped.teams[player.teamid].push(player);
      }
    });
    
    setPlayers(grouped);
  };

  const getTeamName = (teamPlayers: Player[]): string => {
    return teamPlayers[0]?.teamname || 'Unnamed Team';
  };

  const isPlayerInTeam = (teamId: string): boolean => {
    if (!discordUser) return false;
    const teamPlayers = players.teams[teamId] || [];
    return teamPlayers.some(p => p.discordname === discordUser.discordName);
  };

  const getCurrentPlayer = (): Player | null => {
    if (!discordUser) return null;
    
    for (const teamPlayers of Object.values(players.teams)) {
      const player = teamPlayers.find(p => p.discordname === discordUser.discordName);
      if (player) return player;
    }
    
    return null;
  };

  const handleViewJoinCode = async (teamId: string) => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;

    try {
      const response = await fetch(
        `${API_URL}/teams/${teamId}/join-code?playerId=${currentPlayer.playerid}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setJoinCode(data.joinCode);
        setShowJoinCodeModal(teamId);
      } else {
        alert('Failed to retrieve join code');
      }
    } catch (err) {
      console.error('Error fetching join code:', err);
      alert('Error fetching join code');
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;

    if (!window.confirm('Are you sure you want to leave? This will remove you from the tournament.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teams/${teamId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId: currentPlayer.playerid
        })
      });

      if (response.ok) {
        alert('Successfully left the team');
        fetchTournamentData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to leave team');
      }
    } catch (err) {
      console.error('Error leaving team:', err);
      alert('Error leaving team');
    }
  };

  const toggleTeamExpand = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const handleLoginWithDiscord = () => {
    const backendUrl = "http://localhost:5000";
    const state = `tournament:${id}`;
    const redirectUrl = `${backendUrl}/api/auth/discord?state=${encodeURIComponent(state)}`;
    window.location.href = redirectUrl;
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className="tournament-page"><p>Loading tournament information...</p></div>;
  }

  if (error || !tournament) {
    return (
      <div className="tournament-page">
        <div className="error-container">
          <p className="error-message">Tournament not found or currently unavailable</p>
          <p className="error-detail">{error}</p>
          <Link to="/" className="back-link">Back to tournaments</Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(tournament.starttime);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="tournament-page">
      <div className="auth-controls">
        {discordUser ? (
          <>
            <span className="user-info">{discordUser.discordName}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-btn" onClick={handleLoginWithDiscord}>
            Login with Discord
          </button>
        )}
      </div>

      <div className="tournament-header">
        <Link to="/" className="back-to-home">← Back</Link>
        <h1>{tournament.gamename}</h1>
      </div>

      <div className="tournament-info">
        <div className="info-section">
          <h2>Tournament Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Game:</label>
              <p>{tournament.gamename}</p>
            </div>
            {tournament.starttime && (
              <>
                <div className="info-item">
                  <label>Start Date:</label>
                  <p>{formattedDate}</p>
                </div>
                <div className="info-item">
                  <label>Start Time:</label>
                  <p>{formattedTime}</p>
                </div>
              </>
            )}
            {tournament.brackettype && (
              <div className="info-item">
                <label>Bracket Type:</label>
                <p>{tournament.brackettype === 1 ? 'Single Elimination' : 'Group Stage'}</p>
              </div>
            )}
            {tournament.maxplayersperteam && (
              <div className="info-item">
                <label>Max Players per Team:</label>
                <p>{tournament.maxplayersperteam}</p>
              </div>
            )}
          </div>

          <Link to={`/tournament/${tournament.tournamentid}/register`} className="register-button">
            Register for this Tournament
          </Link>
        </div>

        <div className="players-section">
          <h2>Registered Players</h2>
          {Object.keys(players.teams).length === 0 ? (
            <p className="no-players">No players registered yet</p>
          ) : (
            <div className="players-list">
              {Object.entries(players.teams).map(([teamId, teamPlayers]) => {
                const isInTeam = isPlayerInTeam(teamId);
                const isExpanded = expandedTeams.has(teamId);
                const maxPlayers = tournament.maxplayersperteam || 5;
                
                return (
                  <div key={teamId} className={`team-group ${isInTeam ? 'my-team' : ''}`}>
                    <div className="team-header" onClick={() => toggleTeamExpand(teamId)}>
                      <div className="team-title-section">
                        <h3 className="team-name">{getTeamName(teamPlayers)}</h3>
                        <span className="member-count">{teamPlayers.length}/{maxPlayers}</span>
                      </div>
                      <div className="team-actions">
                        {isInTeam && (
                          <>
                            <button
                              className="view-code-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewJoinCode(teamId);
                              }}
                            >
                              View Code
                            </button>
                            <button
                              className="leave-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveTeam(teamId);
                              }}
                            >
                              Leave Tournament
                            </button>
                          </>
                        )}
                        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <ul className="players-in-team">
                        {teamPlayers.map(player => (
                          <li key={player.playerid} className="player-item">
                            <span className="player-discord">{player.discordname}</span>
                            <span className="player-ingame">({player.ingamename})</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Join Code Modal */}
      {showJoinCodeModal && joinCode && (
        <div className="modal-overlay" onClick={() => setShowJoinCodeModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Team Join Code</h2>
            <p>Share this code with new team members:</p>
            <div className="join-code-display">{joinCode}</div>
            <p className="join-code-info">This code is only visible to team members</p>
            <button
              className="modal-close-btn"
              onClick={() => setShowJoinCodeModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}