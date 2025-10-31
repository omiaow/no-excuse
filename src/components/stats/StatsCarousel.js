import React, { useRef, useState, useEffect, useMemo } from 'react';

export default function StatsCarousel({ slides, initialIndex = 0, onIndexChange }) {
  const containerRef = useRef(null);
  const [current, setCurrent] = useState(initialIndex);
  const [mounted, setMounted] = useState(() => new Set([initialIndex]));

  const startXRef = useRef(0);
  const deltaXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const animTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof onIndexChange === 'function') onIndexChange(current);
  }, [current, onIndexChange]);

  const slideCount = slides.length;

  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    deltaXRef.current = 0;
  };

  const onTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const x = e.touches[0].clientX;
    deltaXRef.current = x - startXRef.current;
  };

  const onTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const threshold = 50;
    const dx = deltaXRef.current;
    let nextIndex = current;
    if (dx < -threshold && current < slideCount - 1) {
      nextIndex = Math.min(current + 1, slideCount - 1);
    } else if (dx > threshold && current > 0) {
      nextIndex = Math.max(current - 1, 0);
    }
    setMounted(new Set([nextIndex, Math.max(nextIndex - 1, 0), Math.min(nextIndex + 1, slideCount - 1)]));
    setCurrent(nextIndex);
    clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => {
      setMounted(new Set([nextIndex]));
    }, 260);
    deltaXRef.current = 0;
  };

  const goTo = (idx) => {
    if (idx === current) return;
    setMounted(new Set([idx, Math.max(idx - 1, 0), Math.min(idx + 1, slideCount - 1)]));
    setCurrent(idx);
    clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => setMounted(new Set([idx])), 260);
  };

  const translateX = useMemo(() => `translateX(${-current * 100}%)`, [current]);

  return (
    <div className="stats-carousel" ref={containerRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="stats-carousel__track" style={{ transform: translateX }}>
        {slides.map((render, idx) => (
          <div className="stats-carousel__slide" key={idx} aria-hidden={current !== idx}>
            {mounted.has(idx) ? (typeof render === 'function' ? render(idx) : render) : null}
          </div>
        ))}
      </div>
      <div className="stats-carousel__dots" role="tablist" aria-label="Stats pages">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`stats-carousel__dot ${current === idx ? 'stats-carousel__dot--active' : ''}`}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => goTo(idx)}
          />
        ))}
      </div>
    </div>
  );
}
