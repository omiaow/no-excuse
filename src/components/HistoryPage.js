import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data
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

// Process data for charts
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

const COLORS = ['#00c3ff', '#024A70', '#667eea', '#f093fb', '#4facfe'];

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const calculateTotalStats = () => {
  const totalCount = mockExerciseHistory.reduce((sum, e) => sum + e.count, 0);
  const totalDuration = mockExerciseHistory.reduce((sum, e) => sum + e.duration, 0);
  const avgScore = Math.round(
    mockExerciseHistory.reduce((sum, e) => sum + e.score, 0) / mockExerciseHistory.length
  );
  return { totalCount, totalDuration, avgScore };
};

function HistoryPage() {
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

  const barChartHeight = isExtraSmall ? 140 : isMobile ? 160 : 200;
  const lineChartHeight = isExtraSmall ? 140 : isMobile ? 160 : 200;
  const pieChartHeight = isExtraSmall ? 160 : isMobile ? 200 : 250;
  const pieOuterRadius = isExtraSmall ? 50 : isMobile ? 60 : 80;

  return (
    <div className="history-page">
      <div className="history-page__header">
        <h1 className="history-page__title">Your Progress</h1>
      </div>

      {/* Statistics Cards */}
      <div className="history-page__stats-cards">
        <div className="stat-card">
          <div className="stat-card__icon">📊</div>
          <div className="stat-card__value">{stats.totalCount}</div>
          <div className="stat-card__label">Total Reps</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">⏱️</div>
          <div className="stat-card__value">{formatDuration(stats.totalDuration)}</div>
          <div className="stat-card__label">Total Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">⭐</div>
          <div className="stat-card__value">{stats.avgScore}%</div>
          <div className="stat-card__label">Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon">💪</div>
          <div className="stat-card__value">{mockExerciseHistory.length}</div>
          <div className="stat-card__label">Sessions</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="history-page__charts">
        {/* Weekly Activity Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={barChartHeight}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#024A70" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#024A70"
                style={{ fontSize: isExtraSmall ? '8px' : isMobile ? '10px' : '12px' }}
                tick={{ fill: '#024A70' }}
              />
              <YAxis 
                stroke="#024A70"
                style={{ fontSize: isExtraSmall ? '8px' : isMobile ? '10px' : '12px' }}
                tick={{ fill: '#024A70' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#024A70',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="count" fill="#00c3ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Line Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Progress Over Time</h3>
          <ResponsiveContainer width="100%" height={lineChartHeight}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#024A70" opacity={0.1} />
              <XAxis 
                dataKey="day" 
                stroke="#024A70"
                style={{ fontSize: isExtraSmall ? '8px' : isMobile ? '10px' : '12px' }}
                tick={{ fill: '#024A70' }}
              />
              <YAxis 
                stroke="#024A70"
                style={{ fontSize: isExtraSmall ? '8px' : isMobile ? '10px' : '12px' }}
                tick={{ fill: '#024A70' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#024A70',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#00c3ff" 
                strokeWidth={3}
                dot={{ fill: '#024A70', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Exercise Distribution Pie Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Exercise Distribution</h3>
          <ResponsiveContainer width="100%" height={pieChartHeight}>
            <PieChart>
              <Pie
                data={exerciseDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const percentValue = (percent * 100).toFixed(0);
                  if (isExtraSmall) {
                    return `${percentValue}%`;
                  }
                  return isMobile ? `${name}\n${percentValue}%` : `${name}: ${percentValue}%`;
                }}
                labelStyle={{ fontSize: isExtraSmall ? '8px' : isMobile ? '10px' : '12px', fill: '#024A70', fontWeight: '600' }}
                outerRadius={pieOuterRadius}
                fill="#8884d8"
                dataKey="value"
              >
                {exerciseDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#024A70',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise History List */}
      <div className="history-page__list-container">
        <h2 className="history-page__list-title">Exercise History</h2>
        <div className="history-page__list">
          {mockExerciseHistory.slice().reverse().map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-card__header">
                <h3 className="exercise-card__name">{exercise.name}</h3>
                <span className={`exercise-card__score exercise-card__score--${exercise.score >= 95 ? 'excellent' : exercise.score >= 85 ? 'good' : 'average'}`}>
                  {exercise.score}%
                </span>
              </div>
              <div className="exercise-card__details">
                <div className="exercise-card__detail-item">
                  <span className="exercise-card__detail-label">Reps:</span>
                  <span className="exercise-card__detail-value">{exercise.count}</span>
                </div>
                <div className="exercise-card__detail-item">
                  <span className="exercise-card__detail-label">Duration:</span>
                  <span className="exercise-card__detail-value">{formatDuration(exercise.duration)}</span>
                </div>
                <div className="exercise-card__detail-item">
                  <span className="exercise-card__detail-label">Date:</span>
                  <span className="exercise-card__detail-value">
                    {new Date(exercise.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
