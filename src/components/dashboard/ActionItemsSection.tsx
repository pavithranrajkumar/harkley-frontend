import { Loader2, CheckSquare } from 'lucide-react';
import ActionItemCard from '../shared/ActionItemCard';
import type { ActionItem } from '../../types/actionItem';

interface ActionItemsSectionProps {
  actionItems: ActionItem[];
  loading: boolean;
  pendingCompletions: Set<string>;
  countdowns: Map<string, number>;
  onToggle: (itemId: string) => void;
  onUndo: (itemId: string) => void;
  isCompleted: (itemId: string, status: string) => boolean;
}

const LoadingState = () => (
  <div className='flex items-center justify-center py-8'>
    <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
    <span className='ml-2 text-gray-600'>Loading action items...</span>
  </div>
);

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center py-12 text-center'>
    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
      <CheckSquare className='w-8 h-8 text-green-600' />
    </div>
    <h3 className='text-lg font-semibold text-gray-900 mb-2'>No action items yet</h3>
    <p className='text-gray-500 mb-4 max-w-sm'>
      Action items will appear here once you record meetings. They'll be automatically extracted and organized for you.
    </p>
  </div>
);

const ActionItemsList = ({
  actionItems,
  pendingCompletions,
  countdowns,
  onToggle,
  onUndo,
  isCompleted,
}: {
  actionItems: ActionItem[];
  pendingCompletions: Set<string>;
  countdowns: Map<string, number>;
  onToggle: (itemId: string) => void;
  onUndo: (itemId: string) => void;
  isCompleted: (itemId: string, status: string) => boolean;
}) => (
  <>
    {actionItems.map((item, index) => (
      <div key={item.id} className={index !== actionItems.length - 1 ? 'mb-3' : ''}>
        <ActionItemCard
          item={item}
          index={index}
          showControls={true}
          onToggle={onToggle}
          onUndo={onUndo}
          isCompleted={isCompleted(item.id, item.status)}
          canUndo={pendingCompletions.has(item.id)}
          countdownSeconds={countdowns.get(item.id) || 0}
        />
      </div>
    ))}
  </>
);

const ActionItemsSection: React.FC<ActionItemsSectionProps> = ({
  actionItems,
  loading,
  pendingCompletions,
  countdowns,
  onToggle,
  onUndo,
  isCompleted,
}) => {
  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (actionItems.length === 0) return <EmptyState />;
    return (
      <ActionItemsList
        actionItems={actionItems}
        pendingCompletions={pendingCompletions}
        countdowns={countdowns}
        onToggle={onToggle}
        onUndo={onUndo}
        isCompleted={isCompleted}
      />
    );
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-gray-900'>Pending Action Items</h2>
      </div>
      <div className='bg-white rounded-xl shadow-sm p-4'>{renderContent()}</div>
    </div>
  );
};

export default ActionItemsSection;
