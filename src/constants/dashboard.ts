import type { ActionItem } from '../types/actionItem';

export const getPriorityColor = (priority: ActionItem['priority']) => {
  switch (priority) {
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'low':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getCompletionIconColor = (completedTasks: number, totalTasks: number) => {
  const completionPercentage = (completedTasks / totalTasks) * 100;

  if (completionPercentage < 40) {
    return 'text-red-500';
  } else if (completionPercentage < 80) {
    return 'text-cyan-500';
  } else if (completionPercentage < 100) {
    return 'text-blue-500';
  }
  return 'text-green-500';
};
