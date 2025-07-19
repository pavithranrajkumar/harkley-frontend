import React from 'react';
import { motion } from 'framer-motion';
import { Bell, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

interface DashboardHeaderProps {
  currentSection?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentSection = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  return (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className='bg-white border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-xl font-bold text-gray-900'>{currentSection}</h1>
        </div>

        <div className='flex items-center space-x-4'>
          {/* Notification icon - commented out for now */}
          <div className='flex items-center space-x-2'>
            <button className='cursor-pointer p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative'>
              <Bell size={20} />
              <span className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center'>3</span>
            </button>
          </div>

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
                  className='w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
