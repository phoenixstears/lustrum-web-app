import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import './registerPage.css';

interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
}

interface SignupFormData {
  discordId: string;
  discordName: string;
  inGameName: string;
}

const API_URL = "http://localhost:5000/api";

export default function RegisterPage(){
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    discordId: '',
    discordName: '',
    inGameName: ''
  });
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTournament();
      checkOAuthCallback();
    }
  }, [id, searchParams]);

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

  const checkOAuthCallback = () => {
    const discordId = searchParams.get('discordId');
    const discordName = searchParams.get('discordName');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setSignupMessage(`Discord login failed: ${oauthError}`);
      return;
    }

    if (discordId && discordName) {
      setFormData(prev => ({
        ...prev,
        discordId,
        discordName
      }));
      setIsLoggedIn(true);

      // Check if user already signed up for this tournament
      checkExistingSignup(discordId);
    }
  };

  const checkExistingSignup = async (discordId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/check-signup/${discordId}/${id}`
      );
      const data = await response.json();
      
      if (data.alreadySignedUp) {
        setSignupMessage('You have already signed up for this tournament!');
      }
    } catch (err) {
      console.error('Error checking signup:', err);
    }
  };

  const handleLoginWithDiscord = () => {
    // Redirect to Discord OAuth endpoint
    const backendUrl = "http://localhost:5000";
    const redirectUrl = `${backendUrl}/api/auth/discord?state=${id}`;
    window.location.href = redirectUrl;
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
    
    if (!formData.discordId || !formData.discordName || !formData.inGameName) {
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
          discordId: formData.discordId,
          discordName: formData.discordName,
          inGameName: formData.inGameName,
          tournamentId: id
        })
      });

      if (response.ok) {
        setSignupMessage('Successfully signed up for the tournament!');
        setFormData({ discordId: '', discordName: '', inGameName: '' });
        setIsLoggedIn(false);
      } else if (response.status === 409) {
        setSignupMessage('You have already signed up for this tournament!');
      } else {
        const errorData = await response.json();
        setSignupMessage(errorData.error || 'Failed to sign up. Please try again.');
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
        {signupMessage && signupMessage.includes('Successfully') && isSubmitting === false ? (
          <div className={`signup-message success`}>
            {signupMessage}
          </div>
        ) : (
          <>
            {!isLoggedIn ? (
              <div className="discord-login-section">
                <h2>Step 1: Login with Discord</h2>
                <p>To prevent spam signups, you must login with your Discord account.</p>
                <button 
                  onClick={handleLoginWithDiscord}
                  className="discord-login-button"
                >
                  <span>🔗 Login with Discord</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="signup-form">
                <h2>Step 2: Complete Your Registration</h2>
                
                <div className="form-group">
                  <label htmlFor="discordName">Discord Name</label>
                  <input
                    type="text"
                    id="discordName"
                    name="discordName"
                    value={formData.discordName}
                    onChange={handleInputChange}
                    placeholder="Your Discord username"
                    disabled={true}
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

                <button 
                  type="button" 
                  className="discord-login-button secondary"
                  onClick={handleLoginWithDiscord}
                  disabled={isSubmitting}
                >
                  Login with Different Account
                </button>
              </form>
            )}

            {signupMessage && !signupMessage.includes('Successfully') && (
              <div className={`signup-message ${signupMessage.includes('already signed up') ? 'info' : 'error'}`}>
                {signupMessage}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
