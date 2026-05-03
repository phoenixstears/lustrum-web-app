import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './bracketPage.css';


interface Tournament {
  tournamentid: string;
  gamename: string;
  starttime: string;
  brackettype: number;
  challongeid: number;
  bracketcreated: boolean;
}

interface Player {
  playerid: string;
  discordname: string;
  ingamename: string;
  tournamentid: string;
  teamid: string | null;
  teamname?: string | null;
}

type BracketMode = 'single' | 'double' | 'groupSingle' | 'groupDouble';

interface BracketSelection {
  mode: BracketMode;
  label: string;
  hasGroupStage: boolean;
  hasDoubleElimination: boolean;
  teamsPerGroup: number;
  advanceCount: number;
  tournamentId: string;
  tournamentName: string;
}

const BRACKET_MODES: { id: BracketMode; label: string; description: string }[] = [
  { id: 'single', label: 'Single Elimination', description: 'One-loss elimination tournament.' },
  { id: 'double', label: 'Double Elimination', description: 'Two losses before elimination.' },
  { id: 'groupSingle', label: 'Group + Single Elimination', description: 'Group stage then single elimination.' },
  { id: 'groupDouble', label: 'Group + Double Elimination', description: 'Group stage then double elimination.' }
];

const API_URL = 'http://localhost:5000/api';

interface EntrantDisplay {
  id: string;
  label: string;
  type: 'team' | 'solo';
  playerNames: string[];
}

