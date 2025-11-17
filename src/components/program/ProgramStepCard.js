import React, { useMemo, useRef, useCallback } from 'react';
import { formatSecondsToMMSS } from './timeUtils';

function ProgramStepCard({
  step,
  index,
  isConfiguring,
  timeOptions,
  onConfigure,
  onRemove,
  onUpdate,
  onTimeFieldClick,
  onDone,
}) {
  const prevValuesRef = useRef({
    sets: step.sets,
    maxCount: step.maxCount,
  });

  const getTimeLabel = useCallback(
    (seconds) => {
      const option = timeOptions.find((o) => o.value === seconds);
      return option ? option.label : formatSecondsToMMSS(seconds);
    },
    [timeOptions]
  );

  const summaryText = useMemo(() => {
    if (step.mode === 'timer') {
      return `Timer: ${formatSecondsToMMSS(step.durationSec)} • Break: ${formatSecondsToMMSS(
        step.breakSec
      )} • Sets: ${step.sets || 1}`;
    }
    return `Reps: ${step.maxCount} • Break: ${formatSecondsToMMSS(step.breakSec)} • Sets: ${
      step.sets || 1
    }`;
  }, [step]);

  const handleFocus = useCallback(
    (field) => {
      prevValuesRef.current[field] = step[field];
      onUpdate({ [field]: '' });
    },
    [onUpdate, step]
  );

  const handleBlur = useCallback(
    (field) => {
      if (!step[field] && step[field] !== 0) {
        onUpdate({ [field]: prevValuesRef.current[field] });
      }
    },
    [onUpdate, step]
  );

  const handleNumericChange = useCallback(
    (field, value) => {
      if (value === '') {
        onUpdate({ [field]: '' });
        return;
      }
      const numVal = Math.max(1, Number(value));
      onUpdate({ [field]: numVal });
    },
    [onUpdate]
  );

  return (
    <div className="card program-card">
      <div className="program-card__header">
        <div className="program-card__title" onClick={onConfigure}>
          <div className="badge">{index + 1}</div>
          <div>
            <div className="program-card__name">{step.exerciseLabel}</div>
            <div className="program-card__meta">{summaryText}</div>
          </div>
        </div>
        <div className="program-card__buttons">
          <button className="button button--ghost" onClick={onRemove}>
            <div className="wrap">
              <p>Remove</p>
            </div>
          </button>
        </div>
      </div>

      {isConfiguring && (
        <div className="program__config">
          <div className="program__config-grid">
            {step.mode === 'timer' ? (
              <div className="program__fields-row">
                <div className="program__field">
                  <label className="app__page-description">Duration</label>
                  <button
                    className="button program__select-btn"
                    onClick={() => onTimeFieldClick('durationSec')}
                  >
                    <div className="wrap">
                      <p>{getTimeLabel(step.durationSec)}</p>
                    </div>
                  </button>
                </div>
                <div className="program__field">
                  <label className="app__page-description">Break</label>
                  <button
                    className="button program__select-btn"
                    onClick={() => onTimeFieldClick('breakSec')}
                  >
                    <div className="wrap">
                      <p>{getTimeLabel(step.breakSec)}</p>
                    </div>
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
                    onFocus={() => handleFocus('sets')}
                    onChange={(e) => handleNumericChange('sets', e.target.value)}
                    onBlur={() => handleBlur('sets')}
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
                    onFocus={() => handleFocus('maxCount')}
                    onChange={(e) => handleNumericChange('maxCount', e.target.value)}
                    onBlur={() => handleBlur('maxCount')}
                  />
                </div>
                <div className="program__field">
                  <label className="app__page-description">Break</label>
                  <button
                    className="button program__select-btn"
                    onClick={() => onTimeFieldClick('breakSec')}
                  >
                    <div className="wrap">
                      <p>{getTimeLabel(step.breakSec)}</p>
                    </div>
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
                    onFocus={() => handleFocus('sets')}
                    onChange={(e) => handleNumericChange('sets', e.target.value)}
                    onBlur={() => handleBlur('sets')}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="program__mode-row">
                <button
                  className={`button button--toggle ${step.mode === 'counter' ? 'button--active' : ''}`}
                  onClick={() => onUpdate({ mode: 'counter' })}
                >
                  <div className="wrap">
                    <p>Counter</p>
                  </div>
                </button>
                <button
                  className={`button button--toggle ${step.mode === 'timer' ? 'button--active' : ''}`}
                  onClick={() => onUpdate({ mode: 'timer' })}
                >
                  <div className="wrap">
                    <p>Timer</p>
                  </div>
                </button>

                <div style={{ marginLeft: 'auto' }}>
                  <button className="button" onClick={onDone}>
                    <div className="wrap">
                      <p>Done</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramStepCard;

