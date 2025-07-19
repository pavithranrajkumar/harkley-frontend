import { Video, Search, Filter, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/layout/Sidebar';
import MeetingCard from '../components/dashboard/MeetingCard';
import { useMeetings } from '../hooks/useMeetings';
import { useState, useEffect } from 'react';

const MeetingsPage = () => {
  const { meetings, loading, error, total, page, totalPages, fetchMeetings } = useMeetings();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch meetings on component mount and when page changes
  useEffect(() => {
    fetchMeetings(currentPage, 10);
  }, [fetchMeetings, currentPage]);

  const handleMeetingClick = (meetingId: string) => {
    console.log('Opening meeting:', meetingId);
    // TODO: Navigate to individual meeting page
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
                <button className='flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                  <Filter className='w-4 h-4 mr-2' />
                  Filter
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center'>
                  <Video className='w-8 h-8 text-blue-600' />
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-blue-600'>Total Meetings</p>
                    <p className='text-2xl font-bold text-blue-900'>{total}</p>
                  </div>
                </div>
              </div>
              <div className='bg-green-50 p-4 rounded-lg'>
                <div className='flex items-center'>
                  <Video className='w-8 h-8 text-green-600' />
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-green-600'>With Transcriptions</p>
                    <p className='text-2xl font-bold text-green-900'>{meetings.filter((m) => m.transcriptions.length > 0).length}</p>
                  </div>
                </div>
              </div>
              <div className='bg-purple-50 p-4 rounded-lg'>
                <div className='flex items-center'>
                  <Video className='w-8 h-8 text-purple-600' />
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-purple-600'>With Action Items</p>
                    <p className='text-2xl font-bold text-purple-900'>{meetings.filter((m) => m.actionItems.length > 0).length}</p>
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
