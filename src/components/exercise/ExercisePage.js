import React, { useState } from 'react';
import CameraView from './CameraView';
import useHttp from '../../hooks/http.hook';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function ExercisePage({ page }) {
    const { request } = useHttp();

    const [records, setRecords] = useState([]);

    const handleSave = async () => {
        try {
            await request('/app/records', 'POST', records.map(record => ({
                exercise_id: record.id,
                reps_count: record.count,
                duration: record.duration,
                sets_count: 1,
                score: parseInt(record.averageScore),
                date: new Date().toISOString(),
                paid: false,
            })));
            page?.('history');
        } catch (error) {
            console.error('Failed to save records:', error);
        }
    };

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
                                                <span className="exercise-card__meta-item">Score: {parseInt(record.averageScore)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="history-page__list-button" onClick={handleSave}>Save</button>
                </div>
            )}
            {records.length === 0 && (
                <div className="history-page__list-container" style={{ padding: '20px' }}>
                    <button className="history-page__list-button" onClick={() => page?.('program')}>Exercise programs</button>
                </div>
            )}
        </>
    );
}

export default ExercisePage;
