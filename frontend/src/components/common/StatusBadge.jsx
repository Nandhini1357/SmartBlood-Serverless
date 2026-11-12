import React from 'react';

export const StatusBadge = ({ urgency }) => {
  const level = urgency?.toUpperCase() || 'NORMAL';
  const badgeClass =
    level === 'CRITICAL'
      ? 'badge-critical'
      : level === 'URGENT'
      ? 'badge-urgent'
      : 'badge-normal';

  return <span className={`badge ${badgeClass}`}>{level}</span>;
};
