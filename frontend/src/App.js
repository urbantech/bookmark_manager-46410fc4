import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider, useAINativeAuth } from '@ainative/react-sdk';
import BookmarkCreation from './components/BookmarkCreation';
import BookmarkListing from './components/BookmarkListing';
import BookmarkRemoval from './components/BookmarkRemoval';
import LoginPage from './components/LoginPage';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ainative_token');
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('https://api.ainative.studio/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('ainative_token', data.access_token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    setIsLoggedIn(false);
  };

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <Router>
        <nav className="bg-darkNavy text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Bookmark Manager</h1>
            <ul className="flex space-x-4">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link to="/create" className="hover:text-blue-300">Create</Link>
                  </li>
                  <li>
                    <Link to="/list" className="hover:text-blue-300">List</Link>
                  </li>
                  <li>
                    <Link to="/remove" className="hover:text-blue-300">Remove</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="hover:text-blue-300">Logout</button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="hover:text-blue-300">Login</Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
        <main className="container mx-auto mt-8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Routes>
              <Route path="/login" element={!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/list" />} />
              <Route path="/create" element={isLoggedIn ? <BookmarkCreation /> : <Navigate to="/login" />} />
              <Route path="/list" element={isLoggedIn ? <BookmarkListing /> : <Navigate to="/login" />} />
              <Route path="/remove" element={isLoggedIn ? <BookmarkRemoval /> : <Navigate to="/login" />} />
              <Route path="/" element={<Navigate to="/list" />} />
            </Routes>
          )}
        </main>
      </Router>
    </AINativeProvider>
  );
};

export default App;