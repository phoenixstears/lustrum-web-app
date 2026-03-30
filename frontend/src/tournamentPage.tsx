import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './tournamentPage.css';

interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
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
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<GroupedPlayers>({ teams: {}, solo: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        grouped.solo.push(player);
      }
    });
    
    setPlayers(grouped);
  };

  const getTeamName = (teamPlayers: Player[]): string => {
    return teamPlayers[0]?.teamname || 'Unnamed Team';
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
          </div>

          <Link to={`/tournament/${tournament.tournamentid}/register`} className="register-button">
            Register for this Tournament
          </Link>
        </div>

        <div className="players-section">
          <h2>Registered Players</h2>
          {Object.keys(players.teams).length === 0 && players.solo.length === 0 ? (
            <p className="no-players">No players registered yet</p>
          ) : (
            <div className="players-list">
              {Object.entries(players.teams).map(([teamId, teamPlayers]) => (
                <div key={teamId} className="team-group">
                  <h3 className="team-name">{getTeamName(teamPlayers)}</h3>
                  <ul className="players-in-team">
                    {teamPlayers.map(player => (
                      <li key={player.playerid} className="player-item">
                        <span className="player-discord">{player.discordname}</span>
                        <span className="player-ingame">({player.ingamename})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {players.solo.length > 0 && (
                <div className="solo-players">
                  <h3 className="team-name">Solo Players</h3>
                  <ul className="players-in-team">
                    {players.solo.map(player => (
                      <li key={player.playerid} className="player-item">
                        <span className="player-discord">{player.discordname}</span>
                        <span className="player-ingame">({player.ingamename})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}