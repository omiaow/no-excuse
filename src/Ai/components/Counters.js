import React from 'react';
import ExerciseTimer from './ExerciseTimer';

export default function Counters({ count, time, timeLimit, setTime }) {
  return (
    <>
      <div className="smart-counter-count-container">
        <div className="smart-counter-count-number">
          {count || 0}
        </div>
      </div>
      
      {time !== undefined && (
        <ExerciseTimer 
          time={time} 
          setTime={setTime}
          timeLimit={timeLimit} 
          isBreak={false} 
        />
      )}
    </>
  );
}