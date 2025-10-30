import React from 'react';

function MainPage({ onStartExercise }) {
  return (
    <div className="app__page app__page--stats" style={{ paddingTop: '250px' }}>
      <h1 className="app__page-title">Day 2 with No Excuse</h1>
      <p className="app__page-description">Your personal training partner</p>
      <button className="start-button" onClick={onStartExercise}>
        <div className="wrap">
          <p>Let's Go</p>
        </div>
      </button>
    </div>
  );
}

export default MainPage;
