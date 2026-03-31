import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext.tsx';
import './registerPage.css';

interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
  maxplayersperteam?: number;
}

interface SignupFormData {
  inGameName: string;
  teamName?: string;
  joinTeamId?: string;
  joinCode?: string;
}

interface Team {
  teamid: string;
  teamname: string;
  membercount: number;
}

const API_URL = "http://localhost:5000/api";

export default function RegisterPage(){
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { discordUser, setDiscordUser, isLoading: authLoading } = useAuth();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    inGameName: '',
    teamName: '',
    joinTeamId: '',
    joinCode: ''
  });
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupStep, setSignupStep] = useState<'login' | 'team-choice' | 'team-create' | 'team-join' | 'complete'>(
    discordUser ? 'team-choice' : 'login'
  );

  useEffect(() => {
    if (id) {
      fetchTournament();
      fetchTeams();
      checkOAuthCallback();
    }
  }, [id, searchParams]);

  useEffect(() => {
    if (discordUser) {
      setSignupStep('team-choice');
      checkExistingSignup(discordUser.discordId);
    }
  }, [discordUser]);

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

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_URL}/teams`);
      if (response.ok) {
        const teamsData = await response.json();
        // Fetch member counts for each team
        const teamsWithCounts = await Promise.all(
          teamsData.map(async (team: any) => {
            const membersResponse = await fetch(`${API_URL}/teams/${team.teamid}/members`);
            const members = membersResponse.ok ? await membersResponse.json() : [];
            return { ...team, membercount: members.length };
          })
        );
        setTeams(teamsWithCounts);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const checkOAuthCallback = () => {
    const discordId = searchParams.get('discordId');
    const discordName = searchParams.get('discordName');
    const email = searchParams.get('email');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setSignupMessage(`Discord login failed: ${oauthError}`);
      return;
    }

    if (discordId && discordName && !discordUser) {
      setDiscordUser({
        discordId,
        discordName,
        email: email || undefined
      });
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
    const backendUrl = "http://localhost:5000";
    const redirectUrl = `${backendUrl}/api/auth/discord?state=${id}`;
    window.location.href = redirectUrl;
  };

  const handleLogout = () => {
    setDiscordUser(null);
    setFormData({ inGameName: '', teamName: '', joinTeamId: '', joinCode: '' });
    setSignupStep('login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inGameName || !formData.teamName) {
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
          discordId: discordUser?.discordId,
          discordName: discordUser?.discordName,
          inGameName: formData.inGameName,
          tournamentId: id,
          teamName: formData.teamName
        })
      });

      if (response.ok) {
        setSignupMessage('Successfully created team and signed up!');
        setFormData({ inGameName: '', teamName: '', joinTeamId: '', joinCode: '' });
        setSignupStep('complete');
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

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inGameName || !formData.joinTeamId || !formData.joinCode) {
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
          discordId: discordUser?.discordId,
          discordName: discordUser?.discordName,
          inGameName: formData.inGameName,
          tournamentId: id,
          teamId: formData.joinTeamId,
          joinCode: formData.joinCode
        })
      });

      if (response.ok) {
        setSignupMessage('Successfully joined team and signed up!');
        setFormData({ inGameName: '', teamName: '', joinTeamId: '', joinCode: '' });
        setSignupStep('complete');
      } else if (response.status === 409) {
        const errorData = await response.json();
        setSignupMessage(errorData.error || 'You have already signed up for this tournament!');
      } else {
        const errorData = await response.json();
        setSignupMessage(errorData.error || 'Failed to join team. Please try again.');
      }
    } catch (err) {
      setSignupMessage('Error joining team: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
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
        {signupStep === 'complete' && signupMessage?.includes('Successfully') ? (
          <div className={`signup-message success`}>
            {signupMessage}
            <Link to={`/tournament/${id}`} className="back-link">View Tournament</Link>
          </div>
        ) : (
          <>
            {signupStep === 'login' ? (
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
              <>
                <div className="user-info">
                  <p>Logged in as: <strong>{discordUser?.discordName}</strong></p>
                  <button 
                    onClick={handleLogout}
                    className="logout-button"
                  >
                    Logout
                  </button>
                </div>

                {signupStep === 'team-choice' && (
                  <div className="team-choice-section">
                    <h2>Step 2: Choose Team Option</h2>
                    <div className="team-options">
                      <button
                        className="team-option-button"
                        onClick={() => setSignupStep('team-create')}
                        disabled={isSubmitting}
                      >
                        <span className="option-title">Create New Team</span>
                        <span className="option-desc">Start your own team</span>
                      </button>
                      <button
                        className="team-option-button"
                        onClick={() => setSignupStep('team-join')}
                        disabled={isSubmitting || teams.length === 0}
                      >
                        <span className="option-title">Join Existing Team</span>
                        <span className="option-desc">Join another team ({teams.length} available)</span>
                      </button>
                    </div>
                  </div>
                )}

                {signupStep === 'team-create' && (
                  <form onSubmit={handleCreateTeam} className="signup-form">
                    <h2>Create Your Team</h2>
                    
                    <div className="form-group">
                      <label htmlFor="teamName">Team Name</label>
                      <input
                        type="text"
                        id="teamName"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleInputChange}
                        placeholder="Enter your team name"
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
                      {isSubmitting ? 'Creating Team...' : 'Create Team and Sign Up'}
                    </button>

                    <button 
                      type="button" 
                      className="back-button"
                      onClick={() => setSignupStep('team-choice')}
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                  </form>
                )}

                {signupStep === 'team-join' && (
                  <form onSubmit={handleJoinTeam} className="signup-form">
                    <h2>Join a Team</h2>
                    
                    <div className="teams-list">
                      {teams.map(team => (
                        <div key={team.teamid} className="team-item">
                          <div className="team-info">
                            <h3>{team.teamname}</h3>
                            <p>Members: {team.membercount} / {tournament.maxplayersperteam || 5}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label htmlFor="joinTeamId">Select Team</label>
                      <select
                        id="joinTeamId"
                        name="joinTeamId"
                        value={formData.joinTeamId}
                        onChange={(e) => setFormData(prev => ({ ...prev, joinTeamId: e.target.value }))}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">-- Select a team --</option>
                        {teams.map(team => (
                          <option key={team.teamid} value={team.teamid}>
                            {team.teamname} ({team.membercount}/{tournament.maxplayersperteam || 5})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="joinCode">6-Digit Join Code</label>
                      <input
                        type="text"
                        id="joinCode"
                        name="joinCode"
                        value={formData.joinCode}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        pattern="\d{6}"
                        required
                        disabled={isSubmitting}
                      />
                      <small>Ask a team member for the join code</small>
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
                      {isSubmitting ? 'Joining Team...' : 'Join Team and Sign Up'}
                    </button>

                    <button 
                      type="button" 
                      className="back-button"
                      onClick={() => setSignupStep('team-choice')}
                      disabled={isSubmitting}
                    >
                      Back
                    </button>
                  </form>
                )}
              </>
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
