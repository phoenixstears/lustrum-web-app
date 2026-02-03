import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './registerPage.css';

interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
}

interface SignupFormData {
  discordName: string;
  inGameName: string;
}

const API_URL = "http://localhost:5000/api";

export default function RegisterPage(){
  const { id } = useParams<{ id: string }>();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    discordName: '',
    inGameName: ''
  });
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.discordName || !formData.inGameName) {
      setSignupMessage('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          discordname: formData.discordName,
          ingamename: formData.inGameName
        })
      });

      if (response.ok) {
        setSignupMessage('Successfully signed up for the tournament!');
        setFormData({ discordName: '', inGameName: '' });
      } else {
        setSignupMessage('Failed to sign up. Please try again.');
      }
    } catch (err) {
      setSignupMessage('Error signing up: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="register-page"><p className="loading-text">Loading tournament information...</p></div>;
  }

  if (error || !tournament) {
    return (
      <div className="register-page">
        <div className="error-container">
          <p className="error-message">Tournament not found or currently unavailable</p>
          <p className="error-detail">{error}</p>
          <Link to="/" className="back-link">Back to tournaments</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-header">
        <Link to={`/tournament/${id}`} className="back-to-home">← Back</Link>
        <h1>Register for {tournament.gamename}</h1>
      </div>

      <div className="register-container">
        {signupMessage && signupMessage.includes('Successfully') ? (
          <div className={`signup-message success`}>
            {signupMessage}
          </div>
        ) : (
          <>
            <form onSubmit={handleSignup} className="signup-form">
              <h2>Sign Up Form</h2>
              
              <div className="form-group">
                <label htmlFor="discordName">Discord Name</label>
                <input
                  type="text"
                  id="discordName"
                  name="discordName"
                  value={formData.discordName}
                  onChange={handleInputChange}
                  placeholder="Your Discord username"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="inGameName">In-Game Name</label>
                <input
                  type="text"
                  id="inGameName"
                  name="inGameName"
                  value={formData.inGameName}
                  onChange={handleInputChange}
                  placeholder="Your in-game username"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button 
                type="submit" 
                className="signup-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing up...' : 'Sign Up for Tournament'}
              </button>
            </form>

            {signupMessage && (
              <div className={`signup-message ${signupMessage.includes('Failed') || signupMessage.includes('Error') ? 'error' : 'success'}`}>
                {signupMessage}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
