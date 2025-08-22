import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import UserStories from "./pages/stories/UserStories";
import StoryView from "./pages/stories/StoryView";
import StoryForm from "./pages/stories/StoryForm";
import Header from "./components/Header";
import TagList from "./pages/tags/TagList";
import TagView from "./pages/tags/TagView";
import TagEdit from "./pages/tags/TagEdit";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<UserStories />} />
        <Route path="/stories" element={<UserStories />} />
        <Route path="/stories/new" element={<StoryForm />} />
        <Route path="/stories/:id" element={<StoryView />} />
        <Route path="/stories/:id/edit" element={<StoryForm />} />
        <Route path="/tags" element={<TagList />} />
        <Route path="/tags/:id" element={<TagView />} />
        <Route path="/tags/:id/edit" element={<TagEdit />} />
      </Routes>
    </Router>
  );
};

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(<App />);
