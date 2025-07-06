import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Hunt } from "./pages/Hunt";
import { Gallery } from "./pages/Gallery";
import GalPage from "./pages/Gal/GalPage";
import VisitedGalsGallery from "./pages/VisitedGalsGallery";
import UnvisitedGalsGallery from "./pages/UnvisitedGalsGallery";
import ModelsList from "./pages/Models/ModelsList";
import { ScrapeByURL } from "./pages/Navbar/ScrapeByURL";
import ModelPage from "./pages/Models/ModelPage";
import { HuntQuickButton } from "./pages/HuntComponents/HuntQuickButton";

const App = () => {
  return (
    <Router>
      <header>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/stories">Stories</Link>
            </li>
            <li>
              <a href="http://localhost:3056/full-recalculate_score-rating" target="_blank" rel="noopener noreferrer">Recalculate Score Rating</a>
            </li>
          </ul>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<UserStories />} />
        <Route path="/stories" element={<UserStories />} />
      </Routes>
    </Router>
  );
};

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(<App />);
