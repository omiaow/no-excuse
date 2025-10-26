import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';
import MainPage from './components/MainPage';
import ExercisePage from './components/ExercisePage';

import HistoryPage from './components/HistoryPage';
import ProgramPage from './components/ProgramPage';

function App() {
  const [currentPage, setCurrentPage] = useState('main');

  useEffect(() => {  // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();
    WebApp.disableVerticalSwipes();
    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor("#024A70");
    WebApp.setBottomBarColor("#024A70");
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', '#000000');
  }, []);

  const handleStartExercise = () => {
    setCurrentPage('exercise');
  };

  const handleCloseExercise = () => {
    setCurrentPage('main');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'history':
        return <HistoryPage />;
      case 'program':
        return <ProgramPage />;
      case 'main':
        return <MainPage onStartExercise={handleStartExercise} />;
      case 'exercise':
        return <ExercisePage onClose={handleCloseExercise} />;
      default:
        return <MainPage />;
    }
  };

  return (
    <div className="app">
      <div className="app__main-content">
        {renderPage()}
      </div>
      
      <div className="app__bottom-navigation">
        <button 
          className={`app__nav-button ${currentPage === 'history' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('history')}
        >
          <span className="app__nav-icon">🏠</span>
          <span className="app__nav-label">History</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'main' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('main')}
        >
          <span className="app__nav-icon">🏃</span>
          <span className="app__nav-label">Start</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'program' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('program')}
        >
          <span className="app__nav-icon">⚙️</span>
          <span className="app__nav-label">Program</span>
        </button>
      </div>
    </div>
  );
}

export default App;
