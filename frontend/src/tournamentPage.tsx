import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './tournamentPage.css';

interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
}

const API_URL = "http://localhost:5000/api";

export default function TournamentPage(){
  const { id } = useParams<{ id: string }>();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTournament();
    }
  }, [id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/tournaments/${id}`);
      
      if (!response.ok) {
        throw new Error('Tournament not found');
      }
      
      const data = await response.json();
      setTournament(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tournament');
      setTournament(null);
    } finally {
      setLoading(false);
    }
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
      </div>
    </div>
  );
}