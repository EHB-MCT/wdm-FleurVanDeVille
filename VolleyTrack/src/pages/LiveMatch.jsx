import { useLocation } from "react-router-dom";
import { useState } from "react";
import "./LiveMatch.css";

function LiveMatch() {
	const { state } = useLocation();
	const { team, players } = state || {};

	const [stats, setStats] = useState(
		players.map((p) => ({
			number: p.number,
			points: 0,
			errors: 0,
			attacks: 0,
			tips: 0,
		}))
	);

	if (!team || !players) {
		return <p>Geen match geladen</p>;
	}

	const updateStat = (number, field) => {
		setStats((prev) =>
			prev.map((s) =>
				s.number === number ? { ...s, [field]: s[field] + 1 } : s
			)
		);
	};

	const [opponentZones, setOpponentZones] = useState({
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
	});

	const scoreOpponent = (zone) => {
		setOpponentZones((prev) => ({
			...prev,
			[zone]: prev[zone] + 1,
		}));
	};

	const [ballDrops, setBallDrops] = useState([]);

	const handleCourtClick = (event) => {
		const court = event.currentTarget;
		const rect = court.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;
		
		setBallDrops(prev => [...prev, { x, y, id: Date.now() }]);
	};

	return (
		<div>
			<h2>Live Match – {team.teamName}</h2>

			<h3>Spelers</h3>
			{stats.map((s) => (
				<div
					key={s.number}
					style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}
				>
					<strong>#{s.number}</strong>
					<p>Punten: {s.points}</p>
					<p>Fouten: {s.errors}</p>
					<p>Aanvallen: {s.attacks}</p>
					<p>Tips: {s.tips}</p>

					<button onClick={() => updateStat(s.number, "points")}>+ Punt</button>
					<button onClick={() => updateStat(s.number, "errors")}>+ Fout</button>
					<button onClick={() => updateStat(s.number, "attacks")}>
						+ Aanval
					</button>
					<button onClick={() => updateStat(s.number, "tips")}>+ Tip</button>
				</div>
			))}
            <div className="court-section">
				<h3>Volleyball Court - Ball Drops</h3>
				<div className="court" onClick={handleCourtClick}>
					<div className="court-lines">
						<div className="center-line"></div>
						<div className="attack-line"></div>
						<div className="end-line"></div>
					</div>
					{ballDrops.map(drop => (
						<div
							key={drop.id}
							className="ball-drop"
							style={{
								left: `${drop.x}%`,
								top: `${drop.y}%`
							}}
						></div>
					))}
				</div>
				<button onClick={() => setBallDrops([])} className="clear-button">
					Clear Ball Drops
				</button>
			</div>
		</div>
	);
}

export default LiveMatch;
