import { motion } from 'framer-motion';
import { Video, CheckCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Meeting } from '../../types/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  index: number;
  onClick: (meetingId: string) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, index, onClick }) => {
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get completion status
  const getCompletionStatus = (meeting: Meeting) => {
    const hasTranscription = meeting.transcriptions.length > 0;
    const hasActionItems = meeting.actionItems.length > 0;

    if (hasTranscription && hasActionItems) {
      return { completed: meeting.actionItems.filter((item) => item.status === 'completed').length, total: meeting.actionItems.length };
    } else if (hasTranscription) {
      return { completed: 1, total: 1 }; // Transcription completed
    } else {
      return { completed: 0, total: 1 }; // No progress
    }
  };

  const completionStatus = getCompletionStatus(meeting);
  const isCompleted = completionStatus.completed === completionStatus.total && completionStatus.total > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => {
        onClick(meeting.id);
        navigate(`/meetings/${meeting.id}`);
      }}
      className='p-4 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 rounded-lg mb-2'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <div className='bg-blue-100 text-blue-700 p-2 rounded-lg mr-3'>
            <Video className='w-4 h-4' />
          </div>
          <div>
            <h3 className='font-medium text-gray-900'>{meeting.title}</h3>
            <p className='text-sm text-gray-500'>
              {formatDate(meeting.createdAt)} • {meeting.duration || 'No duration'}
            </p>
          </div>
        </div>
        <div className='flex space-x-2'>
          <button className='text-gray-500 hover:text-gray-700 transition'>
            <i className='fa-solid fa-ellipsis-vertical'></i>
          </button>
        </div>
      </div>
      <div className='mt-3 flex items-center text-sm'>
        <span className='text-gray-500 mr-4 flex items-center'>
          <FileText className='w-3 h-3 mr-1' />
          {meeting.transcriptions.length} transcriptions
        </span>
        <span className='flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs'>
          <CheckCircle className={`w-3 h-3 mr-1 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
          {completionStatus.completed}/{completionStatus.total}
        </span>
      </div>
    </motion.div>
  );
};

export default MeetingCard;
