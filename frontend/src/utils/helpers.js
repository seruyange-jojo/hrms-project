// Format date utilities
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Format currency
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Get full name
export const getFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'N/A';
  return `${firstName || ''} ${lastName || ''}`.trim();
};

// Get initials
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '??';
};

// Status badge colors
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'badge-success';
    case 'inactive':
      return 'badge-error';
    case 'pending':
      return 'badge-warning';
    case 'approved':
      return 'badge-success';
    case 'rejected':
      return 'badge-error';
    case 'present':
      return 'badge-success';
    case 'absent':
      return 'badge-error';
    case 'late':
      return 'badge-warning';
    default:
      return 'badge-neutral';
  }
};

// Role colors
export const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'badge-primary';
    case 'manager':
      return 'badge-secondary';
    case 'employee':
      return 'badge-accent';
    default:
      return 'badge-neutral';
  }
};

// Calculate work hours
export const calculateWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, Math.round(diffHours * 100) / 100);
  } catch (error) {
    return 0;
  }
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Generate employee code
export const generateEmployeeCode = (lastCode) => {
  if (!lastCode) return 'EMP001';
  
  const match = lastCode.match(/EMP(\d+)/);
  if (match) {
    const number = parseInt(match[1]) + 1;
    return `EMP${number.toString().padStart(3, '0')}`;
  }
  
  return 'EMP001';
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};