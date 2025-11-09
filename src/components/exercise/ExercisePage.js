import React, { useState } from 'react';
import CameraView from './CameraView';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function ExercisePage({ onClose }) {

    const [records, setRecords] = useState([]);

    return (
        <>
            <CameraView setRecords={setRecords} />
            {records.length > 0 && (
                <div className="history-page__list-container" style={{ padding: '20px' }}>
                    <h2 className="history-page__list-title">Exercise Records</h2>
                    <div className="history-page__list">
                        <div className="date-group__exercises">
                            {records.map((record, index) => (
                                <div key={index} className="exercise-card">
                                    <div className="exercise-card__header">
                                        <div>
                                            <h4 className="exercise-card__name">{record.name}</h4>
                                            <div className="exercise-card__meta">
                                                <span className="exercise-card__meta-item">Reps: {record.count}</span>
                                                <span className="exercise-card__meta-separator">•</span>
                                                <span className="exercise-card__meta-item">Time: {formatDuration(record.duration)}</span>
                                                <span className="exercise-card__meta-separator">•</span>
                                                <span className="exercise-card__meta-item">Score: {record.averageScore.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ExercisePage;
