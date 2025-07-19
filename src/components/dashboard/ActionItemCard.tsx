import { motion } from 'framer-motion';
import { CheckCircle, Undo2 } from 'lucide-react';
import { getPriorityColor } from '../../constants/dashboard';
import type { ActionItem } from '../../types/meeting';

interface ActionItemCardProps {
  item: ActionItem;
  index: number;
  isCompleted: boolean;
  canUndo: boolean;
  countdownSeconds: number;
  onToggle: (itemId: string) => void;
  onUndo: (itemId: string) => void;
}

const ActionItemCard: React.FC<ActionItemCardProps> = ({ item, index, isCompleted, canUndo, countdownSeconds, onToggle, onUndo }) => {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className='p-4'>
      <div className='flex items-start'>
        <div className='mt-1'>
          <button
            onClick={() => onToggle(item.id)}
            className={`rounded text-blue-600 cursor-pointer focus:ring-blue-500 h-4 w-4 transition-all duration-200 ${
              isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <CheckCircle className={`w-4 h-4 `} />
          </button>
        </div>
        <div className='ml-3'>
          <h3 className={`font-medium text-gray-900 transition-all duration-300 ease-in-out relative ${isCompleted ? 'text-gray-500' : ''}`}>
            {item.title}
            {isCompleted && (
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full h-0.5 bg-gray-500 transform origin-left animate-strike'></div>
              </div>
            )}
          </h3>
          <p className='text-sm text-gray-500 mt-1'>From {item.meetingTitle}</p>
          <div className='flex items-center mt-2'>
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
              {item.dueDate === 'No due date' ? 'No due date' : `Due ${item.dueDate}`}
            </span>
            {canUndo && (
              <div className='flex items-center ml-2'>
                <button
                  onClick={() => onUndo(item.id)}
                  className='flex items-center text-xs text-blue-600 hover:text-blue-700 cursor-pointer transition-colors'
                >
                  <Undo2 className='w-3 h-3 mr-1' />
                  Undo
                </button>
                <span className={`text-xs ml-1 ${countdownSeconds <= 2 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>({countdownSeconds}s)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActionItemCard;
