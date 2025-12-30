import { useLocation } from "react-router-dom";
import { useState } from "react";
import "./LiveMatch.css";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
} from "recharts";

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
	const [showAnalysis, setShowAnalysis] = useState(false);

	const handleCourtClick = (event) => {
		const court = event.currentTarget;
		const rect = court.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;

		setBallDrops((prev) => [...prev, { x, y, id: Date.now() }]);
	};

	const saveMatch = async () => {
		try {
			const res = await fetch("http://localhost:5500/matches", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					teamId: team._id,
					teamName: team.teamName,
					players: stats,
					opponentZones,
					ballDrops,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				alert("Match succesvol opgeslagen!");
			} else {
				alert(data.message || "Fout bij opslaan");
			}
		} catch (err) {
			console.error(err);
			alert("Server fout");
		}
	};

	const getPlayerStatsData = () => {
		return stats.map((player) => ({
			name: `#${player.number}`,
			value: player.points + player.attacks + player.tips,
			points: player.points,
			attacks: player.attacks,
			tips: player.tips,
		}));
	};

	const getOpponentZonesData = () => {
		return Object.entries(opponentZones)
			.filter(([_, count]) => count > 0)
			.map(([zone, count]) => ({
				name: `Zone ${zone}`,
				value: count,
			}));
	};

	const getErrorsData = () => {
		return stats
			.map((player) => ({
				name: `#${player.number}`,
				value: player.errors,
			}))
			.filter((item) => item.value > 0);
	};

	const COLORS = [
		"#0088FE",
		"#00C49F",
		"#FFBB28",
		"#FF8042",
		"#8884D8",
		"#82CA9D",
	];

	const createGradientOverlay = () => {
		if (ballDrops.length === 0) return null;

		const gradientData = [];
		const gridSize = 10;

		for (let y = 0; y < 100; y += gridSize) {
			for (let x = 0; x < 100; x += gridSize) {
				const nearbyDrops = ballDrops.filter((drop) => {
					const distance = Math.sqrt(
						Math.pow(drop.x - (x + gridSize / 2), 2) +
							Math.pow(drop.y - (y + gridSize / 2), 2)
					);
					return distance < 15;
				});

				if (nearbyDrops.length > 0) {
					gradientData.push({
						x: x,
						y: y,
						intensity: Math.min(nearbyDrops.length * 0.3, 1),
					});
				}
			}
		}

		return gradientData.map((spot, index) => (
			<div
				key={index}
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
			<h3>Tegenstander scoort</h3>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)" }}>
				{[1, 2, 3, 4, 5, 6].map((zone) => (
					<button key={zone} onClick={() => scoreOpponent(zone)}>
						Zone {zone}
						<br />({opponentZones[zone]})
					</button>
				))}
			</div>
			<div className="court-section">
				<h3>Volleyball Court - Ball Drops</h3>
				<div className="court" onClick={handleCourtClick}>
					<div className="court-lines">
						<div className="center-line"></div>
						<div className="attack-line"></div>
						<div className="end-line"></div>
					</div>
					{ballDrops.map((drop) => (
						<div
							key={drop.id}
							className="ball-drop"
							style={{
								left: `${drop.x}%`,
								top: `${drop.y}%`,
							}}
						></div>
					))}
				</div>
				<button onClick={() => setBallDrops([])} className="clear-button">
					Clear Ball Drops
				</button>
			</div>
			<br />
			<button onClick={saveMatch}>Save Match</button>
			<button onClick={() => setShowAnalysis(!showAnalysis)}>
				See Analysis
			</button>

			{showAnalysis && (
				<div className="analysis-section">
					<h2>Match Analysis</h2>

					<div className="charts-container">
						<div className="chart-wrapper">
							<h3>Player Contributions</h3>
							<ResponsiveContainer width="100%" height={300}>
								<PieChart>
									<Pie
										data={getPlayerStatsData()}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, value }) => `${name}: ${value}`}
										outerRadius={80}
										fill="#8884d8"
										dataKey="value"
									>
										{getPlayerStatsData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
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
								<PieChart>
									<Pie
										data={getOpponentZonesData()}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, value }) => `${name}: ${value}`}
										outerRadius={80}
										fill="#82ca9d"
										dataKey="value"
									>
										{getOpponentZonesData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>

						{getErrorsData().length > 0 && (
							<div className="chart-wrapper">
								<h3>Player Errors</h3>
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={getErrorsData()}
											cx="50%"
											cy="50%"
											labelLine={false}
											label={({ name, value }) => `${name}: ${value}`}
											outerRadius={80}
											fill="#ff7c7c"
											dataKey="value"
										>
											{getErrorsData().map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={COLORS[index % COLORS.length]}
												/>
											))}
										</Pie>
										<Tooltip />
										<Legend />
									</PieChart>
								</ResponsiveContainer>
							</div>
						)}
					</div>

					<div className="court-analysis">
						<h3>Court Heat Map - Ball Drops</h3>
						<div className="court analysis-court">
							<div className="court-lines">
								<div className="center-line"></div>
								<div className="attack-line"></div>
								<div className="end-line"></div>
							</div>
							{createGradientOverlay()}
							{ballDrops.map((drop) => (
								<div
									key={drop.id}
									className="ball-drop analysis-drop"
									style={{
										left: `${drop.x}%`,
										top: `${drop.y}%`,
									}}
								></div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default LiveMatch;
