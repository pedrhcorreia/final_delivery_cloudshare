import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AuthContainer from './pages/Authentication';
import { getCookie } from './utils/cookies';
import { CurrentDirProvider } from './CurrentDirContext'; 
import './index.css'

export function App() {
  const isAuthenticated = !!getCookie('accessToken');

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthContainer />} />
      
        <Route path="/home" element={ <CurrentDirProvider><Home /></CurrentDirProvider> } />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />} />
      </Routes>
    </Router>
  );
}
