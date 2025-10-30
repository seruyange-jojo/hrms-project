import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Input Field Component
export const InputField = ({
  label,
  error,
  required = false,
  className = '',
  inputClassName = '',
  ...props
}) => {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <input
        className={`input input-bordered w-full transition-all duration-200 
          focus:input-primary focus:border-opacity-70 focus:shadow-sm
          ${error ? 'input-error' : ''} ${inputClassName}`}
        {...props}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

// Password Input Component
export const PasswordField = ({
  label = 'Password',
  showPassword,
  onTogglePassword,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`input input-bordered w-full pr-10 transition-all duration-200 
            focus:input-primary focus:border-opacity-70 focus:shadow-sm
            ${error ? 'input-error' : ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 
            text-gray-500 hover:text-gray-700 focus:outline-none
            transition-colors duration-200"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

// Select Field Component
export const SelectField = ({
  label,
  options = [],
  error,
  required = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <select
        className={`select select-bordered w-full transition-all duration-200 
          focus:select-primary focus:border-opacity-70 focus:shadow-sm
          ${error ? 'select-error' : ''}`}
        {...props}
      >
        <option disabled value="">
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

// Textarea Field Component
export const TextareaField = ({
  label,
  error,
  required = false,
  className = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <textarea
        rows={rows}
        className={`textarea textarea-bordered w-full transition-all duration-200 
          focus:textarea-primary focus:border-opacity-70 focus:shadow-sm resize-none
          ${error ? 'textarea-error' : ''}`}
        {...props}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

// Checkbox Field Component
export const CheckboxField = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-control ${className}`}>
      <label className="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          className={`checkbox checkbox-primary transition-all duration-200
            ${error ? 'checkbox-error' : ''}`}
          {...props}
        />
        <span className="label-text">{label}</span>
      </label>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

// Radio Field Component
export const RadioField = ({
  label,
  options = [],
  name,
  value,
  onChange,
  error,
  required = false,
  className = '',
}) => {
  return (
    <div className={`form-control ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <div className="flex flex-wrap gap-4">
        {options.map((option, index) => (
          <label key={option.value || index} className="label cursor-pointer justify-start gap-2">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className={`radio radio-primary transition-all duration-200
                ${error ? 'radio-error' : ''}`}
            />
            <span className="label-text">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};

// File Input Field Component
export const FileField = ({
  label,
  error,
  required = false,
  accept,
  multiple = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-medium">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className={`file-input file-input-bordered w-full transition-all duration-200 
          focus:file-input-primary focus:border-opacity-70 focus:shadow-sm
          ${error ? 'file-input-error' : ''}`}
        {...props}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
};