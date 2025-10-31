import React, { useMemo, useState, useEffect } from 'react';
import ExercisePickerModal from './program/ExercisePickerModal';
import TimePickerModal from './program/TimePickerModal';

// Basic catalog of exercises. Feel free to expand.
const EXERCISE_CATALOG = [
  { key: 'push_ups', label: 'Push-ups' },
  { key: 'squats', label: 'Squats' },
  { key: 'plank', label: 'Plank' },
  { key: 'jumping_jacks', label: 'Jumping Jacks' },
  { key: 'lunges', label: 'Lunges' },
  { key: 'sit_ups', label: 'Sit-ups' },
  { key: 'squats', label: 'Squats' },
  { key: 'plank', label: 'Plank' },
  { key: 'jumping_jacks', label: 'Jumping Jacks' },
  { key: 'lunges', label: 'Lunges' },
  { key: 'sit_ups', label: 'Sit-ups' },
];

function formatSecondsToMMSS(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function ProgramPage() {
  const [programSteps, setProgramSteps] = useState([]);
  const [selectedExerciseKey, setSelectedExerciseKey] = useState('');
  const [configuringStepId, setConfiguringStepId] = useState(null);
  const [timeModal, setTimeModal] = useState({ open: false, stepId: null, field: null });

  // Generate time options [00:30, 01:00, 01:30, ...] up to 10 minutes
  const timeOptions = useMemo(() => {
    const options = [];
    for (let seconds = 30; seconds <= 10 * 60; seconds += 30) {
      options.push({ value: seconds, label: formatSecondsToMMSS(seconds) });
    }
    return options;
  }, []);

  // Persist program in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('no_excuse_program_v1');
      if (saved) {
        setProgramSteps(JSON.parse(saved));
      }
    } catch (_) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('no_excuse_program_v1', JSON.stringify(programSteps));
    } catch (_) {
      // ignore
    }
  }, [programSteps]);

  const [modalOpen, setModalOpen] = useState(false);

  const addSelectedExercise = (exerciseKey) => {
    if (!exerciseKey) return;
    const exercise = EXERCISE_CATALOG.find(e => e.key === exerciseKey);
    if (!exercise) return;
    const newStep = {
      id: `${exercise.key}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      exerciseKey: exercise.key,
      exerciseLabel: exercise.label,
      mode: 'counter',
      durationSec: 60,
      maxCount: 10,
      breakSec: 30,
    };
    setProgramSteps(prev => [...prev, newStep]);
    setConfiguringStepId(newStep.id);
  };

  const updateStep = (id, updates) => {
    setProgramSteps(prev => prev.map(step => (step.id === id ? { ...step, ...updates } : step)));
  };

  const removeStep = (id) => {
    setProgramSteps(prev => prev.filter(step => step.id !== id));
    if (configuringStepId === id) {
      setConfiguringStepId(null);
    }
  };

  return (
    <div className="app__page program-page">
      <div className="program-page__header">
        <h1 className="program-page__title">Exercise program</h1>
      </div>

      {/* Picker Button and Modal */}
      <button className="button program__choose-btn" onClick={() => setModalOpen(true)} style={{ width: '100%', marginTop: "5px", fontSize: '1.12rem', fontWeight: 600, padding: '16px 0' }}>
        <span>Add exercise</span>
      </button>
      {modalOpen && (
        <ExercisePickerModal
          exercises={EXERCISE_CATALOG}
          onChoose={key => {
            setModalOpen(false);
            setSelectedExerciseKey(key);
            addSelectedExercise(key);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Program list */}
      <div className="program__list">
        {programSteps.length === 0 ? (
          <div className="card program__empty">
            <p className="app__page-description">No exercises yet. Add from the list above.</p>
          </div>
        ) : (
          programSteps.map((step, index) => (
            <div key={step.id} className="card program-card">
              <div className="program-card__header">
                <div className="program-card__title">
                  <div className="badge">{index + 1}</div>
                  <div>
                    <div className="program-card__name">{step.exerciseLabel}</div>
                    <div className="program-card__meta">
                      {step.mode === 'timer'
                        ? `Timer: ${formatSecondsToMMSS(step.durationSec)} • Break: ${formatSecondsToMMSS(step.breakSec)}`
                        : `Reps: ${step.maxCount} • Break: ${formatSecondsToMMSS(step.breakSec)}`}
                    </div>
                  </div>
                </div>
                <div className="program-card__buttons">
                  <button className="button button--ghost" onClick={() => setConfiguringStepId(step.id)}>
                    <div className="wrap"><p>Edit</p></div>
                  </button>
                  <button className="button button--ghost" onClick={() => removeStep(step.id)}>
                    <div className="wrap"><p>Remove</p></div>
                  </button>
                </div>
              </div>

              {configuringStepId === step.id && (
                <div className="program__config">
                  <div className="program__config-grid">

                    {step.mode === 'timer' ? (
                      <div className="program__fields-row">
                        <div className="program__field">
                          <label className="app__page-description">Duration</label>
                          <button
                            className="button program__select-btn"
                            onClick={() => setTimeModal({ open: true, stepId: step.id, field: 'durationSec' })}
                          >
                            <div className="wrap"><p>{timeOptions.find(o => o.value === step.durationSec)?.label}</p></div>
                          </button>
                        </div>
                        <div className="program__field">
                          <label className="app__page-description">Break</label>
                          <button
                            className="button program__select-btn"
                            onClick={() => setTimeModal({ open: true, stepId: step.id, field: 'breakSec' })}
                          >
                            <div className="wrap"><p>{timeOptions.find(o => o.value === step.breakSec)?.label}</p></div>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="program__fields-row">
                        <div className="program__field">
                          <label className="app__page-description">Max reps</label>
                          <input
                            className="input program__input"
                            type="number"
                            min={1}
                            step={1}
                            value={step.maxCount}
                            onChange={(e) => updateStep(step.id, { maxCount: Math.max(1, Number(e.target.value || 0)) })}
                          />
                        </div>
                        <div className="program__field">
                          <label className="app__page-description">Break</label>
                          <button
                            className="button program__select-btn"
                            onClick={() => setTimeModal({ open: true, stepId: step.id, field: 'breakSec' })}
                          >
                            <div className="wrap"><p>{timeOptions.find(o => o.value === step.breakSec)?.label}</p></div>
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="program__mode-row">
                        <button
                          className={`button button--toggle ${step.mode === 'counter' ? 'button--active' : ''}`}
                          onClick={() => updateStep(step.id, { mode: 'counter' })}
                        >
                          <div className="wrap"><p>Counter</p></div>
                        </button>
                        <button
                          className={`button button--toggle ${step.mode === 'timer' ? 'button--active' : ''}`}
                          onClick={() => updateStep(step.id, { mode: 'timer' })}
                        >
                          <div className="wrap"><p>Timer</p></div>
                        </button>

                        <div style={{ marginLeft: 'auto' }}>
                          <button className="button" onClick={() => setConfiguringStepId(null)}>
                            <div className="wrap"><p>Done</p></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))
        )}
      </div>


      {timeModal.open && (
        <TimePickerModal
          title={timeModal.field === 'breakSec' ? 'Choose break' : 'Choose duration'}
          options={timeOptions}
          onChoose={(value) => {
            if (!timeModal.stepId || !timeModal.field) return;
            updateStep(timeModal.stepId, { [timeModal.field]: Number(value) });
            setTimeModal({ open: false, stepId: null, field: null });
          }}
          onClose={() => setTimeModal({ open: false, stepId: null, field: null })}
        />
      )}
    </div>
  );
}

// moved ExercisePickerModal into ./program/ExercisePickerModal

export default ProgramPage;
