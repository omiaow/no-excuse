import React, { useState, useCallback } from 'react';

function TimePickerModal({ title = 'Choose time', options, onChoose, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleRequestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 220);
  }, [isClosing, onClose]);

  return (
    <div className={`program-modal ${isClosing ? 'program-modal--closing' : ''}`} onClick={handleRequestClose}>
      <div className="program-modal__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="program-modal__header">
          <div className="program-modal__title">{title}</div>
        </div>
        <div className="program-modal__list">
          {options.map(opt => (
            <button key={opt.value} className="program-modal__item" onClick={() => onChoose(opt.value)}>
              <span className="program-modal__icon">🕒</span>
              <span className="program-modal__label">{opt.label} minutes</span>
            </button>
          ))}
        </div>
      </div>

      <button className="program-modal__close-bottom" onClick={(e) => { e.stopPropagation(); handleRequestClose(); }} aria-label="Close">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

export default TimePickerModal;
