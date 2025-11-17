import React from 'react';

function LoadingOverlay({
  text = 'Loading...',
  overlayClassName = '',
  cardClassName = '',
  spinnerClassName = '',
  textClassName = '',
}) {
  const overlayClasses = ['loading-overlay', overlayClassName].filter(Boolean).join(' ');
  const cardClasses = ['loading-overlay__card', cardClassName].filter(Boolean).join(' ');
  const spinnerClasses = ['loading-overlay__spinner', spinnerClassName].filter(Boolean).join(' ');
  const textClasses = ['loading-overlay__text', textClassName].filter(Boolean).join(' ');

  return (
    <div className={overlayClasses} aria-live="polite" role="status">
      <div className={cardClasses}>
        <div className={spinnerClasses} />
        <p className={textClasses}>{text}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;

