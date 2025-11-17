import React from 'react';
import ProgramStepCard from './ProgramStepCard';

function ProgramStepsList({
  steps,
  configuringStepId,
  onConfigure,
  onRemove,
  onUpdate,
  onTimeFieldRequest,
  onDone,
  timeOptions,
}) {
  if (!steps.length) {
    return (
      <div className="program__list">
        <div className="card program__empty">
          <p className="app__page-description">No exercises yet. Add from the list above.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="program__list">
      {steps.map((step, index) => (
        <ProgramStepCard
          key={step.id}
          step={step}
          index={index}
          isConfiguring={configuringStepId === step.id}
          onConfigure={() => onConfigure(step.id)}
          onRemove={() => onRemove(step.id)}
          onUpdate={(updates) => onUpdate(step.id, updates)}
          onTimeFieldClick={(field) => onTimeFieldRequest(step.id, field)}
          onDone={() => onDone(step.id)}
          timeOptions={timeOptions}
        />
      ))}
    </div>
  );
}

export default ProgramStepsList;

