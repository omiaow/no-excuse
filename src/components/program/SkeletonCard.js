import React from 'react';

function SkeletonCard({ withCircle = true }) {
  return (
    <div className="card program-card skeleton-card">
      <div className="skeleton-card__content">
        {withCircle && <div className="skeleton-card__circle"></div>}
        <div className="skeleton-card__lines">
          <div className="skeleton-card__line skeleton-card__line--short"></div>
          <div className="skeleton-card__line skeleton-card__line--long"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;

