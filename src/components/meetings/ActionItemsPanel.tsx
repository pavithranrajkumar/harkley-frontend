import { CheckSquare, Loader2 } from 'lucide-react';
import ActionItemCard from '../shared/ActionItemCard';
import type { ActionItem } from '../../types/actionItem';

interface ActionItemsPanelProps {
  actionItems: ActionItem[];
  onToggle?: (actionItemId: string) => void;
  onUndo?: (actionItemId: string) => void;
  pendingCompletions?: Set<string>;
  countdowns?: Map<string, number>;
  loading?: boolean;
}

const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({
  actionItems,
  onToggle,
  onUndo,
  pendingCompletions = new Set(),
  countdowns = new Map(),
  loading = false,
}) => {
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
        {loading ? (
          <div className='text-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
            <p className='text-gray-500'>Loading action items...</p>
          </div>
        ) : actionItems.length === 0 ? (
          <div className='text-center py-12'>
            <CheckSquare className='w-12 h-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 font-medium'>No action items</p>
            <p className='text-sm text-gray-400 mt-1'>Action items will appear here</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {actionItems.map((item, index) => {
              const isPending = pendingCompletions.has(item.id);
              const isCompleted = item.status === 'completed' || isPending;
              const canUndo = isPending;

              // Calculate countdown for pending items
              let countdownSeconds = 0;
              if (isPending) {
                countdownSeconds = countdowns.get(item.id) || 0;
              }

              return (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  showControls={true}
                  onToggle={onToggle}
                  onUndo={onUndo}
                  isCompleted={isCompleted}
                  canUndo={canUndo}
                  countdownSeconds={countdownSeconds}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionItemsPanel;
