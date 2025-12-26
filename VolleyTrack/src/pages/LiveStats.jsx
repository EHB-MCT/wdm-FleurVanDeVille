import "./LiveStats.css";
import { useState } from "react";

function LiveStats() {
	const [players, setPlayers] = useState(
		Array.from({ length: 14 }, (_, i) => ({
			number: "",
			position: "",
			isPlaying: false
		}))
	);

	const handlePlayerChange = (index, field, value) => {
		const updatedPlayers = [...players];
		updatedPlayers[index] = {
			...updatedPlayers[index],
			[field]: value
		};
		setPlayers(updatedPlayers);
	};

	return (
		<div className="live-stats-container">
			<h1>Live Stats</h1>
			<div className="players-container">
				<div className="home-players">
					<h2>Who is playing in your team?</h2>
					{players.map((player, index) => (
						<div key={index} className="player-field">
							<h3>Player {index + 1}</h3>
							<div className="player-inputs">
								<input
									type="text"
									placeholder="Number"
									value={player.number}
									onChange={(e) => handlePlayerChange(index, "number", e.target.value)}
									className="player-number"
								/>
								<select
									value={player.position}
									onChange={(e) => handlePlayerChange(index, "position", e.target.value)}
									className="player-position"
								>
									<option value="">Position</option>
									<option value="RS">RS</option>
									<option value="OH">OH</option>
									<option value="L">L</option>
									<option value="S">S</option>
									<option value="M">M</option>
								</select>
								<label className="playing-status">
									<input
										type="checkbox"
										checked={player.isPlaying}
										onChange={(e) => handlePlayerChange(index, "isPlaying", e.target.checked)}
									/>
									Playing
								</label>
							</div>
						</div>
					))}
				</div>
				<button className="submit-button">Submit</button>
			</div>
		</div>
	);
}

export default LiveStats;
