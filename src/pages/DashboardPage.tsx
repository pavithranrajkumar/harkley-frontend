import { motion } from 'framer-motion';
import { Mic, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/layout/Sidebar';
import MeetingCard from '../components/dashboard/MeetingCard';
import ActionItemCard from '../components/dashboard/ActionItemCard';
import RecordingInstructionsModal from '../components/modals/RecordingInstructionsModal';
import { MOCK_RECENT_MEETINGS, MOCK_ACTION_ITEMS } from '../constants/dashboard';
import { useActionItems } from '../hooks/useActionItems';
import { useHarkleyExtension } from '../hooks/useHarkleyExtension';
import { useState } from 'react';

const DashboardPage = () => {
  const { actionItems, completedItems, undoItems, countdownTimers, handleActionItemToggle, handleUndo } = useActionItems(MOCK_ACTION_ITEMS);
  const { status: extensionStatus, startRecording, stopRecording } = useHarkleyExtension();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  const handleStartRecording = async () => {
    try {
      if (extensionStatus.isRecording) {
        await stopRecording();
      } else {
        // Show instructions modal before starting recording
        setShowInstructionsModal(true);
      }
    } catch (error) {
      console.error('Recording error:', error);
      // Error is already handled in the hook and displayed in status
    }
  };

  const handleStartRecordingFromModal = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Recording error:', error);
      // Error is already handled in the hook and displayed in status
    }
  };

  const handleMeetingClick = (meetingId: string) => {
    console.log('Opening meeting:', meetingId);
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 overflow-auto'>
        <DashboardHeader currentSection='Dashboard' />

        {/* Hero Banner */}
        <div className='mx-auto mt-8 px-6'>
          <div className='bg-gradient-to-r  from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white'>
            <div className='flex items-center justify-between'>
              <div className='text-white'>
                <h1 className='text-3xl font-bold mb-2'>Ready to start a new meeting?</h1>
                <p className='text-blue-100 text-lg'>Harkley AI will record, transcribe, and extract action items automatically.</p>
              </div>

              {extensionStatus.isInstalled ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleStartRecording}
                    variant='secondary'
                    className={`px-8 py-4 rounded-lg shadow-lg font-semibold cursor-pointer transition-all ${
                      extensionStatus.isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-blue-600 hover:bg-gray-50'
                    }`}
                    leftIcon={<Mic size={20} />}
                  >
                    {extensionStatus.isRecording ? 'Stop Recording' : 'Start Recording'}
                  </Button>
                </motion.div>
              ) : (
                <div className='flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20'>
                  <AlertCircle className='text-orange-300 flex-shrink-0' size={20} />
                  <div className='text-left'>
                    <p className='text-white font-medium text-sm'>Extension Required</p>
                    <p className='text-blue-100 text-xs'>Install extension to record meetings</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='mx-auto px-6 pb-8'>
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
            {/* Recent Meetings - Takes 2/3 of space */}
            <div className='xl:col-span-2'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-gray-900'>Recent Meetings</h2>
                <span className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center cursor-pointer'>
                  View All
                  <ArrowRight className='w-4 h-4 ml-1' />
                </span>
              </div>
              <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                {MOCK_RECENT_MEETINGS.map((meeting, index) => (
                  <div key={meeting.id} className={index !== MOCK_RECENT_MEETINGS.length - 1 ? 'border-b border-gray-200' : ''}>
                    <MeetingCard meeting={meeting} index={index} onClick={handleMeetingClick} />
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Action Items - Takes 1/3 of space */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-bold text-gray-900'>Pending Action Items</h2>
                <span className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center cursor-pointer'>
                  View All
                  <ArrowRight className='w-4 h-4 ml-1' />
                </span>
              </div>
              <div className='bg-white rounded-xl shadow-sm'>
                {actionItems.map((item, index) => (
                  <div key={item.id} className={index !== actionItems.length - 1 ? 'border-b border-gray-200' : ''}>
                    <ActionItemCard
                      item={item}
                      index={index}
                      isCompleted={completedItems[item.id]}
                      canUndo={undoItems[item.id]}
                      countdownSeconds={countdownTimers[item.id] || 0}
                      onToggle={handleActionItemToggle}
                      onUndo={handleUndo}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Instructions Modal */}
      <RecordingInstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        onStartRecording={handleStartRecordingFromModal}
      />
    </div>
  );
};

export default DashboardPage;
