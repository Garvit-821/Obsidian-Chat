import React, { useState, useEffect } from 'react';

const SystemInfo = ({ user, currentRoom, messageCount }) => {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setUptime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSystemLoad = () => {
    // Simulate system load based on message count and uptime
    const load = Math.min(100, Math.floor((messageCount * 0.1) + (uptime * 0.01)));
    return load;
  };

  const getMemoryUsage = () => {
    // Simulate memory usage
    const usage = Math.min(100, Math.floor(45 + (messageCount * 0.05) + (uptime * 0.02)));
    return usage;
  };

  const getNetworkStatus = () => {
    return 'STABLE';
  };

  return (
    <div className="terminal-window">
      <div className="terminal-titlebar">
        <span>SYSTEM STATUS</span>
        <div className="terminal-buttons">
          <div className="terminal-button-dot close"></div>
          <div className="terminal-button-dot minimize"></div>
          <div className="terminal-button-dot maximize"></div>
        </div>
      </div>
      <div className="terminal-content">
        <div className="system-info">
          <div className="system-info-line">
            <span className="system-info-label">User:</span>
            <span className="system-info-value">{user?.username || 'guest'}</span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Current Room:</span>
            <span className="system-info-value">{currentRoom}</span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Session Uptime:</span>
            <span className="system-info-value">{formatUptime(uptime)}</span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Messages Sent:</span>
            <span className="system-info-value">{messageCount}</span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">System Load:</span>
            <span className="system-info-value" style={{ 
              color: getSystemLoad() < 50 ? '#00ff6a' : getSystemLoad() < 80 ? '#ffbd2e' : '#ff4444'
            }}>
              {getSystemLoad()}%
            </span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Memory Usage:</span>
            <span className="system-info-value" style={{ 
              color: getMemoryUsage() < 60 ? '#00ff6a' : getMemoryUsage() < 85 ? '#ffbd2e' : '#ff4444'
            }}>
              {getMemoryUsage()}%
            </span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Network:</span>
            <span className="system-info-value" style={{ color: '#00ff6a' }}>
              {getNetworkStatus()}
            </span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Browser:</span>
            <span className="system-info-value">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Connection:</span>
            <span className="system-info-value">WebSocket</span>
          </div>
          
          <div className="system-info-line">
            <span className="system-info-label">Last Update:</span>
            <span className="system-info-value">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;

