import React from 'react';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ExerciseHistoryList = ({ groupedExercises }) => {
  return (
    <div className="history-page__list-container">
      <h2 className="history-page__list-title">Exercise History</h2>
      <div className="history-page__list">
        {groupedExercises.map((dateGroup) => (
          <div key={dateGroup.date} className="date-group">
            <h3 className="date-group__header">
              {new Date(dateGroup.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <div className="date-group__exercises">
              {dateGroup.exercises.map((exercise) => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-card__header">
                    <div>
                      <h4 className="exercise-card__name">{exercise.name}</h4>
                      <div className="exercise-card__meta">
                        <span className="exercise-card__meta-item">Reps: {exercise.count}</span>
                        <span className="exercise-card__meta-separator">•</span>
                        <span className="exercise-card__meta-item">Time: {formatDuration(exercise.duration)}</span>
                        <span className="exercise-card__meta-separator">•</span>
                        <span className="exercise-card__meta-item">Sets: {exercise.sets}</span>
                      </div>
                    </div>
                    {/* <span className={`exercise-card__score exercise-card__score--${exercise.score >= 95 ? 'excellent' : exercise.score >= 85 ? 'good' : 'average'}`}>
                      {exercise.score}%
                    </span> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseHistoryList;
