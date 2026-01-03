import { useLocation } from "react-router-dom";
import { useState } from "react";
import "./LiveMatch.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function LiveMatch() {
  const { state } = useLocation();
  const { team, players, matchStartTime } = state || {};
  const API_URL = "http://localhost:5500";

  const [stats, setStats] = useState(
    players?.map((p) => ({
      number: p.number,
      points: 0,
      errors: 0,
      attacks: 0,
      tips: 0,
    })) || []
  );
  const [opponentZones, setOpponentZones] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });
  const [ballDrops, setBallDrops] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [matchDuration, setMatchDuration] = useState(null);
  const [playerTimers, setPlayerTimers] = useState({});
  const [playerIntervals, setPlayerIntervals] = useState({});
  const [analysisFilter, setAnalysisFilter] = useState("all");

  if (!team || !players) return <p>Geen match geladen</p>;

  const updateStat = (number, field) => {
    setStats((prev) =>
      prev.map((s) => (s.number === number ? { ...s, [field]: s[field] + 1 } : s))
    );

    if (["points", "tips", "attacks"].includes(field)) {
      const now = Date.now();

      if (playerIntervals[number]) clearInterval(playerIntervals[number]);

      if (playerTimers[number]?.startTime) {
        const interval = now - playerTimers[number].startTime;
        setPlayerTimers((prev) => ({
          ...prev,
          [number]: {
            ...prev[number],
            intervals: [...(prev[number]?.intervals || []), interval],
            startTime: now,
          },
        }));
      } else {
        setPlayerTimers((prev) => ({
          ...prev,
          [number]: { startTime: now, intervals: prev[number]?.intervals || [] },
        }));
      }
    }
  };

  const scoreOpponent = (zone) =>
    setOpponentZones((prev) => ({ ...prev, [zone]: prev[zone] + 1 }));

  const handleCourtClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setBallDrops((prev) => [...prev, { x, y, id: Date.now() }]);
  };

  const handleSeeAnalysis = () => {
    if (matchStartTime && !matchDuration) {
      setMatchDuration(Date.now() - matchStartTime);
    }
    Object.values(playerIntervals).forEach(clearInterval);
    setShowAnalysis(!showAnalysis);
  };

  const saveMatch = async () => {
    try {
      const res = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team._id,
          teamName: team.teamName,
          players: stats,
          opponentZones,
          ballDrops,
        }),
      });
      const data = await res.json();
      if (res.ok) alert("Match succesvol opgeslagen!");
      else alert(data.message || "Fout bij opslaan");
    } catch (err) {
      console.error(err);
      alert("Server fout");
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  const getFilteredPlayers = () => {
    let filtered = [...stats];
    if (analysisFilter === "playing")
      filtered = filtered.filter((s) => players.find((p) => p.number === s.number && p.isPlaying));
    else if (analysisFilter !== "all")
      filtered = filtered.filter((s) => players.find((p) => p.number === s.number && p.position === analysisFilter));
    return filtered;
  };

  const getFilteredPlayerStatsData = () =>
    getFilteredPlayers().map((player) => ({
      name: `#${player.number}`,
      value: player.points + player.attacks + player.tips,
      points: player.points,
      attacks: player.attacks,
      tips: player.tips,
    }));

  const getFilteredErrorsData = () =>
    getFilteredPlayers()
      .map((player) => ({ name: `#${player.number}`, value: player.errors }))
      .filter((item) => item.value > 0);

  const getFilteredTopScorers = () =>
    getFilteredPlayers()
      .map((p) => ({ number: p.number, total: p.points + p.attacks + p.tips, points: p.points, attacks: p.attacks, tips: p.tips }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

  const getOpponentZonesData = () =>
    Object.entries(opponentZones)
      .filter(([_, count]) => count > 0)
      .map(([zone, count]) => ({ name: `Zone ${zone}`, value: count }));

  const formatDuration = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms / 1000) % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const createGradientOverlay = () => {
    if (!ballDrops.length) return null;
    const gridSize = 10;
    const gradientData = [];
    for (let y = 0; y < 100; y += gridSize) {
      for (let x = 0; x < 100; x += gridSize) {
        const nearby = ballDrops.filter((d) => Math.hypot(d.x - (x + gridSize / 2), d.y - (y + gridSize / 2)) < 15);
        if (nearby.length) gradientData.push({ x, y, intensity: Math.min(nearby.length * 0.3, 1) });
      }
    }
    return gradientData.map((spot, i) => (
      <div
        key={i}
        className="gradient-spot"
        style={{
          left: `${spot.x}%`,
          top: `${spot.y}%`,
          width: `${gridSize}%`,
          height: `${gridSize}%`,
          opacity: spot.intensity,
          background: `radial-gradient(circle, rgba(255,0,0,0.6) 0%, rgba(255,0,0,0) 70%)`,
        }}
      />
    ));
  };

  return (
    <div>
      <h2>Live Match – {team.teamName}</h2>
      <h3>Spelers</h3>
      <div className="players-score">
        {stats.map((s) => (
          <div key={s.number} style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}>
            <strong>#{s.number}</strong>
            <p>Punten: {s.points}</p>
            <p>Fouten: {s.errors}</p>
            <p>Aanvallen: {s.attacks}</p>
            <p>Tips: {s.tips}</p>
            <button onClick={() => updateStat(s.number, "points")}>+ Punt</button>
            <button onClick={() => updateStat(s.number, "errors")}>+ Fout</button>
            <button onClick={() => updateStat(s.number, "attacks")}>+ Aanval</button>
            <button onClick={() => updateStat(s.number, "tips")}>+ Tip</button>
          </div>
        ))}
      </div>

      <h3>Tegenstander scoort</h3>
      <div className="oppo-score" style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)" }}>
        {[1, 2, 3, 4, 5, 6].map((zone) => (
          <button key={zone} onClick={() => scoreOpponent(zone)}>
            Zone {zone} <br />({opponentZones[zone]})
          </button>
        ))}
      </div>

      <div className="court-section">
        <h3>Volleyball Court - Ball Drops</h3>
        <div className="court" onClick={handleCourtClick}>
          <div className="court-lines">
            <div className="center-line" />
            <div className="attack-line" />
            <div className="end-line" />
          </div>
          {ballDrops.map((drop) => (
            <div key={drop.id} className="ball-drop" style={{ left: `${drop.x}%`, top: `${drop.y}%` }} />
          ))}
        </div>
        <button onClick={() => setBallDrops([])} className="clear-button">
          Clear Ball Drops
        </button>
      </div>

      <button onClick={saveMatch}>Save Match</button>
      <button onClick={handleSeeAnalysis}>See Analysis</button>

      {showAnalysis && (
        <div className="analysis-section">
          <h2>Match Analysis</h2>
          <div className="filter-controls">
            <label htmlFor="player-filter">Filter Players:</label>
            <select id="player-filter" value={analysisFilter} onChange={(e) => setAnalysisFilter(e.target.value)}>
              <option value="all">All Players</option>
              <option value="playing">Playing Only</option>
              <option value="RS">RS - Right Side</option>
              <option value="OH">OH - Outside Hitter</option>
              <option value="L">L - Libero</option>
              <option value="S">S - Setter</option>
              <option value="M">M - Middle</option>
            </select>
          </div>

          <div className="charts-container">
            <div className="chart-wrapper">
              <h3>Top 6 Scorers</h3>
              <ul className="top-scorers">
                {getFilteredTopScorers().map((p, i) => (
                  <li key={p.number}>
                    <span className="rank">#{i + 1}</span>
                    <span className="player">Player {p.number}</span>
                    <span className="score">{p.total}</span>
                  </li>
                ))}
              </ul>
              <h4>Contribution Distribution</h4>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={getFilteredPlayerStatsData()} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                    {getFilteredPlayerStatsData().map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>Opponent Scoring Zones</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getOpponentZonesData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {getFilteredErrorsData().length > 0 && (
              <div className="chart-wrapper">
                <h3>Player Errors</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={getFilteredErrorsData()} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                      {getFilteredErrorsData().map((entry, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="court-analysis">
              <h3>Court Heat Map - Ball Drops</h3>
              <div className="court analysis-court">
                <div className="court-lines">
                  <div className="center-line" />
                  <div className="attack-line" />
                  <div className="end-line" />
                </div>
                {createGradientOverlay()}
                {ballDrops.map((drop) => (
                  <div key={drop.id} className="ball-drop analysis-drop" style={{ left: `${drop.x}%`, top: `${drop.y}%` }} />
                ))}
              </div>
            </div>

            {matchDuration && (
              <div className="match-duration">
                <h3>Match Duration</h3>
                <p className="duration-time">{formatDuration(matchDuration)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveMatch;
