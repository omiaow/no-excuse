import React from 'react';
import ExerciseTimer from './ExerciseTimer';

export default function BreakModal({ time, timeLimit, setTime }) {
  return (
    <div className="smart-counter-break-modal">
      <div className="smart-counter-break-modal-content">
        {time !== undefined && (
          <ExerciseTimer 
            time={time} 
            setTime={setTime} 
            timeLimit={timeLimit} 
            isBreak={true} 
          />
        )}
        <div className="smart-counter-break-title">Break Time</div>
        <div className="smart-counter-break-message">Take a rest before continuing</div>
      </div>
    </div>
  );
}