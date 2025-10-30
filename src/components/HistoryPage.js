import React, { useState, useEffect } from 'react';
import ExerciseHistoryList from './stats/ExerciseHistoryList';

const mockExerciseHistory = [
  { id: 1, name: 'Push-ups', count: 25, duration: 120, score: 95, date: '2024-01-15' },
  { id: 2, name: 'Squats', count: 30, duration: 150, score: 88, date: '2024-01-15' },
  { id: 3, name: 'Push-ups', count: 28, duration: 135, score: 92, date: '2024-01-16' },
  { id: 4, name: 'Standing Exercises', count: 20, duration: 180, score: 85, date: '2024-01-16' },
  { id: 5, name: 'Squats', count: 35, duration: 140, score: 94, date: '2024-01-17' },
  { id: 6, name: 'Push-ups', count: 30, duration: 145, score: 97, date: '2024-01-17' },
  { id: 7, name: 'Standing Exercises', count: 22, duration: 195, score: 90, date: '2024-01-18' },
  { id: 8, name: 'Push-ups', count: 32, duration: 150, score: 98, date: '2024-01-19' },
  { id: 9, name: 'Squats', count: 40, duration: 160, score: 96, date: '2024-01-19' },
  { id: 10, name: 'Push-ups', count: 35, duration: 155, score: 99, date: '2024-01-20' },
];

const groupExercisesByDate = () => {
  const grouped = {};
  mockExerciseHistory.forEach(exercise => {
    const date = exercise.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(exercise);
  });
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
  return sortedDates.map(date => ({
    date,
    exercises: grouped[date]
  }));
};

function HistoryPage() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const groupedExercises = groupExercisesByDate();

  return (
    <div className="history-page">
      <div className="history-page__header"/>
      {/* Exercise History List remains present */}
      <ExerciseHistoryList groupedExercises={groupedExercises} />
    </div>
  );
}

export default HistoryPage;
