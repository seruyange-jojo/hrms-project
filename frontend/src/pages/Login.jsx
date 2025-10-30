import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { FullPageLoader, LoadingSpinner } from '../components/LoadingSpinner';

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Navigation will be handled by the auth context and route protection
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = (email, password) => {
    setFormData({ email, password });
  };

  if (authLoading) {
    return <FullPageLoader text="Loading HRMS..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full animate-fade-in">
        <div className="card bg-base-100 shadow-2xl border border-base-300 backdrop-blur-sm">
          <div className="card-body p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-focus rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg animate-bounce-gentle">
                  H
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent mb-2">
                HRMS
              </h1>
              <p className="opacity-70 text-sm">Human Resource Management System</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email Address</span>
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-12 pr-4 focus:input-primary transition-all duration-200 group-hover:border-primary/50"
                    placeholder="Enter your email address"
                    required
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50 w-5 h-5 transition-colors group-focus-within:text-primary" />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-bordered w-full pl-12 pr-12 focus:input-primary transition-all duration-200 group-hover:border-primary/50"
                    placeholder="Enter your password"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50 w-5 h-5 transition-colors group-focus-within:text-primary" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full text-base font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="divider opacity-60">
              <span className="text-xs font-medium">Demo Accounts</span>
            </div>

            {/* Quick Login Buttons */}
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('admin@hrms.com', 'admin123')}
                className="btn btn-outline btn-sm hover:btn-primary transition-all duration-200"
                disabled={isSubmitting}
              >
                <User className="w-4 h-4 mr-2" />
                Login as Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('manager@hrms.com', 'manager123')}
                className="btn btn-outline btn-sm hover:btn-primary transition-all duration-200"
                disabled={isSubmitting}
              >
                <User className="w-4 h-4 mr-2" />
                Login as Manager
              </button>
              <button
                type="button"
                onClick={() => quickLogin('employee@hrms.com', 'employee123')}
                className="btn btn-outline btn-sm hover:btn-primary transition-all duration-200"
                disabled={isSubmitting}
              >
                <User className="w-4 h-4 mr-2" />
                Login as Employee
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm opacity-60">
            &copy; 2025 HRMS. All rights reserved.
          </p>
          <div className="flex justify-center items-center mt-2 space-x-4 text-xs opacity-50">
            <span>Secure</span>
            <span>•</span>
            <span>Reliable</span>
            <span>•</span>
            <span>Modern</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;