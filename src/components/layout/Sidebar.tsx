import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SIDEBAR_ROUTES, updateActiveRoute } from '../../constants/routes';
import type { SidebarRoute } from '../../constants/routes';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [routes, setRoutes] = useState<SidebarRoute[]>(SIDEBAR_ROUTES);

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleRouteClick = (route: SidebarRoute) => {
    navigate(route.path);
  };

  // Update active route based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const activeRoute = SIDEBAR_ROUTES.find((route) => route.path === currentPath);
    if (activeRoute) {
      setRoutes(updateActiveRoute(SIDEBAR_ROUTES, activeRoute.id));
    }
  }, [location.pathname]);

  return (
    <aside className='w-64 bg-white border-r border-gray-200 hidden md:block'>
      <div className='p-6'>
        <div className='flex items-center mb-8'>
          <div
            onClick={handleLogoClick}
            className='bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity'
          >
            <Mic className='text-white text-lg' />
          </div>
          <h1
            onClick={handleLogoClick}
            className='ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer hover:opacity-80 transition-opacity'
          >
            Harkley AI
          </h1>
        </div>

        <nav className='space-y-1'>
          {routes.map((route) => {
            const IconComponent = route.icon;
            return (
              <span
                key={route.id}
                onClick={() => handleRouteClick(route)}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition cursor-pointer ${
                  route.isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent className='w-5 h-5 mr-3' />
                <span>{route.label}</span>
              </span>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
