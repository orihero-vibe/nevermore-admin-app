import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';

const navigationItems = [
  { path: '/dashboard', name: 'Dashboard', icon: '📊' },
  { path: '/users', name: 'Users', icon: '👥' },
  { path: '/settings', name: 'Settings', icon: '⚙️' },
];

export const Sidebar = () => {
  const location = useLocation();
  const sidebarOpen = useStore((state) => state.sidebarOpen);

  return (
    <div
      className={`bg-gray-900 text-white min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="p-4 border-b border-gray-800">
        <h1 className={`font-bold text-xl truncate ${!sidebarOpen && 'hidden'}`}>
          Nevermore Admin
        </h1>
      </div>
      
      <nav className="mt-4">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 transition hover:bg-gray-800 ${
                isActive ? 'bg-gray-800 border-l-4 border-blue-500' : ''
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

