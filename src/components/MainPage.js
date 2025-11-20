import React, { useState, useEffect } from 'react';
import useHttp from '../hooks/http.hook';

function MainPage({ onStartExercise }) {

  const { loading, request } = useHttp()
  const [recordDays, setRecordDays] = useState(0)

  useEffect(() => {
    const fetchRecordDays = async () => {
      const response = await request('/app/record-days', 'GET')
      setRecordDays(response.total_days || 0)
    }
    fetchRecordDays()
  }, [])

  const titleText = recordDays > 0 
    ? `Day ${recordDays} with No Excuse` 
    : `Start with No Excuse`;

  return (
    <div className="app__page app__page--stats" style={{ paddingTop: '250px' }}>
      <h1 className="app__page-title">
        {loading ? (
          <span className="skeleton-text skeleton-text--title">
            Loading...
          </span>
        ) : (
          <span className="app__page-title-text">{titleText}</span>
        )}
      </h1>
      <p className="app__page-description">Your personal training partner</p>
      <button className="start-button" onClick={onStartExercise}>
        <div className="wrap">
          <p>Let's Go</p>
        </div>
      </button>
    </div>
  );
}

export default MainPage;
