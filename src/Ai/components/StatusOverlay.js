import React from 'react';

export default function StatusOverlay({ status }) {
  return (
    <div className="smart-counter-loading-overlay">
      <div className="smart-counter-loading-content">
        <h2 className="smart-counter-loading-title">{status}</h2>
      </div>
    </div>
  );
}