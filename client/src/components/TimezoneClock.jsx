import React, { useState, useEffect } from 'react';

const TimezoneClock = () => {
  const [time, setTime] = useState(new Date());

  const timezones = [
    { name: 'UTC', offset: 0 },
    { name: 'New York', offset: -5 }, // EST
    { name: 'London', offset: 0 }, // GMT
    { name: 'Tokyo', offset: 9 },
    { name: 'Sydney', offset: 11 },
    { name: 'Los Angeles', offset: -8 }, // PST
    { name: 'Berlin', offset: 1 }, // CET
    { name: 'Moscow', offset: 3 },
    { name: 'Dubai', offset: 4 },
    { name: 'Hong Kong', offset: 8 },
    { name: 'Singapore', offset: 8 },
    { name: 'Paris', offset: 1 } // CET
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (timezone) => {
    const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone.offset * 3600000));
    
    return localTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone.offset === 0 ? 'UTC' : undefined
    });
  };

  const formatDate = (timezone) => {
    const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone.offset * 3600000));
    
    return localTime.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      timeZone: timezone.offset === 0 ? 'UTC' : undefined
    });
  };

  return (
    <div className="terminal-window">
      <div className="terminal-titlebar">
        <span>WORLD CLOCKS</span>
        <div className="terminal-buttons">
          <div className="terminal-button-dot close"></div>
          <div className="terminal-button-dot minimize"></div>
          <div className="terminal-button-dot maximize"></div>
        </div>
      </div>
      <div className="terminal-content">
        <div className="timezone-clocks">
          {timezones.map((timezone, index) => (
            <div key={index} className="timezone-item">
              <div className="timezone-name">
                {timezone.name}
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af',
                  marginLeft: '0.5rem'
                }}>
                  ({timezone.offset >= 0 ? '+' : ''}{timezone.offset}h)
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="timezone-time">
                  {formatTime(timezone)}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af',
                  marginTop: '0.125rem'
                }}>
                  {formatDate(timezone)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimezoneClock;

