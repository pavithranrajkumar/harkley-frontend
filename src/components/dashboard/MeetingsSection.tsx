import { ArrowRight, AlertCircle, Loader2, Video, Mic } from 'lucide-react';
import { Button } from '../ui/Button';
import MeetingCard from '../shared/MeetingCard';
import type { Meeting } from '../../types/meeting';

interface MeetingsSectionProps {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  onMeetingClick: (meetingId: string) => void;
  onViewAll: () => void;
  onStartRecording: () => void;
}

const LoadingState = () => (
  <div className='flex items-center justify-center py-8'>
    <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
    <span className='ml-2 text-gray-600'>Loading meetings...</span>
  </div>
);

const ErrorState = ({ error }: { error: string }) => (
  <div className='flex items-center justify-center py-8 text-red-600'>
    <AlertCircle className='w-5 h-5 mr-2' />
    <span>{error}</span>
  </div>
);

const EmptyState = ({ onStartRecording }: { onStartRecording: () => void }) => (
  <div className='flex flex-col items-center justify-center py-12 text-center'>
    <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
      <Video className='w-8 h-8 text-blue-600' />
    </div>
    <h3 className='text-lg font-semibold text-gray-900 mb-2'>No meetings yet</h3>
    <p className='text-gray-500 mb-4 max-w-sm'>
      Start your first meeting recording to see it appear here. Harkley AI will automatically transcribe and extract action items.
    </p>
    <Button
      onClick={onStartRecording}
      className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium'
      leftIcon={<Mic size={16} />}
    >
      Start Recording
    </Button>
  </div>
);

const MeetingsList = ({ meetings, onMeetingClick }: { meetings: Meeting[]; onMeetingClick: (meetingId: string) => void }) => (
  <div className='p-4'>
    {meetings.map((meeting, index) => (
      <MeetingCard key={meeting.id} meeting={meeting} index={index} onClick={onMeetingClick} />
    ))}
  </div>
);

const MeetingsSection: React.FC<MeetingsSectionProps> = ({ meetings, loading, error, onMeetingClick, onViewAll, onStartRecording }) => {
  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (meetings.length === 0) return <EmptyState onStartRecording={onStartRecording} />;
    return <MeetingsList meetings={meetings} onMeetingClick={onMeetingClick} />;
  };

  return (
    <div className='xl:col-span-2'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-gray-900'>Recent Meetings</h2>
        <span onClick={onViewAll} className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center cursor-pointer'>
          View All
          <ArrowRight className='w-4 h-4 ml-1' />
        </span>
      </div>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>{renderContent()}</div>
    </div>
  );
};

export default MeetingsSection;
