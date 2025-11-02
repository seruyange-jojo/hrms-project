import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './dashboard/AdminDashboard';
import ManagerDashboard from './dashboard/ManagerDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';
import { LoadingOverlay } from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user, isAdmin, isManager, loading } = useAuth();

  // Debug: log whenever Dashboard component renders
  useEffect(() => {
    console.debug('DASHBOARD_RENDER', {
      loading,
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      isAdmin,
      isManager,
      timestamp: new Date().toISOString()
    });
  }, [loading, user, isAdmin, isManager]);

  // Show loading while authentication is being verified
  if (loading) {
    return <LoadingOverlay message="Loading dashboard..." />;
  }

  // Debug panel if user is not loaded
  if (!user) {
    return (
      <div className="p-6">
        <div className="alert alert-warning">
          <div>
            <h3 className="font-bold">Dashboard Debug</h3>
            <div className="text-xs">
              <p>Loading: {String(loading)}</p>
              <p>User: {user ? JSON.stringify(user) : 'null'}</p>
              <p>Please refresh or check authentication.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (isAdmin) {
    console.debug('DASHBOARD_ROUTE: Admin');
    return <AdminDashboard />;
  }
  
  if (isManager) {
    console.debug('DASHBOARD_ROUTE: Manager');
    return <ManagerDashboard />;
  }
  
  // Default to employee dashboard
  console.debug('DASHBOARD_ROUTE: Employee');
  return <EmployeeDashboard />;
};

export default Dashboard;