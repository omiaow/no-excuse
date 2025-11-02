import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ExercisePickerModal from './program/ExercisePickerModal';
import TimePickerModal from './program/TimePickerModal';
import useHttp from '../hooks/http.hook';

// Helper function to convert HH:MM:SS or HH:MM to seconds
function timeStringToSeconds(timeString) {
  if (!timeString) return 0;
  const parts = timeString.split(':').map(Number);
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // HH:MM format
    return parts[0] * 3600 + parts[1] * 60;
  }
  return 0;
}

// Helper function to convert seconds to HH:MM:SS format
function secondsToTimeString(totalSeconds) {
  if (!totalSeconds) return null;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Transform API program to component format
function apiProgramToStep(apiProgram, exercisesMap) {
  const exercise = exercisesMap[apiProgram.exercise_id];
  const mode = apiProgram.type_id === 2 ? 'timer' : 'counter';
  const breakSec = timeStringToSeconds(apiProgram.break_time);
  
  return {
    id: apiProgram.id.toString(),
    exerciseId: apiProgram.exercise_id,
    exerciseKey: exercise ? `exercise_${apiProgram.exercise_id}` : null,
    exerciseLabel: exercise ? exercise.name : 'Unknown Exercise',
    mode: mode,
    durationSec: mode === 'timer' ? timeStringToSeconds(apiProgram.duration) : null,
    maxCount: mode === 'counter' ? apiProgram.max_reps : null,
    breakSec: breakSec || 30,
    sets: apiProgram.sets_count || 1,
    orderNum: apiProgram.order_num,
  };
}

// Transform component step to API format
function stepToApiProgram(step, orderNum) {
  const typeId = step.mode === 'timer' ? 2 : 1;
  const breakTime = secondsToTimeString(step.breakSec || 30);
  
  return {
    id: step.id && !isNaN(Number(step.id)) ? Number(step.id) : undefined,
    exercise_id: step.exerciseId,
    order_num: orderNum,
    max_reps: step.mode === 'counter' ? step.maxCount : null,
    duration: step.mode === 'timer' ? secondsToTimeString(step.durationSec) : null,
    break_time: breakTime,
    sets_count: step.sets || 1,
    type_id: typeId,
  };
}

function formatSecondsToMMSS(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function ProgramPage() {
  const [programSteps, setProgramSteps] = useState([]);
  const [configuringStepId, setConfiguringStepId] = useState(null);
  const [timeModal, setTimeModal] = useState({ open: false, stepId: null, field: null });
  const [exercises, setExercises] = useState([]);
  const [exercisesMap, setExercisesMap] = useState({});
  const [prev, setPrev] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { loading, request } = useHttp();

  const timeOptions = useMemo(() => {
    const options = [];
    for (let seconds = 30; seconds <= 5 * 60; seconds += 30) {
      if (seconds > 120) seconds += 30;
      options.push({ value: seconds, label: formatSecondsToMMSS(seconds) });
    }
    return options;
  }, []);

  // Transform exercises from API to component format for ExercisePickerModal
  const exerciseCatalog = useMemo(() => {
    return exercises.map(ex => ({
      key: `exercise_${ex.id}`,
      label: ex.name,
      id: ex.id,
    }));
  }, [exercises]);

  // Fetch exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await request('/app/exercises', 'GET');
        setExercises(data || []);
        // Create a map for quick lookup
        const map = {};
        (data || []).forEach(ex => {
          map[ex.id] = ex;
        });
        setExercisesMap(map);
      } catch (e) {
        console.error('Failed to fetch exercises:', e);
      }
    };
    fetchExercises();
  }, [request]);

  // Fetch programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await request('/app/programs', 'GET');
        if (data && Array.isArray(data)) {
          const steps = data.map(apiProgram => apiProgramToStep(apiProgram, exercisesMap));
          setProgramSteps(steps);
          setIsInitialLoad(false);
        } else {
          setIsInitialLoad(false);
        }
      } catch (e) {
        console.error('Failed to fetch programs:', e);
        setIsInitialLoad(false);
      }
    };
    if (Object.keys(exercisesMap).length > 0) {
      fetchPrograms();
    }
  }, [request, exercisesMap]);

  // Save programs to API
  const savePrograms = useCallback(async (steps) => {
    if (isInitialLoad || steps.length === 0 || Object.keys(exercisesMap).length === 0) return;
    try {
      const apiPrograms = steps.map((step, index) => stepToApiProgram(step, index + 1));
      await request('/app/programs', 'PUT', apiPrograms);
    } catch (e) {
      console.error('Failed to save programs:', e);
    }
  }, [request, isInitialLoad, exercisesMap]);

  const [modalOpen, setModalOpen] = useState(false);

  const addSelectedExercise = (exerciseKey) => {
    if (!exerciseKey) return;
    const exercise = exerciseCatalog.find(e => e.key === exerciseKey);
    if (!exercise) return;
    const newStep = {
      id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      exerciseId: exercise.id,
      exerciseKey: exercise.key,
      exerciseLabel: exercise.label,
      mode: 'counter',
      durationSec: 60,
      maxCount: 10,
      breakSec: 30,
      sets: 1,
      orderNum: programSteps.length + 1,
    };
    setProgramSteps(prev => [...prev, newStep]);
    setConfiguringStepId(newStep.id);
  };

  const updateStep = (id, updates) => {
    setProgramSteps(prev => prev.map(step => (step.id === id ? { ...step, ...updates } : step)));
  };

  const removeStep = async (id) => {
    const newSteps = programSteps.filter(step => step.id !== id);
    setProgramSteps(newSteps);
    if (configuringStepId === id) {
      setConfiguringStepId(null);
    }
    // Save after removal
    await savePrograms(newSteps);
  };

  return (
    <div className="app__page program-page">
      <div className="program-page__header">
        <h1 className="program-page__title">Exercise program</h1>
      </div>

      <button 
        className="button program__choose-btn" 
        onClick={() => setModalOpen(true)} 
        disabled={loading || exerciseCatalog.length === 0}
        style={{ width: '100%', marginTop: "5px", fontSize: '1.12rem', fontWeight: 600, padding: '16px 0' }}
      >
        <span>{loading ? 'Loading...' : 'Add exercise'}</span>
      </button>
      {modalOpen && (
        <ExercisePickerModal
          exercises={exerciseCatalog}
          onChoose={key => {
            setModalOpen(false);
            addSelectedExercise(key);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}

      <div className="program__list">
        {programSteps.length === 0 ? (
          <div className="card program__empty">
            <p className="app__page-description">No exercises yet. Add from the list above.</p>
          </div>
        ) : (
          programSteps.map((step, index) => (
            <div key={step.id} className="card program-card">
              <div className="program-card__header">
                <div className="program-card__title" onClick={() => setConfiguringStepId(step.id)}>
                  <div className="badge">{index + 1}</div>
                  <div>
                    <div className="program-card__name">{step.exerciseLabel}</div>
                    <div className="program-card__meta">
                      {step.mode === 'timer'
                        ? `Timer: ${formatSecondsToMMSS(step.durationSec)} • Break: ${formatSecondsToMMSS(step.breakSec)} • Sets: ${step.sets || 1}`
                        : `Reps: ${step.maxCount} • Break: ${formatSecondsToMMSS(step.breakSec)} • Sets: ${step.sets || 1}`}
                    </div>
                  </div>
                </div>
                <div className="program-card__buttons">
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
                        <div className="program__field">
                          <label className="app__page-description">Sets</label>
                          <input
                            className="input program__input"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="number"
                            min={1}
                            step={1}
                            value={step.sets}
                            onFocus={(e) => {
                              setPrev(step.sets);
                              updateStep(step.id, { sets: '' });
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                updateStep(step.id, { sets: '' });
                              } else {
                                const numVal = Math.max(1, Number(val));
                                updateStep(step.id, { sets: numVal });
                              }
                            }}
                            onBlur={(e) => {
                              if (!step.sets || step.sets === '') {
                                updateStep(step.id, { sets: prev });
                              }
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="program__fields-row">
                        <div className="program__field">
                          <label className="app__page-description">Max reps</label>
                          <input
                            className="input program__input"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="number"
                            min={1}
                            step={1}
                            value={step.maxCount}
                            onFocus={(e) => {
                              setPrev(step.maxCount);
                              updateStep(step.id, { maxCount: '' });
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                updateStep(step.id, { maxCount: '' });
                              } else {
                                const numVal = Math.max(1, Number(val));
                                updateStep(step.id, { maxCount: numVal });
                              }
                            }}
                            onBlur={(e) => {
                              if (step.maxCount === '') {
                                updateStep(step.id, { maxCount: prev });
                              }
                            }}
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
                        <div className="program__field">
                          <label className="app__page-description">Sets</label>
                          <input
                            className="input program__input"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            type="number"
                            min={1}
                            step={1}
                            value={step.sets}
                            onFocus={(e) => {
                              setPrev(step.sets);
                              updateStep(step.id, { sets: '' });
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                updateStep(step.id, { sets: '' });
                              } else {
                                const numVal = Math.max(1, Number(val));
                                updateStep(step.id, { sets: numVal });
                              }
                            }}
                            onBlur={(e) => {
                              if (!step.sets || step.sets === '') {
                                updateStep(step.id, { sets: prev });
                              }
                            }}
                          />
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
                          <button className="button" onClick={async () => {
                            setConfiguringStepId(null);
                            await savePrograms(programSteps);
                          }}>
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

export default ProgramPage;
