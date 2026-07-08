import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileUser, 
  Building2, 
  BarChart3, 
  History, 
  User, 
  ShieldAlert,
  Crown
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice Mock', path: '/practice', icon: BookOpen },
    { name: 'Resume Interview', path: '/resume-interview', icon: FileUser },
    { name: 'Company Specific', path: '/company-specific', icon: Building2 },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'History Logs', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
  ];


  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed md:sticky top-[73px] left-0 z-40 h-[calc(100vh-73px)] w-64 
        border-r border-neutral-900 bg-neutral-950 px-4 py-6
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Navigation list */}
        <nav className="flex flex-col h-full justify-between pb-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    onClick={() => onClose()}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group
                      ${isActive 
                        ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-500 font-semibold' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                      }
                    `}
                  >
                    <IconComponent className={`w-4.5 h-4.5 transition-transform group-hover:scale-110`} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
