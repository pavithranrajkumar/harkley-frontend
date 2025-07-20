import React from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

interface DashboardHeaderProps {
  currentSection?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentSection = 'Dashboard' }) => {
  const { user, logout, isLoggingOut } = useAuth();

  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-xl font-bold text-gray-900'>{currentSection}</h1>
        </div>

        <div className='flex items-center space-x-4'>
          <div className='relative group'>
            <button className='flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'>
              <Avatar src={user?.avatar} name={user?.name} size='md' />
              <div className='hidden md:block text-left'>
                <p className='text-sm font-medium text-gray-900'>{user?.name || 'User'}</p>
                <p className='text-xs text-gray-500'>{user?.email || 'user@example.com'}</p>
              </div>
            </button>

            <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
              <div className='p-2'>
                <button
                  onClick={logout}
                  disabled={isLoggingOut}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isLoggingOut ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                  }`}
                >
                  {isLoggingOut ? <Loader2 size={16} className='animate-spin' /> : <LogOut size={16} />}
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
