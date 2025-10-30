import React, { useState, useEffect } from 'react';
import StatisticsCards from './stats/StatisticsCards';
import WeeklyActivityChart from './stats/WeeklyActivityChart';
import ProgressChart from './stats/ProgressChart';
import ExerciseDistributionChart from './stats/ExerciseDistributionChart';
import StatsCarousel from './stats/StatsCarousel';

// Mock data (move here from HistoryPage)
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

const getWeeklyData = () => {
  const last7Days = mockExerciseHistory.slice(-7);
  const dailyTotals = {};
  last7Days.forEach(exercise => {
    const date = new Date(exercise.date).toLocaleDateString('en-US', { weekday: 'short' });
    if (!dailyTotals[date]) {
      dailyTotals[date] = { date, count: 0, exercises: 0 };
    }
    dailyTotals[date].count += exercise.count;
    dailyTotals[date].exercises += 1;
  });
  return Object.values(dailyTotals);
};

const getProgressData = () => {
  return mockExerciseHistory.map((exercise, index) => ({
    day: index + 1,
    score: exercise.score,
    count: exercise.count,
  }));
};

const getExerciseDistribution = () => {
  const distribution = {};
  mockExerciseHistory.forEach(exercise => {
    distribution[exercise.name] = (distribution[exercise.name] || 0) + 1;
  });
  return Object.entries(distribution).map(([name, value]) => ({
    name: name.replace(' Exercises', ''),
    value,
  }));
};

const calculateTotalStats = () => {
  const totalCount = mockExerciseHistory.reduce((sum, e) => sum + e.count, 0);
  const totalDuration = mockExerciseHistory.reduce((sum, e) => sum + e.duration, 0);
  const avgScore = Math.round(
    mockExerciseHistory.reduce((sum, e) => sum + e.score, 0) / mockExerciseHistory.length
  );
  return { totalCount, totalDuration, avgScore };
};

function MainPage({ onStartExercise }) {
  // Responsive logic from HistoryPage
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = windowWidth <= 480;
  const isExtraSmall = windowWidth <= 300;

  const weeklyData = getWeeklyData();
  const progressData = getProgressData();
  const exerciseDistribution = getExerciseDistribution();
  const stats = calculateTotalStats();
  const totalSessions = mockExerciseHistory.length;

  // Prepare the carousel slides
  const slides = [
    () => (
      <div className="chart-container">
        <StatisticsCards stats={stats} totalSessions={totalSessions} />
      </div>
    ),
    () => (<WeeklyActivityChart data={weeklyData} isMobile={isMobile} isExtraSmall={isExtraSmall} />),
    () => (<ProgressChart data={progressData} isMobile={isMobile} isExtraSmall={isExtraSmall} />),
    () => (<ExerciseDistributionChart data={exerciseDistribution} isMobile={isMobile} isExtraSmall={isExtraSmall} />),
  ];

  return (
    <div className="app__page app__page--stats" style={{ paddingTop: '30px' }}>
      <h1 className="app__page-title" style={{ marginTop: '30px', marginBottom: '15px' }}>Day 2 with No Excuse</h1>
      {/* Insert Statistics Carousel here */}
      <StatsCarousel slides={slides} />
      {/* <p className="app__page-description" style={{ marginTop: '60px' }}>Your personal training partner</p> */}
      <button className="button" onClick={onStartExercise}>
        <div className="wrap">
          <p>Let's Go</p>
        </div>
      </button>
    </div>
  );
}

export default MainPage;
