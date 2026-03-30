//@ts-ignore
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import './homePage.css';

interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
}

const API_URL = "http://localhost:5000/api";

export default function HomePage(){
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${API_URL}/tournaments`);
      if (response.ok) {
        const data = await response.json();
        setTournaments(data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <img src="/assets/SEALAN.gif" alt="SEALAN logo" />
        <h1>S.E.A LAN tournament viewer!!11!!</h1>
      </div>
      <div>
        {loading ? (
          <p className="loading-text">Loading tournaments...</p>
        ) : tournaments.length > 0 ? (
          <ButtonList tournaments={tournaments} />
        ) : (
          <p className="no-tournaments-text">No tournaments available</p>
        )}
      </div>
    </div>
  )
}

interface ButtonListProps {
  tournaments: Tournament[];
}

const ButtonList: React.FC<ButtonListProps> = ({ tournaments }) => {
  return (
    <div className="button-list">
      {tournaments.map((tournament) => (
        <Link
          key={tournament.tournamentid}
          to={`/tournament/${tournament.tournamentid}`}
          className="button"
          title={tournament.gamename}
        >
          <span className="button-game">{tournament.gamename}</span>
        </Link>
      ))}
    </div>
  );
}


