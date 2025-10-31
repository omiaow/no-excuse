import React, { useState, useCallback } from 'react';

const EXERCISE_ICONS = {
  push_ups: '💪',
  squats: '🦵',
  plank: '🧘',
  jumping_jacks: '🤸',
  lunges: '🦵',
  sit_ups: '🏋️',
};

function ExercisePickerModal({ exercises, onChoose, onClose }) {
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
          <div className="program-modal__title">Choose exercise</div>
        </div>
        <div className="program-modal__list">
          {exercises.map(ex => (
            <button key={ex.key} className="program-modal__item" onClick={() => onChoose(ex.key)}>
              <span className="program-modal__icon">{EXERCISE_ICONS[ex.key]}</span>
              <span className="program-modal__label">{ex.label}</span>
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

export default ExercisePickerModal;
