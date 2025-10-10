import React, { useState, useEffect } from 'react';

const MemberList = ({ members, socket }) => {
  const [pingData, setPingData] = useState({});

  useEffect(() => {
    // Measure ping for each member
    const measurePing = (username) => {
      const start = Date.now();
      
      // Send ping request
      if (socket) {
        socket.emit('ping', { username, timestamp: start });
      }
      
      // Listen for pong response
      const handlePong = (data) => {
        if (data.username === username) {
          const ping = Date.now() - data.timestamp;
          setPingData(prev => ({
            ...prev,
            [username]: ping
          }));
        }
      };

      socket?.on('pong', handlePong);
      
      // Cleanup listener
      return () => {
        socket?.off('pong', handlePong);
      };
    };

    // Measure ping for all members every 10 seconds
    const interval = setInterval(() => {
      members.forEach(member => {
        measurePing(member.username);
      });
    }, 10000);

    // Initial ping measurement
    members.forEach(member => {
      measurePing(member.username);
    });

    return () => clearInterval(interval);
  }, [members, socket]);

  const getPingColor = (ping) => {
    if (ping < 50) return '#00ff6a'; // Green - Excellent
    if (ping < 100) return '#00eaff'; // Cyan - Good
    if (ping < 200) return '#ffbd2e'; // Yellow - Fair
    return '#ff4444'; // Red - Poor
  };

  return (
    <div className="terminal-window">
      <div className="terminal-titlebar">
        <span>ACTIVE MEMBERS ({members.length})</span>
        <div className="terminal-buttons">
          <div className="terminal-button-dot close"></div>
          <div className="terminal-button-dot minimize"></div>
          <div className="terminal-button-dot maximize"></div>
        </div>
      </div>
      <div className="terminal-content">
        <div className="member-list">
          {members.length === 0 ? (
            <div className="text-center" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              No active members
            </div>
          ) : (
            members.map((member, index) => (
              <div key={member.username || index} className="member-item">
                <div className="member-status" style={{ 
                  background: member.isOnline ? '#00ff6a' : '#ff4444',
                  animation: member.isOnline ? 'pulse 1.5s infinite' : 'none'
                }}></div>
                <div className="member-username">
                  {member.username || 'Anonymous'}
                </div>
                <div className="member-ping" style={{ 
                  color: getPingColor(pingData[member.username] || 0)
                }}>
                  {pingData[member.username] ? `${pingData[member.username]}ms` : '--'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberList;

