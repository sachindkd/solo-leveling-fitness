import React from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showValue?: boolean;
  className?: string;
  labelBefore?: React.ReactNode;
  labelAfter?: React.ReactNode;
}

export function ProgressBar({
  value,
  max,
  color = "bg-secondary",
  showValue = false,
  className = "",
  labelBefore,
  labelAfter,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={className}>
      {(labelBefore || labelAfter || showValue) && (
        <div className="flex justify-between items-center mb-1 text-sm">
          {labelBefore && <div className="text-gray-400">{labelBefore}</div>}
          {showValue && <div className="text-gray-400">{Math.round(percentage)}%</div>}
          {labelAfter && <div className="text-gray-400">{labelAfter}</div>}
        </div>
      )}
      <div className="progress-bar bg-opacity-10 bg-white h-2 rounded-sm overflow-hidden">
        <div 
          className={`progress-bar-fill ${color} h-full rounded-sm transition-width duration-500`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
