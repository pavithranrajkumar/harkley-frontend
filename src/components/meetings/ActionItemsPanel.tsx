import { CheckSquare } from 'lucide-react';
import ActionItemCard from './ActionItemCard';
import type { ActionItem } from '../../types/meeting';

interface ActionItemsPanelProps {
  actionItems: ActionItem[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getSpeakerColor: (speakerNumber: number) => string;
}

const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({ actionItems, getPriorityColor, getStatusColor, getSpeakerColor }) => {
  return (
    <div className='w-96 bg-white border-l border-gray-200 flex flex-col'>
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900 flex items-center'>
            <CheckSquare className='w-5 h-5 mr-2' />
            Action Items
          </h2>
          <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>{actionItems.length}</span>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4'>
        {actionItems.length === 0 ? (
          <div className='text-center py-12'>
            <CheckSquare className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 font-medium'>No action items</p>
            <p className='text-sm text-gray-400 mt-1'>Action items will appear here</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {actionItems.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                getSpeakerColor={getSpeakerColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionItemsPanel;
