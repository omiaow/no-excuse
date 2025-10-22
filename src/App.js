import React, { useState } from 'react';
import './App.css';
import HomePage from './components/HomePage';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app">
      <div className="app__main-content">
        {renderPage()}
      </div>
      
      <div className="app__bottom-navigation">
        <button 
          className={`app__nav-button ${currentPage === 'home' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('home')}
        >
          <span className="app__nav-icon">🏠</span>
          <span className="app__nav-label">Home</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'stats' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('stats')}
        >
          <span className="app__nav-icon">📊</span>
          <span className="app__nav-label">Stats</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'settings' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          <span className="app__nav-icon">⚙️</span>
          <span className="app__nav-label">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default App;
