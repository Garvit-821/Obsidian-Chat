import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import ChatRoom from './components/ChatRoom';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/auth/me', {
        withCredentials: true
      });
      setUser(response.data.user);
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="terminal-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-neon-green text-xl font-mono glow-text mb-4">
            [ INITIALIZING TERMINAL ]
          </div>
          <div className="cursor-blink text-neon-cyan">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <ChatRoom user={user} onLogout={handleLogout} />
      ) : (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;