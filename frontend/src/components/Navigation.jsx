import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building2, 
  Clock, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Navigation Item Component
const NavItem = ({ 
  to, 
  icon: Icon, 
  label, 
  badge, 
  children, 
  className = '',
  onClick 
}) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = location.pathname === to || (children && children.some(child => location.pathname === child.to));
  const hasChildren = children && children.length > 0;

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
    if (onClick) onClick(e);
  };

  const baseClasses = `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
    hover:bg-base-200 hover:scale-[1.02] active:scale-[0.98] group
    ${isActive ? 'bg-primary text-primary-content shadow-md' : 'text-base-content'}
    ${className}
  `;

  const ItemContent = () => (
    <>
      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-content' : 'text-primary group-hover:text-primary'}`} />
      <span className="font-medium flex-1">{label}</span>
      {badge && (
        <div className={`badge badge-sm ${isActive ? 'badge-neutral' : 'badge-primary'}`}>
          {badge}
        </div>
      )}
      {hasChildren && (
        <div className="text-sm">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      )}
    </>
  );

  return (
    <div>
      {hasChildren ? (
        <button className={baseClasses} onClick={handleClick}>
          <ItemContent />
        </button>
      ) : (
        <Link to={to} className={baseClasses} onClick={handleClick}>
          <ItemContent />
        </Link>
      )}
      
      {hasChildren && isExpanded && (
        <div className="ml-8 mt-2 space-y-1 border-l-2 border-base-300 pl-4">
          {children.map((child, index) => (
            <NavItem key={index} {...child} className="text-sm" />
          ))}
        </div>
      )}
    </div>
  );
};

// Navigation Section Component
const NavSection = ({ title, children }) => (
  <div className="mb-6">
    {title && (
      <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content opacity-60 mb-3 px-4">
        {title}
      </h3>
    )}
    <nav className="space-y-1">
      {children}
    </nav>
  </div>
);

// User Profile Component
const UserProfile = ({ user, onLogout, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="avatar">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center text-xs font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-base-300">
      <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-focus text-white flex items-center justify-center text-sm font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs opacity-70 truncate">
            {user?.email}
          </p>
        </div>
        <div className="dropdown dropdown-top dropdown-end">
          <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
            <Settings className="w-4 h-4" />
          </button>
          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-300">
            <li>
              <Link to="/profile" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Profile
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </li>
            <li>
              <button onClick={onLogout} className="flex items-center gap-2 text-error hover:bg-error hover:text-error-content">
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Navigation Component
export const Navigation = ({ 
  user, 
  onLogout, 
  compact = false, 
  className = '',
  permissions = {} 
}) => {
  const isAdmin = permissions.isAdmin || user?.role === 'admin';
  const isManager = permissions.isManager || user?.role === 'manager';

  const navigationItems = [
    {
      title: 'Main',
      items: [
        {
          to: '/dashboard',
          icon: Home,
          label: 'Dashboard'
        }
      ]
    },
    {
      title: 'Management',
      items: [
        {
          to: '/employees',
          icon: Users,
          label: 'Employees',
          badge: isAdmin ? null : null,
          children: isAdmin ? [
            { to: '/employees', icon: Users, label: 'All Employees' },
            { to: '/employees/create', icon: Users, label: 'Add Employee' }
          ] : undefined
        },
        {
          to: '/departments',
          icon: Building2,
          label: 'Departments'
        },
        {
          to: '/attendance',
          icon: Clock,
          label: 'Attendance',
          children: [
            { to: '/attendance', icon: Clock, label: 'View Attendance' },
            { to: '/attendance/mark', icon: Clock, label: 'Mark Attendance' }
          ]
        },
        {
          to: '/leaves',
          icon: Calendar,
          label: 'Leave Management',
          children: [
            { to: '/leaves', icon: Calendar, label: 'Leave Requests' },
            { to: '/leaves/request', icon: Calendar, label: 'Request Leave' }
          ]
        }
      ].filter(item => {
        // Filter based on permissions
        if (item.to === '/employees' && !isAdmin && !isManager) return false;
        if (item.to === '/departments' && !isAdmin) return false;
        return true;
      })
    },
    {
      title: 'Reports',
      items: isAdmin || isManager ? [
        {
          to: '/reports',
          icon: BarChart3,
          label: 'Reports',
          children: [
            { to: '/reports/attendance', icon: Clock, label: 'Attendance Reports' },
            { to: '/reports/leaves', icon: Calendar, label: 'Leave Reports' },
            { to: '/reports/employees', icon: Users, label: 'Employee Reports' }
          ]
        },
        {
          to: '/analytics',
          icon: FileText,
          label: 'Analytics'
        }
      ] : []
    },
    {
      title: 'System',
      items: isAdmin ? [
        {
          to: '/settings',
          icon: Settings,
          label: 'Settings'
        }
      ] : []
    }
  ].filter(section => section.items.length > 0);

  if (compact) {
    return (
      <nav className={`space-y-2 ${className}`}>
        <UserProfile user={user} compact />
        {navigationItems.map((section) => (
          section.items.map((item, index) => (
            <div key={index} className="px-2">
              <Link 
                to={item.to}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-base-200 transition-colors"
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
              </Link>
            </div>
          ))
        ))}
      </nav>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto py-4">
        {navigationItems.map((section, sectionIndex) => (
          <NavSection key={sectionIndex} title={section.title}>
            {section.items.map((item, itemIndex) => (
              <NavItem key={itemIndex} {...item} />
            ))}
          </NavSection>
        ))}
      </div>
      
      <UserProfile user={user} onLogout={onLogout} />
    </div>
  );
};

export default Navigation;