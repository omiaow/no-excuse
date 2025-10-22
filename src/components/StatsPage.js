import React from 'react';

function StatsPage() {
  return (
    <div className="app__page app__page--stats">
      <h1 className="app__page-title">Statistics</h1>
      <div className="app__stats-grid">
        <div className="app__stat-card">
          <h3>Tasks Completed</h3>
          <p className="app__stat-number">0</p>
        </div>
        <div className="app__stat-card">
          <h3>Streak</h3>
          <p className="app__stat-number">0 days</p>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
