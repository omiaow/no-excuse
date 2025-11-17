import React, { useState, useEffect } from 'react';
import StatisticsCards from './stats/StatisticsCards';
import ProgressCountChart from './stats/ProgressCountChart';
import ProgressChart from './stats/ProgressChart';
import StatsCarousel from './stats/StatsCarousel';
import ExerciseHistoryList from './stats/ExerciseHistoryList';
import useHttp from '../hooks/http.hook';
import LoadingOverlay from './common/LoadingOverlay';

const groupExercisesByDate = (exerciseHistory) => {
  const grouped = {};
  exerciseHistory.forEach(exercise => {
    const date = exercise.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(exercise);
  });
  
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
  
  return sortedDates.map(date => ({
    date,
    exercises: grouped[date]
  }));
};

function HistoryPage() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const { loading, request } = useHttp();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await request('/app/records', 'GET');
        const records = Array.isArray(data?.records) ? data.records : [];
        const transformed = records.map(record => ({
          id: record.id,
          name: record.name,
          count: record.reps_count,
          duration: record.duration,
          score: record.score,
          date: record.date,
          sets: 1,
        }));
        setStats(data?.stats || {});
        setExerciseHistory(transformed);
      } catch (e) {
        console.error('Failed to fetch records:', e);
      } finally {
        setHasFetchedHistory(true);
      }
    };

    fetchRecords();
  }, [request]);

  const isMobile = windowWidth <= 480;
  const isExtraSmall = windowWidth <= 300;
 
  const groupedExercises = groupExercisesByDate(exerciseHistory);
  const showEmptyHistory = hasFetchedHistory && !loading && exerciseHistory.length === 0;

  const slides = [
    () => (<StatisticsCards stats={stats} />),
  ];

  if (stats.total_days >= 5) {
    slides.push(
      () => (<ProgressCountChart isMobile={isMobile} isExtraSmall={isExtraSmall} />),
      () => (<ProgressChart isMobile={isMobile} isExtraSmall={isExtraSmall} />),
    );
  }

  return (
    <div className="history-page">
      {loading && (
        <LoadingOverlay text="Loading..." />
      )}
      <div className="history-page__header">
        <h1 className="history-page__title">Your Progress</h1>
      </div>

      <StatsCarousel slides={slides} />

      {exerciseHistory.length > 0 && (
        <ExerciseHistoryList groupedExercises={groupedExercises} />
      )}

      {showEmptyHistory && (
        <div className="history-page__empty-state">
          <p className="history-page__empty-text">No exercise records yet</p>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
