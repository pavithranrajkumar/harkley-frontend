import { motion } from 'framer-motion';
import { Video, CheckCircle } from 'lucide-react';
import { getCompletionIconColor } from '../../constants/dashboard';
import type { Meeting } from '../../types/meeting';

interface MeetingCardProps {
  meeting: Meeting;
  index: number;
  onClick: (meetingId: string) => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick(meeting.id)}
      className='p-4 hover:bg-gray-50 transition-colors cursor-pointer'
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          <div className='bg-blue-100 text-blue-700 p-2 rounded-lg mr-3'>
            <Video className='w-4 h-4' />
          </div>
          <div>
            <h3 className='font-medium text-gray-900'>{meeting.title}</h3>
            <p className='text-sm text-gray-500'>
              {meeting.date} • {meeting.duration}
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
        <span className='text-gray-500 mr-4'>{meeting.participants} participants</span>
        <span className='flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs'>
          <CheckCircle className={`w-3 h-3 mr-1 ${getCompletionIconColor(meeting.completedTasks, meeting.totalTasks)}`} />
          {meeting.completedTasks}/{meeting.totalTasks}
        </span>
      </div>
    </motion.div>
  );
};

export default MeetingCard;
