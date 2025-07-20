import { Video, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/layout/Sidebar';
import MeetingCard from '../components/shared/MeetingCard';
import { useMeetings } from '../hooks/useMeetings';
import { meetingService } from '../services/meetingService';
import { formatDuration } from '../utils/meetingUtils';
import { useState, useEffect } from 'react';
import type { MeetingStats } from '../types/meeting';

const MeetingsPage = () => {
  const navigate = useNavigate();
  const { meetings, loading, error, total, page, totalPages, fetchMeetings } = useMeetings();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch meetings and stats on component mount
  useEffect(() => {
    fetchMeetings(currentPage, 10);
    fetchStats();
  }, [fetchMeetings, currentPage]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await meetingService.getMeetingStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleMeetingClick = (meetingId: string) => {
    navigate(`/meetings/${meetingId}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const filteredMeetings = meetings.filter((meeting) => meeting.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 overflow-auto'>
        <DashboardHeader currentSection='Meetings' />

        {/* Header Section */}
        <div className='mx-auto mt-8 px-6 max-w-6xl'>
          <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>All Meetings</h1>
                <p className='text-gray-600 mt-1'>{loading ? 'Loading...' : `${total} meetings found`}</p>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <input
                    type='text'
                    placeholder='Search meetings...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center'>
                  <Video className='w-8 h-8 text-blue-600' />
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-blue-600'>Total Meetings</p>
                    <p className='text-2xl font-bold text-blue-900'>{statsLoading ? '...' : stats?.totalMeetings || 0}</p>
                  </div>
                </div>
              </div>

              <div className='bg-purple-50 p-4 rounded-lg'>
                <div className='flex items-center'>
                  <Clock className='w-8 h-8 text-purple-600' />
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-purple-600'>Total Duration</p>
                    <p className='text-2xl font-bold text-purple-900'>{statsLoading ? '...' : formatDuration(stats?.totalDuration || 0)}</p>
                  </div>
                </div>
              </div>
              <div className='bg-orange-50 p-4 rounded-lg'>
                <div className='flex items-center'>
                  <Clock className='w-8 h-8 text-orange-600' />
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-orange-600'>Avg Duration</p>
                    <p className='text-2xl font-bold text-orange-900'>{statsLoading ? '...' : formatDuration(stats?.averageDuration || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className='mx-auto px-6 pb-8 max-w-6xl'>
          <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
                <span className='ml-3 text-gray-600'>Loading meetings...</span>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center py-12 text-red-600'>
                <AlertCircle className='w-8 h-8 mr-3' />
                <span>{error}</span>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                <Video className='w-12 h-12 mb-4 text-gray-300' />
                <p className='text-lg font-medium mb-2'>{searchTerm ? 'No meetings found' : 'No meetings yet'}</p>
                <p className='text-sm'>{searchTerm ? 'Try adjusting your search terms' : 'Start recording your first meeting to see it here'}</p>
              </div>
            ) : (
              <div className='p-4'>
                {filteredMeetings.map((meeting, index) => (
                  <MeetingCard key={meeting.id} meeting={meeting} index={index} onClick={handleMeetingClick} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className='flex items-center justify-between mt-6'>
              <div className='text-sm text-gray-700'>
                Showing page {page} of {totalPages}
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className='flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <ChevronLeft className='w-4 h-4' />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className='flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next
                  <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
