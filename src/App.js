import React, { useState } from 'react';
import './App.css';
import MainPage from './components/MainPage';
import ExercisePage from './components/exercise/ExercisePage';
import HistoryPage from './components/HistoryPage';
import ProgramPage from './components/ProgramPage';
import Navigation from './components/Navigation';

function App() {
  const [currentPage, setCurrentPage] = useState('main');

  const handleStartExercise = () => {
    setCurrentPage('exercise');
  };

  const handleCloseExercise = (page) => {
    setCurrentPage(page);
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
        return <ExercisePage page={handleCloseExercise} />;
      default:
        return <MainPage />;
    }
  };

  return (
    <>
      <div className="app__main-content">
        {renderPage()}
      </div>
      
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </>
  );
}

export default App;
