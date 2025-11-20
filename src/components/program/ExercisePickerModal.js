import React, { useState, useCallback, useEffect } from 'react';
import SkeletonCard from './SkeletonCard';
import useHttp from '../../hooks/http.hook';

const EXERCISE_ICONS = {
  "1": '💪',
  "2": '🦵',
};

function ExercisePickerModal({ onChoose, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [error, setError] = useState(null);
  const { loading, request } = useHttp();

  const handleRequestClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 220);
  }, [isClosing, onClose]);

  useEffect(() => {
    let mounted = true;
    const fetchExercises = async () => {
      try {
        const data = await request('/app/exercises', 'GET');
        if (mounted) {
          setExercises(
            (data || []).map(ex => ({
              id: ex.id,
              name: ex.name,
              key: `exercise_${ex.id}`,
            }))
          );
        }
      } catch (e) {
        if (mounted) {
          setError('Failed to load exercises');
        }
      }
    };
    fetchExercises();
    return () => {
      mounted = false;
    };
  }, [request]);

  const handleChoose = (exercise) => {
    if (!exercise || loading) return;
    onChoose(exercise);
  };

  return (
    <div className={`program-modal ${isClosing ? 'program-modal--closing' : ''}`} onClick={handleRequestClose}>
      <div className="program-modal__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="program-modal__header">
          <div className="program-modal__title">Choose exercise</div>
        </div>
        {loading && (
          <div className="program-modal__list program-modal__list--loading">
            <SkeletonCard />
          </div>
        )}
        {!loading && error && (
          <div className="program-modal__list program-modal__list--error">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className="program-modal__list">
            {exercises.map(ex => (
              <button
                key={ex.key}
                className="program-modal__item"
                onClick={() => handleChoose(ex)}
              >
                <span className="program-modal__icon">{EXERCISE_ICONS[ex.id] || '🏋️'}</span>
                <span className="program-modal__label">{ex.name}</span>
              </button>
            ))}
          </div>
        )}
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
