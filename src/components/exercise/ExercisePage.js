import React, { useState } from 'react';
import CameraView from './CameraView';

function ExercisePage({ onClose }) {

    const [exercise, setExercise] = useState({
        name: 'squat',
        count: 0,
        duration: 0,
        durationLimit: 65,
        totalScore: 0,
        averageScore: 0,
    });

    return (
        <CameraView run={true} exercise={exercise} setExercise={setExercise} />
    );
}

export default ExercisePage;
