import React, { useState, useEffect } from 'react';
import useHttp from '../../hooks/http.hook';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ProgressCountChart = ({ isMobile, isExtraSmall }) => {
  const chartHeight = isExtraSmall ? 140 : isMobile ? 160 : 200;

  const { request } = useHttp();
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    const fetchProgressData = async () => {
      const data = await request('/app/progress-data', 'GET');
      const progressData = data.map(item => ({
        day: item.day_number,
        count: item.total_reps,
      }));
      setProgressData(progressData);
    };
    fetchProgressData();
  }, [request]);


  return (
    <div className="chart-container">
      <h3 className="chart-title">Progress Count</h3>
      <div className="chart-no-interact">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={progressData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#024A70" opacity={0.1} />
          <XAxis 
            dataKey="day" 
            stroke="#024A70"
            style={{ fontSize: isExtraSmall ? '8px' : isMobile ? '10px' : '12px' }}
            tick={{ fill: '#024A70' }}
            axisLine={false}
          />
          <YAxis 
            stroke="#024A70"
            style={{ fontSize: isExtraSmall ? '8px' : isMobile ? '10px' : '12px' }}
            tick={{ fill: '#024A70' }}
            tickLine={false}
            axisLine={false}
            width={28}
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
    </div>
  );
};

export default ProgressCountChart;
