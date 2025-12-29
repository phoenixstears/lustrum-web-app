import './App.css'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
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
        <Route path="/aram" element={<TournamentPage />} />
        <Route path="/geoguessr" element={<TournamentPage />} />
        <Route path="/mc" element={<TournamentPage />} />
        <Route path="/osu" element={<TournamentPage />} />
        <Route path="/pokemon" element={<TournamentPage />} />
        <Route path="/smash" element={<TournamentPage />} />
        <Route path="/tft" element={<TournamentPage />} />
        <Route path="/trackmania" element={<TournamentPage />} />
      </Routes>
      </Router>
    </>
  )
}



export default App
