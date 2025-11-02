import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: 'text-error',
          bgColor: 'bg-error/10',
          buttonVariant: 'error'
        };
      case 'warning':
        return {
          iconColor: 'text-warning',
          bgColor: 'bg-warning/10',
          buttonVariant: 'warning'
        };
      case 'info':
        return {
          iconColor: 'text-info',
          bgColor: 'bg-info/10',
          buttonVariant: 'info'
        };
      default:
        return {
          iconColor: 'text-error',
          bgColor: 'bg-error/10',
          buttonVariant: 'error'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${styles.bgColor} flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="opacity-80">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={styles.buttonVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
