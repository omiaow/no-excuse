import React, { useEffect, useState } from "react";

export default function BreakTimer({ breakTime, setBreakTime }) {
  
  useEffect(() => {
    if (breakTime <= 0) return;

    const timer = setInterval(() => {
      setBreakTime(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [breakTime]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  return (
    <div style={{ fontSize: "2rem", textAlign: "center", fontFamily: "monospace" }}>
      {breakTime > 0 ? formatTime(breakTime) : "Time’s up!"}
    </div>
  );
}
