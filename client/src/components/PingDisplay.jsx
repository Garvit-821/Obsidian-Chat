import React, { useState, useEffect } from 'react';

const PingDisplay = ({ socket }) => {
  const [ping, setPing] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const measurePing = () => {
      const start = Date.now();
      socket.emit('ping', { timestamp: start });
    };

    // Listen for pong response
    const handlePong = (data) => {
      const pingTime = Date.now() - data.timestamp;
      setPing(pingTime);
    };

    // Listen for connection status
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setPing(0);
    };

    socket.on('pong', handlePong);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Measure ping every 5 seconds
    const interval = setInterval(measurePing, 5000);

    // Initial ping measurement
    measurePing();

    return () => {
      clearInterval(interval);
      socket.off('pong', handlePong);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  const getPingStatus = (ping) => {
    if (ping === 0) return { text: 'Disconnected', color: '#ff4444' };
    if (ping < 50) return { text: 'Excellent', color: '#00ff6a' };
    if (ping < 100) return { text: 'Good', color: '#00eaff' };
    if (ping < 200) return { text: 'Fair', color: '#ffbd2e' };
    return { text: 'Poor', color: '#ff4444' };
  };

  const status = getPingStatus(ping);

  return (
    <div className="terminal-window">
      <div className="terminal-titlebar">
        <span>CONNECTION STATUS</span>
        <div className="terminal-buttons">
          <div className="terminal-button-dot close"></div>
          <div className="terminal-button-dot minimize"></div>
          <div className="terminal-button-dot maximize"></div>
        </div>
      </div>
      <div className="terminal-content">
        <div className="ping-display">
          <div className="status-item" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <div 
              className="status-indicator" 
              style={{ 
                background: isConnected ? '#00ff6a' : '#ff4444',
                animation: isConnected ? 'pulse 2s infinite' : 'none'
              }}
            ></div>
            <span style={{ color: isConnected ? '#00ff6a' : '#ff4444' }}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          
          <div className="ping-value" style={{ color: status.color }}>
            {ping > 0 ? `${ping}ms` : '--'}
          </div>
          
          <div className="ping-label" style={{ color: status.color }}>
            {status.text}
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            fontSize: '0.75rem', 
            color: '#9ca3af',
            textAlign: 'center'
          }}>
            <div>Server: darkweb-chatroom.local</div>
            <div>Protocol: WebSocket</div>
            <div>Encryption: TLS 1.3</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PingDisplay;

