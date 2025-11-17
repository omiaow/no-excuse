import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ExercisePickerModal from './program/ExercisePickerModal';
import TimePickerModal from './program/TimePickerModal';
import ProgramStepsList from './program/ProgramStepsList';
import useHttp from '../hooks/http.hook';
import LoadingOverlay from './common/LoadingOverlay';
import {
  timeStringToSeconds,
  secondsToTimeString,
  formatSecondsToMMSS,
} from './program/timeUtils';

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

function ProgramPage() {
  const [programSteps, setProgramSteps] = useState([]);
  const [configuringStepId, setConfiguringStepId] = useState(null);
  const [timeModal, setTimeModal] = useState({ open: false, stepId: null, field: null });
  const [exercises, setExercises] = useState([]);
  const [exercisesMap, setExercisesMap] = useState({});
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

  const handleTimeFieldRequest = useCallback((stepId, field) => {
    setTimeModal({ open: true, stepId, field });
  }, []);

  const handleStepDone = useCallback(async (stepId) => {
    setConfiguringStepId(currentId => (currentId === stepId ? null : currentId));
    await savePrograms(programSteps);
  }, [programSteps, savePrograms]);

  return (
    <div className="app__page program-page">
      {loading && (
        <LoadingOverlay
          overlayClassName="program-page__loading-overlay"
          cardClassName="program-page__loading-card"
          spinnerClassName="program-page__spinner"
          textClassName="program-page__loading-text"
          text="Loading..."
        />
      )}
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

      <ProgramStepsList
        steps={programSteps}
        configuringStepId={configuringStepId}
        onConfigure={setConfiguringStepId}
        onRemove={removeStep}
        onUpdate={updateStep}
        onTimeFieldRequest={handleTimeFieldRequest}
        onDone={handleStepDone}
        timeOptions={timeOptions}
      />


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
