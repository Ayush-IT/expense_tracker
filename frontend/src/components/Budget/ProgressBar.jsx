import React from 'react';

const ProgressBar = ({ percent = 0, showLabel = false, size = 'default' }) => {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));

  // Enhanced color logic with better visual feedback
  const getColorClasses = (percent) => {
    if (percent >= 100) {
      return {
        bg: 'bg-red-500',
        text: 'text-red-600',
        border: 'border-red-200',
        shadow: 'shadow-red-200'
      };
    } else if (percent >= 90) {
      return {
        bg: 'bg-orange-500',
        text: 'text-orange-600',
        border: 'border-orange-200',
        shadow: 'shadow-orange-200'
      };
    } else if (percent >= 80) {
      return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        shadow: 'shadow-yellow-200'
      };
    } else if (percent >= 60) {
      return {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200',
        shadow: 'shadow-blue-200'
      };
    } else {
      return {
        bg: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-200',
        shadow: 'shadow-green-200'
      };
    }
  };

  const colors = getColorClasses(p);
  const height = size === 'small' ? 'h-1.5' : size === 'large' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      <div className={`relative bg-gray-100 rounded-full ${height} overflow-hidden border border-gray-200`}>
        {/* Progress bar with smooth animation */}
        <div
          className={`${colors.bg} ${height} rounded-full transition-all duration-700 ease-out shadow-sm`}
          style={{ width: `${p}%` }}
        />

        {/* Animated glow effect for high percentages */}
        {p >= 80 && (
          <div
            className={`absolute inset-0 ${colors.shadow} blur-sm opacity-30 rounded-full transition-all duration-700`}
            style={{ width: `${p}%` }}
          />
        )}
      </div>

      {/* Optional label with color coding */}
      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs font-medium ${colors.text}`}>
            {p >= 100 ? 'Exceeded' : p >= 80 ? 'Warning' : p >= 60 ? 'Moderate' : 'Good'}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {p}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
