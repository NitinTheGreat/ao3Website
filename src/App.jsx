import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import SignUp from '../components/SignUp';
import Dashboard from './pages/dashboard'; // Corrected import
// import NotesPage from './pages/Notes';
import Component from './pages/notes';
import Bookmarks from './pages/bookmarks';
import History from './pages/history';
import Protect from './utils/Protected';
import SettingsPage from './pages/settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<Protect />}>
          <Route path="/" element={<Dashboard />} /> {/* Dashboard as landing page */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Component />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