export default function BracketPage() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [entrants, setEntrants] = useState<EntrantDisplay[]>([]);
  const [selectedBracket, setSelectedBracket] = useState<BracketMode>('single');
  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);
  const [advanceCount, setAdvanceCount] = useState<number>(1);
  const [tournamentId, setTournamentId] = useState<string>('');
  const [tournamentName, setTournamentName] = useState<string>('');
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bracketSelection: BracketSelection = {
    mode: selectedBracket,
    label: BRACKET_MODES.find(mode => mode.id === selectedBracket)?.label ?? 'Unknown',
    hasGroupStage: selectedBracket === 'groupSingle' || selectedBracket === 'groupDouble',
    hasDoubleElimination: selectedBracket === 'double' || selectedBracket === 'groupDouble',
    teamsPerGroup,
    advanceCount,
    tournamentId,
    tournamentName
  };

  useEffect(() => {
    if (id) {
      fetchTournamentData();
    }
  }, [id]);

  useEffect(() => {
    buildEntrants(players);
  }, [players]);

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
      setTournamentId(tournamentData.tournamentid);
      setTournamentName(tournamentData.gamename || '');

      if (playersRes.ok) {
        const playerData = await playersRes.json();
        setPlayers(playerData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tournament');
      setTournament(null);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const buildEntrants = (playerList: Player[]) => {
    const teams: Record<string, Player[]> = {};
    const solos: Player[] = [];

    playerList.forEach(player => {
      if (player.teamid) {
        teams[player.teamid] = teams[player.teamid] ?? [];
        teams[player.teamid].push(player);
      } else {
        solos.push(player);
      }
    });

    const teamEntries: EntrantDisplay[] = Object.entries(teams).map(([teamId, members], index) => ({
      id: teamId,
      label: members[0]?.teamname || `Team ${index + 1}`,
      type: 'team',
      playerNames: members.map(member => member.ingamename || member.discordname)
    }));

    const soloEntries: EntrantDisplay[] = solos.map(player => ({
      id: player.playerid,
      label: player.ingamename || player.discordname,
      type: 'solo',
      playerNames: [player.ingamename || player.discordname]
    }));

    setEntrants([...teamEntries, ...soloEntries].sort((a, b) => a.label.localeCompare(b.label)));
  };

  useEffect(() => {
    if (advanceCount >= teamsPerGroup) {
      setAdvanceCount(Math.max(1, teamsPerGroup - 1));
    }
  }, [teamsPerGroup, advanceCount]);

  const handleGenerateBracket = async () => {
    const mode = bracketSelection.mode;
    if (mode == 'single' || mode == 'double'){
    const res = await fetch(`${API_URL}/challonge/tournament`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: bracketSelection.tournamentName,
      url: bracketSelection.tournamentId.replaceAll("-",""),
      type: mode
    })
  });
    const data = await res.json();
    const id = data.data.id;
    const body2 = JSON.stringify({
      data: {data:
        {
          attributes: {
            participants: entrants.map(item => ({
              name: item.label
            }))
          }
        }
      },
      id: id
    });
    const res2 = await fetch(`${API_URL}/challonge/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body2
    });
    const data2 = await res2.json();
    data2 == data2;
        const res3 = await fetch(`${API_URL}/tournaments/${bracketSelection.tournamentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      gamename: tournament?.gamename,
      starttime: tournament?.starttime,
      brackettype: tournament?.brackettype,
      challongeid: id,
      bracketCreated: true
    })
  });
    const data3 = await res3.json();
    data3 == data3;
    window.open("https://challonge.com/" + bracketSelection.tournamentId.replaceAll("-","") , "_blank");
    }
    else {
    const res = await fetch(`${API_URL}/challonge/tournament`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: bracketSelection.tournamentName,
      url: bracketSelection.tournamentId.replaceAll("-",""),
      type: mode,
      teamsPerGroup: bracketSelection.teamsPerGroup,
      teamsAdvance: bracketSelection.advanceCount
    })
  });
    const data = await res.json();
    const id = data.data.id;
    const body2 = JSON.stringify({
      data: {data:
        {
          attributes: {
            participants: entrants.map(item => ({
              name: item.label
            }))
          }
        }
      },
      id: id
    });
    const res2 = await fetch(`${API_URL}/challonge/players`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: body2
    });
    const data2 = await res2.json();
    data2 == data2;
    const res3 = await fetch(`${API_URL}/tournaments/${bracketSelection.tournamentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      gamename: tournament?.gamename,
      starttime: tournament?.starttime,
      brackettype: tournament?.brackettype,
      challongeid: id,
      bracketCreated: true
    })
  });
    console.log("hello?");
    const data3 = await res3.json();
    console.log(data3);
    window.open("https://challonge.com/" + bracketSelection.tournamentId.replaceAll("-","") , "_blank");
    }
    console.log('Generate bracket clicked', bracketSelection, entrants);
    setGenerated(true);


  };

  if (loading) {
    return (
      <div className="bracket-page">
        <p className="loading-text">Loading bracket data...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="bracket-page">
        <div className="error-container">
          <p className="error-message">Unable to load bracket settings</p>
          <p className="error-detail">{error}</p>
          <Link to={`/tournament/${id}`} className="back-link">Back to tournament</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bracket-page">
      <div className="bracket-header">
        <Link to={`/tournament/${id}`} className="back-link">← Back</Link>
        <div>
          <h1>{tournament.gamename} Bracket Generator</h1>
          <p>Review participants on the left, choose a bracket format on the right, then generate the bracket.</p>
        </div>
      </div>

      <div className="bracket-layout">
        <section className="entrants-panel">
          <div className="panel-heading">
            <h2>Participants</h2>
            <p>Hover a team to see its players.</p>
          </div>

          {entrants.length === 0 ? (
            <div className="empty-state">
              <p>No participants have been loaded yet.</p>
            </div>
          ) : (
            <div className="entrant-grid">
              {entrants.map(entrant => (
                <div key={entrant.id} className="entrant-card">
                  <div className="entrant-card-main">
                    <strong>{entrant.label}</strong>
                    <span>{entrant.type === 'team' ? 'Team' : 'Solo player'}</span>
                  </div>

                  {entrant.type === 'team' && (
                    <div className="player-tooltip">
                      <div className="tooltip-title">Players</div>
                      <ul>
                        {entrant.playerNames.map((name, index) => (
                          <li key={`${entrant.id}-player-${index}`}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="generator-panel">
          <div className="panel-heading">
            <h2>Bracket generation</h2>
            <p>Select a format and then click <strong>GENERATE BRACKET</strong>.</p>
          </div>

          <div className="bracket-options">
            {BRACKET_MODES.map(option => (
              <button
                key={option.id}
                type="button"
                className={`option-button ${selectedBracket === option.id ? 'active' : ''}`}
                onClick={() => setSelectedBracket(option.id)}
              >
                <span className="option-label">{option.label}</span>
                <span className="option-description">{option.description}</span>
              </button>
            ))}
          </div>

          {bracketSelection.hasGroupStage && (
            <div className="group-settings">
              <div className="group-control">
                <label>Teams per group</label>
                <select
                  value={teamsPerGroup}
                  onChange={e => setTeamsPerGroup(Number(e.target.value))}
                  disabled={generated}
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="group-control">
                <label>Advance per group</label>
                <select
                  value={advanceCount}
                  onChange={e => setAdvanceCount(Number(e.target.value))}
                  disabled={generated}
                >
                  {Array.from({ length: Math.max(1, teamsPerGroup - 1) }, (_item, index) => index + 1).map(count => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="button"
            className="generate-button"
            onClick={handleGenerateBracket}
            disabled={generated}
          >
            {generated ? 'BRACKET GENERATED' : 'GENERATE BRACKET'}
          </button>

          <div className="selection-summary">
            Selected format: <strong>{bracketSelection.label}</strong>
            {bracketSelection.hasGroupStage && (
              <span> · {bracketSelection.teamsPerGroup} per group, {bracketSelection.advanceCount} advance</span>
            )}
          </div>

          {generated && (
            <div className="generator-status">
              Bracket selection saved. Add live bracket generation logic in <code>handleGenerateBracket</code>.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
