import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import type { Meeting } from '../../types/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  index: number;
  onClick: (meetingId: string) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, index, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  const getStatusConfig = (status: string) => {
    const statusConfigs = {
      queued: {
        className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: 'Transcribing',
      },
      analyzing: {
        className: 'text-blue-600 bg-blue-50 border-blue-200',
        label: 'Generating Summary',
      },
      completed: {
        className: 'text-green-600 bg-green-50 border-green-200',
        label: 'Transcription Completed',
      },
      failed: {
        className: 'text-red-600 bg-red-50 border-red-200',
        label: 'Transcription Failed',
      },
    };

    return (
      statusConfigs[status as keyof typeof statusConfigs] || {
        className: 'text-gray-600 bg-gray-50 border-gray-200',
        label: status,
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick(meeting.id)}
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
              {formatDate(meeting.createdAt)} • {formatFileSize(meeting.file_size)} MB
            </p>
            {meeting.summary && <p className='text-sm text-gray-600 mt-1 line-clamp-2'>{meeting.summary}</p>}
          </div>
        </div>
      </div>
      <div className='mt-3 flex items-center justify-between text-sm'>
        {(() => {
          const statusConfig = getStatusConfig(meeting.status);
          return (
            <span className='text-gray-500'>
              <span className={`text-xs px-2 py-1 rounded-full border ${statusConfig.className}`}>{statusConfig.label}</span> &nbsp;&nbsp;
              {/* {formatFileSize(meeting.file_size)} MB */}
            </span>
          );
        })()}
        <span className='text-xs text-gray-500'>{formatDate(meeting.updatedAt)}</span>
      </div>
    </motion.div>
  );
};

export default MeetingCard;
