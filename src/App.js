import React, { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import './App.css';
import SquatPage from './components/SquatPage';
import MainPage from './components/MainPage';
import PushUpPage from './components/PushUpPage';

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

  const renderPage = () => {
    switch (currentPage) {
      case 'squat':
        return <SquatPage />;
      case 'main':
        return <MainPage />;
      case 'push-up':
        return <PushUpPage />;
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
          className={`app__nav-button ${currentPage === 'squat' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('squat')}
        >
          <span className="app__nav-icon">🏠</span>
          <span className="app__nav-label">Приседание</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'main' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('main')}
        >
          <span className="app__nav-icon">🏃</span>
          <span className="app__nav-label">Главное</span>
        </button>
        <button 
          className={`app__nav-button ${currentPage === 'push-up' ? 'app__nav-button--active' : ''}`}
          onClick={() => setCurrentPage('push-up')}
        >
          <span className="app__nav-icon">⚙️</span>
          <span className="app__nav-label">Отжимание</span>
        </button>
      </div>
    </div>
  );
}

export default App;
