interface ProgressRingProps {
  progress: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ProgressRing({ 
  progress, 
  total, 
  size = 80, 
  strokeWidth = 6, 
  className = '' 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (progress / total) * 100;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // 根据进度改变颜色
  const getProgressColor = () => {
    if (progress >= total) return '#10B981'; // green-500 - 完成
    if (progress >= total * 0.8) return '#F59E0B'; // amber-500 - 即将完成
    return '#3B82F6'; // blue-500 - 进行中
  };
  
  const getBackgroundColor = () => {
    if (progress >= total) return '#D1FAE5'; // green-100
    if (progress >= total * 0.8) return '#FEF3C7'; // amber-100
    return '#DBEAFE'; // blue-100
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getBackgroundColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-bold text-gray-900">
          {progress}
        </div>
        <div className="text-xs text-gray-500">
          /{total}
        </div>
      </div>
      
      {/* Status indicator */}
      {progress >= total && (
        <div className="absolute -top-1 -right-1">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}
