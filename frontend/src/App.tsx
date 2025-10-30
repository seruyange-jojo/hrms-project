import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* HR-only routes */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <Layout>
              <Employees />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <Layout>
              <Departments />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <Layout>
              <Attendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <Layout>
              <Leaves />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <Layout>
              <div>Payroll Management (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Manager routes */}
      <Route
        path="/my-team"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout>
              <div>My Team Management (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-attendance"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout>
              <div>Team Attendance Report (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-leaves"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <Layout>
              <div>Team Leave Requests (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Employee routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <div>My Profile (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <div>My Attendance (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-leaves"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <div>My Leave Requests (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-payroll"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <Layout>
              <div>My Payroll (Coming Soon)</div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;



