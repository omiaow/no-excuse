import React from 'react';

function MainPage({ onStartExercise }) {
  return (
    <div className="app__page app__page--stats" style={{ paddingTop: '270px' }}>
      <h1 className="app__page-title">Day 100 with No Excuse</h1>
      <p className="app__page-description">Your personal training partner</p>
      <button className="button" onClick={onStartExercise}>
        <div className="wrap">
          <p>Let's Go</p>
        </div>
      </button>
    </div>
  );
}

export default MainPage;
