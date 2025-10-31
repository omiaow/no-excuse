import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';
import MainPage from './components/MainPage';
import ExercisePage from './components/exercise/ExercisePage';

import HistoryPage from './components/HistoryPage';
import ProgramPage from './components/ProgramPage';

function App() {
  const [currentPage, setCurrentPage] = useState('main');

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.disableVerticalSwipes();
    WebApp.enableClosingConfirmation();
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
          <span className="app__nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 15H8M11 15H13M16 15H18M6 18H8M11 18H13M16 18H18M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="app__nav-label">History</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'main' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('main')}
        >
          <span className="app__nav-icon">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" width="24" height="24">
              <circle fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" cx="23" cy="7" r="3"/>
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M8,10l2.8-2.8C12,6,14,6,15.2,7.2l7.9,7.9c1.1,1.1,2.8,1.2,4.1,0.2L30,13"/>
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M17,10l-4.7,4.7c-1.5,1.5-1,4.2,1,5l3.9,1.5c1.1,0.4,1.9,1.5,1.9,2.7v6"/>
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M14,20l-2.6,2.6c-0.8,0.8-2.1,0.8-2.8,0L5,19"/>
              <line fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" x1="16" y1="18" x2="21" y2="13"/>
            </svg>
          </span>
          <span className="app__nav-label">Start</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'program' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('program')}
        >
          <span className="app__nav-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 8L16 8.00053M11 12L16 12.0005M11 16L16 16.0005M8 16H8.01M8 12H8.01M8 8H8.01M7.2 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.0799 20 7.2V16.8C20 17.9201 20 18.4802 19.782 18.908C19.5903 19.2843 19.2843 19.5903 18.908 19.782C18.4802 20 17.9201 20 16.8 20H7.2C6.0799 20 5.51984 20 5.09202 19.782C4.71569 19.5903 4.40973 19.2843 4.21799 18.908C4 18.4802 4 17.9201 4 16.8V7.2C4 6.0799 4 5.51984 4.21799 5.09202C4.40973 4.71569 4.71569 4.40973 5.09202 4.21799C5.51984 4 6.0799 4 7.2 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="app__nav-label">Program</span>
        </button>
      </div>
    </div>
  );
}

export default App;
