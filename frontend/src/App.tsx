import './App.css'
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import TournamentPage from './tournamentPage.tsx';
import RegisterPage from './registerPage.tsx';
import HomePage from './homePage.tsx';

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournament/:id" element={<TournamentPage />} />
        <Route path="/tournament/:id/register" element={<RegisterPage />} />
      </Routes>
      </Router>
    </>
  )
}



export default App
