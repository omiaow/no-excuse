import React from 'react';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const StatisticsCards = ({ stats, totalSessions }) => {
  return (
    <div className="history-page__stats-cards" style={{ marginBottom: '0px' }}>
      <div className="stat-card">
        <div className="stat-card__icon">📊</div>
        <div className="stat-card__value">{stats.totalCount}</div>
        <div className="stat-card__label">Total Reps</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__icon">⏱️</div>
        <div className="stat-card__value">{formatDuration(stats.totalDuration)}</div>
        <div className="stat-card__label">Total Time</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__icon">⭐</div>
        <div className="stat-card__value">{stats.avgScore}%</div>
        <div className="stat-card__label">Avg Score</div>
      </div>
      <div className="stat-card">
        <div className="stat-card__icon">💪</div>
        <div className="stat-card__value">{totalSessions}</div>
        <div className="stat-card__label">Sessions</div>
      </div>
    </div>
  );
};

export default StatisticsCards;
