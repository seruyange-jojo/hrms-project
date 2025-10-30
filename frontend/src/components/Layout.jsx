import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Clock, 
  Calendar, 
  DollarSign, 
  Menu, 
  LogOut, 
  User,
  X,
  Settings
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Departments',
      href: '/departments',
      icon: Building2,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Clock,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Leave Requests',
      href: '/leaves',
      icon: Calendar,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Payroll',
      href: '/payroll',
      icon: DollarSign,
      roles: ['admin', 'manager', 'employee']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role?.toLowerCase())
  );

  const isCurrentPath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-100 shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-base-300`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-focus rounded-lg flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                H
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-focus bg-clip-text text-transparent">HRMS</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden btn btn-ghost btn-sm hover:bg-base-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const current = isCurrentPath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    current
                      ? 'bg-gradient-to-r from-primary to-primary-focus text-white shadow-md'
                      : 'hover:bg-base-200 hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${current ? '' : 'group-hover:scale-110'}`} />
                  <span className="font-medium">{item.name}</span>
                  {current && (
                    <div className="w-2 h-2 bg-white rounded-full ml-auto animate-bounce-gentle"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-base-300 bg-base-200/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center shadow-md">
                  <User className="w-5 h-5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs opacity-70 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-70">Theme</span>
                <ThemeToggle className="btn-xs" />
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full p-2 hover:bg-base-300 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-base-100 shadow-sm border-b border-base-300 px-4 py-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden btn btn-ghost btn-sm hover:bg-base-200"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold">
                  Welcome back, {user?.firstName}!
                </h2>
                <p className="text-sm opacity-70">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar hover:bg-base-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                </label>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
                  <li className="menu-title">
                    <span className="text-xs opacity-70">Account</span>
                  </li>
                  <li>
                    <Link to="/profile" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <button className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  </li>
                  <div className="divider my-1"></div>
                  <li>
                    <button onClick={handleLogout} className="flex items-center space-x-2 text-error">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;