import { motion } from 'framer-motion';
import { Check, Undo2, User } from 'lucide-react';
import { getPriorityColor, getStatusColor } from '../../utils/meetingUtils';
import type { ActionItem } from '../../types/actionItem';
import { memo } from 'react';

interface ActionItemCardProps {
  item: ActionItem;
  index: number;
  isCompleted?: boolean;
  canUndo?: boolean;
  countdownSeconds?: number;
  onToggle?: (itemId: string) => void;
  onUndo?: (itemId: string) => void;
  showControls?: boolean;
}

const ActionItemCard: React.FC<ActionItemCardProps> = memo(
  ({ item, index, isCompleted = false, canUndo = false, countdownSeconds = 0, onToggle, onUndo, showControls = true }) => {
    // Helper function to format due date
    const formatDueDate = (dueDate: string | null): string | null => {
      if (!dueDate || dueDate === 'null' || dueDate === '') return null;

      const date = new Date(dueDate);
      return isNaN(date.getTime()) ? null : date.toLocaleDateString();
    };

    // Helper function to get checkbox styles
    const getCheckboxStyles = () => {
      const baseStyles =
        'relative outline-none flex items-center justify-center w-4 h-4 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-offset-2 cursor-pointer';

      if (isCompleted) {
        return `${baseStyles} bg-green-500 border-green-500 text-white shadow-sm`;
      }

      return `${baseStyles} bg-white border-gray-300 hover:border-gray-400 text-transparent`;
    };

    // Helper function to get title styles
    const getTitleStyles = () => {
      const baseStyles = 'font-medium text-gray-900 transition-all duration-300 ease-in-out relative';
      return isCompleted ? `${baseStyles} text-gray-500 line-through` : baseStyles;
    };

    // Helper function to get countdown styles
    const getCountdownStyles = () => {
      return countdownSeconds <= 2 ? 'text-red-500 font-medium' : 'text-gray-500';
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className='p-4 border border-gray-200 rounded-lg'
      >
        <div className='flex items-start'>
          {showControls && (
            <div className='mt-1'>
              <button onClick={() => onToggle?.(item.id)} className={getCheckboxStyles()}>
                {isCompleted && <Check className='w-3 h-3' />}
              </button>
            </div>
          )}

          <div className={`${showControls ? 'ml-3' : ''} flex-1`}>
            <h3 className={getTitleStyles()}>{item.description || 'No description'}</h3>

            <div className='flex items-center mt-2 space-x-2 flex-wrap'>
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>{item.priority || 'No priority'}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>{item.status || 'No status'}</span>

              {item.assignee && (
                <span className='text-xs text-gray-600 flex items-center'>
                  <User className='w-3 h-3 mr-1' />
                  {item.assignee}
                </span>
              )}

              {formatDueDate(item.dueDate) && <span className='text-xs text-gray-500'>Due: {formatDueDate(item.dueDate)}</span>}
            </div>

            {canUndo && showControls && (
              <div className='flex items-center mt-2'>
                <button
                  onClick={() => onUndo?.(item.id)}
                  className='flex items-center text-xs text-blue-600 hover:text-blue-700 cursor-pointer transition-colors'
                >
                  <Undo2 className='w-3 h-3 mr-1' />
                  Undo
                </button>
                <span className={`text-xs ml-1 ${getCountdownStyles()}`}>({countdownSeconds}s)</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

ActionItemCard.displayName = 'ActionItemCard';

export default ActionItemCard;
