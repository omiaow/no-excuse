import React, { useRef, useState, useEffect } from 'react';

// A minimal swipeable carousel that lazily mounts slides.
// Props:
// - slides: array of functions (index) => ReactNode or elements
// - initialIndex: number
// - onIndexChange: (index) => void
// Only the current slide is mounted by default. Neighbors can be pre-mounted for smoother UX.
export default function StatsCarousel({ slides, initialIndex = 0, onIndexChange }) {
  const containerRef = useRef(null);
  const [current, setCurrent] = useState(initialIndex);

  // touch handling
  const startXRef = useRef(0);
  const deltaXRef = useRef(0);
  const isDraggingRef = useRef(false);

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
    const threshold = 50; // pixels
    const dx = deltaXRef.current;
    if (dx < -threshold && current < slideCount - 1) {
      setCurrent((i) => Math.min(i + 1, slideCount - 1));
    } else if (dx > threshold && current > 0) {
      setCurrent((i) => Math.max(i - 1, 0));
    }
    deltaXRef.current = 0;
  };

  return (
    <div className="stats-carousel" ref={containerRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="stats-carousel__track">
        <div className="stats-carousel__slide" key={current}>
          {typeof slides[current] === 'function' ? slides[current](current) : slides[current]}
        </div>
      </div>
      <div className="stats-carousel__dots" role="tablist" aria-label="Stats pages">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`stats-carousel__dot ${current === idx ? 'stats-carousel__dot--active' : ''}`}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
}
