import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

// Basic Modal Component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  className = '',
  closeOnOverlayClick = true,
  showCloseButton = true
}) => {
  const sizes = {
    small: 'modal-box w-11/12 max-w-md',
    medium: 'modal-box w-11/12 max-w-2xl',
    large: 'modal-box w-11/12 max-w-4xl',
    extraLarge: 'modal-box w-11/12 max-w-6xl'
  };

  const sizeClass = sizes[size] || sizes.medium;

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div 
        className={`${sizeClass} relative ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-base-300">
            {title && (
              <h3 className="font-bold text-lg text-base-content">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost hover:btn-error transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="modal-content">
          {children}
        </div>
      </div>
      
      {/* Overlay */}
      <div 
        className="modal-backdrop bg-black bg-opacity-50"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
    >
      <div className="space-y-6">
        <p className="text-base-content opacity-80">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Form Modal Component
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitVariant = 'primary',
  isLoading = false,
  size = 'medium',
  className = ''
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-content">
          {children}
        </div>
        
        <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={submitVariant}
            type="submit"
            loading={isLoading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Alert Modal Component
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}) => {
  const typeStyles = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
  };

  const typeVariants = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error'
  };

  const typeClass = typeStyles[type] || typeStyles.info;
  const variant = typeVariants[type] || typeVariants.info;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      showCloseButton={false}
    >
      <div className="space-y-6">
        <p className={`text-base-content ${typeClass} font-medium`}>
          {message}
        </p>
        
        <div className="flex justify-center">
          <Button
            variant={variant}
            onClick={onClose}
            className="min-w-24"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;