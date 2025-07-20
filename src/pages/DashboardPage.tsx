import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/layout/Sidebar';
import HeroBanner from '../components/dashboard/HeroBanner';
import MeetingsSection from '../components/dashboard/MeetingsSection';
import ActionItemsSection from '../components/dashboard/ActionItemsSection';
import RecordingInstructionsModal from '../components/modals/RecordingInstructionsModal';
import { useActionItems } from '../hooks/useActionItems';
import { useActionItemCompletion } from '../hooks/useActionItemCompletion';
import { useHarkleyExtension } from '../hooks/useHarkleyExtension';
import { useMeetings } from '../hooks/useMeetings';
import { useState, useEffect } from 'react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { status: extensionStatus, startRecording, stopRecording } = useHarkleyExtension();
  const { meetings, loading: meetingsLoading, error: meetingsError, fetchRecentMeetings } = useMeetings();
  const { actionItems, loading: actionItemsLoading, fetchActionItems, updateActionItem } = useActionItems();
  const { pendingCompletions, countdowns, handleToggle, handleUndo, isCompleted } = useActionItemCompletion();
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // Fetch recent meetings and action items on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency array - only run once on mount

  const fetchDashboardData = () => {
    fetchRecentMeetings();
    fetchActionItems();
  };

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
    navigate(`/meetings/${meetingId}`);
  };

  const handleActionItemToggle = (itemId: string) => {
    const item = actionItems.find((item) => item.id === itemId);
    if (item) {
      const computedStatus = isCompleted(itemId, item.status) ? 'completed' : item.status;
      handleToggle(itemId, computedStatus, updateActionItem);
    }
  };

  const handleActionItemUndo = (itemId: string) => {
    const item = actionItems.find((item) => item.id === itemId);
    if (item) {
      handleUndo(itemId, item.status, updateActionItem);
    }
  };

  const handleInstallExtension = () => {
    // For now, just show a message. In real app, this would open extension store
    alert('Extension installation would open Chrome Web Store here');
  };

  const handleRecordingUploadSuccess = () => {
    fetchDashboardData();
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      <Sidebar />
      <div className='flex-1 overflow-auto'>
        <DashboardHeader currentSection='Dashboard' />

        <HeroBanner
          extensionStatus={extensionStatus}
          onStartRecording={handleStartRecording}
          onInstallExtension={handleInstallExtension}
          onUploadSuccess={handleRecordingUploadSuccess}
        />

        <div className='mx-auto px-6 pb-8'>
          <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
            <MeetingsSection
              meetings={meetings}
              loading={meetingsLoading}
              error={meetingsError}
              onMeetingClick={handleMeetingClick}
              onViewAll={() => navigate('/meetings')}
              onStartRecording={() => setShowInstructionsModal(true)}
            />

            <ActionItemsSection
              actionItems={actionItems}
              loading={actionItemsLoading}
              pendingCompletions={pendingCompletions}
              countdowns={countdowns}
              onToggle={handleActionItemToggle}
              onUndo={handleActionItemUndo}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </div>

      <RecordingInstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        onStartRecording={handleStartRecordingFromModal}
      />
    </div>
  );
};

export default DashboardPage;
