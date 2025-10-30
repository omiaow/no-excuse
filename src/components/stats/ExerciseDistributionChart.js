import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#00c3ff', '#024A70', '#667eea', '#f093fb', '#4facfe'];

const ExerciseDistributionChart = ({ data, isMobile, isExtraSmall }) => {
  const chartHeight = isExtraSmall ? 160 : isMobile ? 200 : 250;
  const outerRadius = isExtraSmall ? 50 : isMobile ? 60 : 80;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Exercise Distribution</h3>
      <div className="chart-no-interact">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
          <Pie
            data={data}
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
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
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
  );
};

export default ExerciseDistributionChart;
