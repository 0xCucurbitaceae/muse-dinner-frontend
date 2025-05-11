import React from 'react';

interface AvatarProps {
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  displayName,
  size = 'md',
  title,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={`flex-shrink-0 ${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
      title={title || displayName}
    >
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {displayName.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};
