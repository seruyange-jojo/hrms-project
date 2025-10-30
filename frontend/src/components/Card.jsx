import React from 'react';

// Base Card Component
export const Card = ({
  children,
  className = '',
  padding = true,
  shadow = true,
  hover = false,
  bordered = true,
  onClick,
  ...props
}) => {
  const baseClasses = 'card bg-base-100';
  const shadowClass = shadow ? 'shadow-md' : '';
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const borderClass = bordered ? 'border border-base-300' : '';
  const clickableClass = onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform duration-200' : '';
  
  return (
    <div
      className={`${baseClasses} ${shadowClass} ${hoverClass} ${borderClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className={padding ? 'card-body' : ''}>
        {children}
      </div>
    </div>
  );
};

// Card with Header
export const CardWithHeader = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
  ...props
}) => {
  return (
    <Card className={className} {...props}>
      <div className={`flex items-center justify-between mb-4 pb-4 border-b border-base-300 ${headerClassName}`}>
        <div>
          {title && <h3 className="card-title text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm opacity-70 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="card-actions">{action}</div>}
      </div>
      <div className="card-content">
        {children}
      </div>
    </Card>
  );
};

// Stats Card Component
export const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  change,
  changeType = 'neutral',
  trend,
  className = '',
  onClick,
  loading = false
}) => {
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
  };

  const changeClasses = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-base-content opacity-70'
  };

  const colorClass = colorClasses[color] || colorClasses.primary;
  const changeClass = changeClasses[changeType] || changeClasses.neutral;

  return (
    <Card
      className={`group ${onClick ? 'hover:shadow-lg cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      hover={!!onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium opacity-70 mb-2">{title}</h3>
          {loading ? (
            <div className="skeleton h-8 w-24 mb-2"></div>
          ) : (
            <p className="text-2xl font-bold mb-2">{value}</p>
          )}
          {change && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${changeClass}`}>
                {changeType === 'positive' && '+'}
                {change}
              </span>
              {trend && <span className="text-xs opacity-50">vs last period</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`${colorClass} opacity-80 group-hover:opacity-100 transition-opacity`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
    </Card>
  );
};

// Info Card Component
export const InfoCard = ({
  type = 'info',
  title,
  message,
  children,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const typeClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error'
  };

  const typeClass = typeClasses[type] || typeClasses.info;

  return (
    <div className={`alert ${typeClass} ${className}`}>
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {message && <p className="text-sm">{message}</p>}
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="btn btn-sm btn-circle btn-ghost"
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Feature Card Component
export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  features = [],
  actionText,
  onAction,
  featured = false,
  className = ''
}) => {
  return (
    <Card
      className={`text-center ${featured ? 'ring-2 ring-primary ring-opacity-50' : ''} ${className}`}
      hover
    >
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </div>
      )}
      
      {title && <h3 className="card-title justify-center mb-2">{title}</h3>}
      {description && <p className="text-sm opacity-70 mb-4">{description}</p>}
      
      {features.length > 0 && (
        <ul className="text-sm space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      
      {actionText && onAction && (
        <div className="card-actions justify-center">
          <button
            onClick={onAction}
            className={`btn ${featured ? 'btn-primary' : 'btn-outline'}`}
          >
            {actionText}
          </button>
        </div>
      )}
    </Card>
  );
};

// Image Card Component
export const ImageCard = ({
  image,
  alt,
  title,
  description,
  action,
  overlay = false,
  className = ''
}) => {
  return (
    <Card className={`image-full ${className}`} padding={false}>
      {image && (
        <figure>
          <img src={image} alt={alt} className="w-full h-48 object-cover" />
        </figure>
      )}
      
      <div className={`card-body ${overlay ? 'absolute inset-0 bg-black bg-opacity-50 text-white flex flex-col justify-end' : ''}`}>
        {title && <h3 className="card-title">{title}</h3>}
        {description && <p className="text-sm">{description}</p>}
        {action && <div className="card-actions justify-end mt-4">{action}</div>}
      </div>
    </Card>
  );
};

export default Card;