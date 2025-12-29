import { useLocation } from "react-router-dom";

function LiveMatch() {
	const location = useLocation();
	const { team, players } = location.state || {};

	if (!team) {
		return <p>Geen team geselecteerd</p>;
	}

	return (
		<div className="live-stats-container">
			<h1>Live Match</h1>
			<h2>{team.teamName}</h2>

			<h3>Spelende speelsters</h3>
			<ul>
				{players
					.filter(p => p.isPlaying)
					.map(p => (
						<li key={p.number}>
							#{p.number} - {p.position}
						</li>
					))}
			</ul>
		</div>
	);
}

export default LiveMatch;

