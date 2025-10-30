import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './dashboard/AdminDashboard';
import ManagerDashboard from './dashboard/ManagerDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';
import { LoadingOverlay } from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, isAdmin, isManager, loading } = useAuth();

  // Show loading while authentication is being verified
  if (loading) {
    return <LoadingOverlay message="Loading dashboard..." />;
  }

  // Route to appropriate dashboard based on user role
  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  if (isManager) {
    return <ManagerDashboard />;
  }
  
  // Default to employee dashboard
  return <EmployeeDashboard />;
};

export default Dashboard;