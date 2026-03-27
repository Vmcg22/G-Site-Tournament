import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Tournaments from "./pages/Tournaments";
import AdminDashboard from "./pages/AdminDashboard";
import Leaderboard from "./pages/Leaderboard";
import TopFraggersPage from "./pages/TopFraggersPage";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with navbar */}
        <Route path="/" element={<><Navbar /><Landing /></>} />
        <Route path="/tournaments" element={<><Navbar /><Tournaments /></>} />
        <Route path="/admin/:tournamentId" element={<><Navbar /><AdminDashboard /></>} />

        {/* Full-screen display pages — no navbar */}
        <Route path="/leaderboard/:tournamentId" element={<Leaderboard />} />
        <Route path="/top-fraggers/:tournamentId" element={<TopFraggersPage />} />
      </Routes>
    </BrowserRouter>
  );
}
