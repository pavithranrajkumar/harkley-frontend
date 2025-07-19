import { Calendar, Flag } from 'lucide-react';
import type { ActionItem } from '../../types/meeting';

interface ActionItemCardProps {
  item: ActionItem;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getSpeakerColor: (speakerNumber: number) => string;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({ item, getPriorityColor, getStatusColor, getSpeakerColor }) => {
  return (
    <div className='bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center space-x-2'>
          <div
            className={`w-6 h-6 rounded-full ${getSpeakerColor(item.speakerNumber)} flex items-center justify-center text-white text-xs font-medium`}
          >
            {item.speakerNumber + 1}
          </div>
          <span className='text-sm font-medium text-gray-900'>Speaker {item.speakerNumber + 1}</span>
        </div>
        <div className='flex items-center space-x-1'>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
            <Flag className='w-3 h-3 inline mr-1' />
            {item.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>{item.status}</span>
        </div>
      </div>

      <p className='text-gray-700 text-sm leading-relaxed mb-3'>{item.description}</p>

      {item.dueDate && (
        <div className='flex items-center text-xs text-gray-500'>
          <Calendar className='w-3 h-3 mr-1' />
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default ActionItemCard;
