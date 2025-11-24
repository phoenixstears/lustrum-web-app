import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TournamentPage from './tournamentPage.tsx';
import HomePage from './homePage.tsx';

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lol" element={<TournamentPage />} />
        <Route path="/cs2" element={<TournamentPage />} />
        <Route path="/valorant" element={<TournamentPage />} />
      </Routes>
      </Router>
    </>
  )
}



export default App
