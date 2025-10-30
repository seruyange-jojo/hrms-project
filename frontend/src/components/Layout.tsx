import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from './RoleBasedComponent';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isHR, isManager, isEmployee } = useRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: '📊', roles: ['hr', 'admin', 'manager', 'employee'] },
    ];

    const roleBasedItems = [
      // HR-only pages
      { name: 'All Employees', href: '/employees', icon: '👥', roles: ['hr', 'admin'] },
      { name: 'Departments', href: '/departments', icon: '🏢', roles: ['hr', 'admin'] },
      { name: 'All Attendance', href: '/attendance', icon: '⏰', roles: ['hr', 'admin'] },
      { name: 'All Leaves', href: '/leaves', icon: '🏖️', roles: ['hr', 'admin'] },
      { name: 'Payroll', href: '/payroll', icon: '💰', roles: ['hr', 'admin'] },
      
      // Manager pages
      { name: 'My Team', href: '/my-team', icon: '👨‍👩‍👧‍👦', roles: ['manager'] },
      { name: 'Team Attendance', href: '/team-attendance', icon: '📋', roles: ['manager'] },
      { name: 'Team Leaves', href: '/team-leaves', icon: '📝', roles: ['manager'] },
      
      // Employee pages
      { name: 'My Profile', href: '/profile', icon: '👤', roles: ['employee'] },
      { name: 'My Attendance', href: '/my-attendance', icon: '⏰', roles: ['employee'] },
      { name: 'My Leaves', href: '/my-leaves', icon: '🏖️', roles: ['employee'] },
      { name: 'My Payroll', href: '/my-payroll', icon: '💰', roles: ['employee'] },
    ];

    // Filter items based on user role
    const userRole = user?.role || '';
    const filteredItems = [...baseItems, ...roleBasedItems].filter(item => 
      item.roles.includes(userRole)
    );

    return filteredItems;
  };

  const navigation = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">HR System</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <span className="text-sm text-gray-700">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.name || user?.email
                  }
                </span>
                <span className={`text-xs ml-2 px-2 py-1 rounded-full font-semibold ${
                  user?.role === 'hr' || user?.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : user?.role === 'manager'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
    </div>
  );
};

export default Layout;



