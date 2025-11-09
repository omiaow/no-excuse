import React, { useEffect } from 'react';

export default function ExerciseTimer({ time, setTime, timeLimit, isBreak = false }) {

  useEffect(() => {
    if (time >= timeLimit) return;

    const timer = setInterval(() => {
      setTime(time + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  const formatTime = () => {
    if (timeLimit) {
      const remaining = timeLimit - time;
      return Math.floor(remaining / 60) + ':' + (remaining % 60).toString().padStart(2, '0');
    } else {
      return Math.floor(time / 60) + ':' + (time % 60).toString().padStart(2, '0');
    }
  };

  return (
    <div className={`smart-counter-timer-container ${isBreak ? 'smart-counter-timer-break' : 'smart-counter-timer-normal'}`}>
      <div className="smart-counter-timer-text">
        {formatTime()}
      </div>
      <div className="smart-counter-timer-subtext">
      </div>
    </div>
  );
}

