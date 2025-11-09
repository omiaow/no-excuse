import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';
import MainPage from './components/MainPage';
import ExercisePage from './components/exercise/ExercisePage';
import HistoryPage from './components/HistoryPage';
import ProgramPage from './components/ProgramPage';
import Navigation from './components/Navigation';

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
    setCurrentPage('history');
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
        return <ExercisePage close={handleCloseExercise} />;
      default:
        return <MainPage />;
    }
  };

  return (
    <div className="app">
      <div className="app__main-content">
        {renderPage()}
      </div>
      
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

export default App;
