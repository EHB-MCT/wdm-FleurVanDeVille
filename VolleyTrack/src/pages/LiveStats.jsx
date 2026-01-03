import "./LiveStats.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5500";

function LiveStats() {
	const [teams, setTeams] = useState([]);
	const [selectedTeam, setSelectedTeam] = useState(null);
	const [teamForm, setTeamForm] = useState({ coachName: "", teamName: "" });
	const [newPlayer, setNewPlayer] = useState({
		number: "",
		position: "",
		isPlaying: false,
	});
	const [players, setPlayers] = useState([]);
	const navigate = useNavigate();

	const goToMatch = () => {
		const matchStartTime = Date.now();
		navigate("/live-match", { state: { team: selectedTeam, players, matchStartTime } });
	};

	useEffect(() => {
		fetch(`${API_URL}/teams`)
			.then((res) => res.json())
			.then((data) => setTeams(data))
			.catch((err) => console.error("Fetch teams failed:", err));
	}, []);

	useEffect(() => {
		if (!selectedTeam) return;

		fetch(`${API_URL}/teams/${selectedTeam._id}/players`)
			.then((res) => res.json())
			.then((data) => setPlayers(Array.isArray(data) ? data : []))
			.catch((err) => {
				console.error("Fetch players failed:", err);
				setPlayers([]);
			});
	}, [selectedTeam]);

	const createTeam = async () => {
		if (!teamForm.coachName || !teamForm.teamName) return;

		try {
			const res = await fetch(`${API_URL}/teams`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(teamForm),
			});
			const data = await res.json();
			setSelectedTeam(data);
			setTeamForm({ coachName: "", teamName: "" });
		} catch (err) {
			console.error("Create team failed:", err);
		}
	};
	
	const addPlayer = async () => {
		if (!selectedTeam || !newPlayer.number || !newPlayer.position) return;

		try {
			const res = await fetch(`${API_URL}/teams/${selectedTeam._id}/players`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newPlayer),
			});
			const data = await res.json();
			if (res.ok) {
				setPlayers((prev) => [...prev, data.player]);
				setNewPlayer({ number: "", position: "", isPlaying: false });
			}
		} catch (err) {
			console.error("Add player failed:", err);
		}
	};

	return (
		<div className="live-stats-container">
			{!selectedTeam && (
				<div className="team-form">
					<h2>Maak je team</h2>
					<input
						placeholder="Coachnaam"
						value={teamForm.coachName}
						onChange={(e) =>
							setTeamForm({ ...teamForm, coachName: e.target.value })
						}
					/>
					<br /><br />
					<input
						placeholder="Teamnaam"
						value={teamForm.teamName}
						onChange={(e) =>
							setTeamForm({ ...teamForm, teamName: e.target.value })
						}
					/>
					<br /><br />
					<button onClick={createTeam}>Maak team</button>

					<h3>Of kies een bestaand team</h3>
					<ul>
						{teams.map((t) => (
							<li key={t._id}>
								<button onClick={() => setSelectedTeam(t)}>
									{t.teamName} ({t.coachName})
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			{selectedTeam && (
				<div className="players-section">
					<h2>Team: {selectedTeam.teamName}</h2>
					<h3>Voeg spelers toe</h3>
					<input
						placeholder="Nummer"
						value={newPlayer.number}
						onChange={(e) =>
							setNewPlayer((prev) => ({ ...prev, number: e.target.value }))
						}
					/>
					<br /><br />
					<select
						value={newPlayer.position}
						onChange={(e) =>
							setNewPlayer((prev) => ({ ...prev, position: e.target.value }))
						}
					>
						<option value="">Positie</option>
						<option value="RS">RS</option>
						<option value="OH">OH</option>
						<option value="L">L</option>
						<option value="S">S</option>
						<option value="M">M</option>
					</select>
					<br /><br />
					<label>
						<input
							type="checkbox"
							checked={newPlayer.isPlaying}
							onChange={(e) =>
								setNewPlayer((prev) => ({
									...prev,
									isPlaying: e.target.checked,
								}))
							}
						/>
						Playing
					</label>
					<br /><br />
					<button onClick={addPlayer}>Voeg speler toe</button>
					<br /><br />
					<h3>Spelerslijst</h3>
					<ul>
						{players.map((p, i) => (
							<li key={i}>
								#{p.number} - {p.position} {p.isPlaying ? "(Playing)" : ""}
							</li>
						))}
					</ul>
					<button onClick={() => setSelectedTeam(null)}>Kies ander team</button>
					<button onClick={goToMatch}>Volgende</button>
				</div>
			)}
		</div>
	);
}

export default LiveStats;
