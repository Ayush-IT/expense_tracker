import React from 'react';

const ProgressBar = ({ percent = 0 }) => {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const color = p >= 100 ? 'bg-red-500' : p >= 80 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
      <div className={`${color} h-2`} style={{ width: `${p}%` }}></div>
    </div>
  );
};

export default ProgressBar;
