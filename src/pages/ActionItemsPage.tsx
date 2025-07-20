import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowRight, Coffee } from 'lucide-react';
import { Button } from '../components/ui/Button';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/layout/Sidebar';

const ActionItemsPage = () => {
  const navigate = useNavigate();

  return (
    <div className='flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50'>
      <Sidebar />
      <div className='flex-1 overflow-auto'>
        <DashboardHeader currentSection='Action Items' />

        {/* Hero Section */}
        <div className='relative px-6 py-12'>
          {/* Main Content */}
          <div className='relative z-10 max-w-4xl mx-auto text-center'>
            {/* Coming Soon Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className='bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 mb-12'
            >
              <div className='flex items-center justify-center mb-6'>
                <div className='relative'>
                  <div className='w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center'>
                    <Coffee className='text-white text-2xl' />
                  </div>
                  <motion.div
                    className='absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className='text-white text-xs font-bold'>!</span>
                  </motion.div>
                </div>
              </div>

              <h2 className='text-2xl font-bold text-gray-800 mb-4'>🚧 Under Construction 🚧</h2>

              <p className='text-gray-600 mb-6 leading-relaxed'>
                We're brewing something amazing! Our dedicated Action Items page is currently being crafted with love. In the meantime, you can view
                and manage all your action items through the meetings page.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => navigate('/meetings')}
                  className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg'
                  leftIcon={<Video className='w-5 h-5' />}
                  rightIcon={<ArrowRight className='w-5 h-5' />}
                >
                  View Action Items in Meetings
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionItemsPage;
