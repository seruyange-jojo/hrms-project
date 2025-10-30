import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

const Button = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    success: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-error',
    info: 'btn-info'
  };

  const sizes = {
    small: 'btn-sm',
    medium: '',
    large: 'btn-lg',
    wide: 'btn-wide',
    block: 'btn-block'
  };

  const spinnerSizes = {
    small: 'small',
    medium: 'medium',
    large: 'large',
    wide: 'medium',
    block: 'medium'
  };

  const baseClasses = 'btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]';
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.medium;
  const disabledClass = (loading || disabled) ? 'disabled:opacity-70' : '';

  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size={spinnerSizes[size]} />
          {typeof children === 'string' ? `${children}...` : children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;