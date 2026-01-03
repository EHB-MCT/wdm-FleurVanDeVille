import "./Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1>Welcome to VolleyTrack</h1>
            <p>Your ultimate volleyball match tracking app.</p>
            <div className="home-buttons">
                <button
                    className="home-button"
                    onClick={() => navigate("/live-stats")}
                >
                    Start New Match
                </button>
            </div>
        </div>
    );
}

export default Home;
