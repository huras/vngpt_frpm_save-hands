import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import UserStories from "./pages/stories/UserStories";
import StoryView from "./pages/stories/StoryView";
import StoryForm from "./pages/stories/StoryForm";

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
        <Route path="/stories/new" element={<StoryForm />} />
        <Route path="/stories/:id" element={<StoryView />} />
        <Route path="/stories/:id/edit" element={<StoryForm />} />
      </Routes>
    </Router>
  );
};

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(<App />);
