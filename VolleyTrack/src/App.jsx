import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LiveStats from './pages/LiveStats.jsx';
import Home from './pages/Home.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live-stats" element={<LiveStats />} />
      </Routes>
    </Router>
  );
}

export default App;
