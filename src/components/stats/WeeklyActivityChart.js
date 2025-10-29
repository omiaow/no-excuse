import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const WeeklyActivityChart = ({ data, isMobile, isExtraSmall }) => {
  const chartHeight = isExtraSmall ? 140 : isMobile ? 160 : 200;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Weekly Activity</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#024A70" opacity={0.1} />
          <XAxis 
            dataKey="date" 
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
  );
};

export default WeeklyActivityChart;
