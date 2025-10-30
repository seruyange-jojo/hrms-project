import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
    xl: 'loading-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <span className={`loading loading-spinner ${sizeClasses[size]} text-primary`}></span>
      {text && (
        <p className="text-sm opacity-70 animate-pulse">{text}</p>
      )}
    </div>
  );
};

const LoadingOverlay = ({ loading, children, text = 'Loading...' }) => {
  if (!loading) return children;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm rounded-lg">
        <LoadingSpinner text={text} />
      </div>
    </div>
  );
};

const FullPageLoader = ({ text = 'Loading application...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-base-200">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-focus rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg animate-bounce-gentle mb-6">
        H
      </div>
      <LoadingSpinner size="lg" text={text} />
    </div>
  </div>
);

export { LoadingSpinner, LoadingOverlay, FullPageLoader };
export default LoadingSpinner;