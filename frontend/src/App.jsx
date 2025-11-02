import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyPayroll from './pages/MyPayroll';
import LeaveRequestNew from './pages/LeaveRequestNew';
import Profile from './pages/Profile';
import Employees from './pages/Employees';
import Departments from './pages/Departments';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen transition-colors duration-200">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'toast-notification',
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Employees routes */}
            <Route path="/employees" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Employees />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Departments routes */}
            <Route path="/departments" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Departments />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Attendance routes */}
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Attendance</h1>
                    <div className="card bg-base-100 shadow-sm">
                      <div className="card-body">
                        <p>Attendance management coming soon...</p>
                      </div>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Leave requests routes */}
            <Route path="/leaves" element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Leave Requests</h1>
                    <div className="card bg-base-100 shadow-sm">
                      <div className="card-body">
                        <p>Leave management coming soon...</p>
                      </div>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />

            {/* New Leave request form */}
            <Route path="/leaves/new" element={
              <ProtectedRoute>
                <Layout>
                  <LeaveRequestNew />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Payroll routes */}
            <Route path="/payroll" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Payroll</h1>
                    <div className="card bg-base-100 shadow-sm">
                      <div className="card-body">
                        <p>Payroll management coming soon...</p>
                      </div>
                    </div>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Employee's payslips */}
            <Route path="/my-payroll" element={
              <ProtectedRoute>
                <Layout>
                  <MyPayroll />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Profile route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 fallback */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="text-center">
                  <div className="text-6xl mb-4">404</div>
                  <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                  <p className="text-gray-600 mb-4">
                    The page you're looking for doesn't exist.
                  </p>
                  <a href="/dashboard" className="btn btn-primary">
                    Go to Dashboard
                  </a>
                </div>
              </div>
            } />
          </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;