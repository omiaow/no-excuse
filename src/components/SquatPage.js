import React, { useState, useEffect } from 'react';
import SmartCounter from '../Ai/SmartCounter';
import './SquatPage.css';

function SquatPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showSmartCounter, setShowSmartCounter] = useState(false);

  useEffect(() => {
    // Trigger slide down animation when component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
      setShowSmartCounter(true);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      // You can add navigation logic here if needed
      setShowSmartCounter(false);
    }, 300);
  };

  return (
    <div className={`squat-page-container ${isVisible ? 'slide-down' : ''} ${isClosing ? 'slide-up' : ''}`}>
      <div className="squat-page-content">
        <button className="close-button" onClick={handleClose}>
        <svg fill="#ffffff" viewBox="-2 0 20 20" xmlns="http://www.w3.org/2000/svg" className="cf-icon-svg">
          <path d="M15.3 15.32a1.026 1.026 0 0 1-.727-.302L8.5 8.946l-6.073 6.072a1.03 1.03 0 0 1-1.456-1.455l6.801-6.8a1.03 1.03 0 0 1 1.456 0l6.8 6.8a1.03 1.03 0 0 1-.727 1.757z"/>
        </svg>
        </button>
        {showSmartCounter && <SmartCounter exercise="squat" />}
      </div>
    </div>
  );
}

export default SquatPage;
