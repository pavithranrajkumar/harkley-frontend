import type { Meeting, ActionItem } from '../types/meeting';

export const MOCK_RECENT_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: 'Product Strategy Meeting',
    description: 'Q1 2024 product roadmap discussion and feature prioritization',
    date: 'Today, 10:30 AM',
    duration: '45 minutes',
    participants: 6,
    totalTasks: 8,
    completedTasks: 3,
    remainingTasks: 5,
  },
  {
    id: '2',
    title: 'Weekly Team Standup',
    description: 'Daily progress updates and blocker resolution',
    date: 'Yesterday, 9:00 AM',
    duration: '30 minutes',
    participants: 12,
    totalTasks: 5,
    completedTasks: 2,
    remainingTasks: 3,
  },
  {
    id: '3',
    title: 'Client Onboarding - Acme Inc.',
    description: 'Initial client meeting and requirements gathering',
    date: 'Jul 12, 2023',
    duration: '60 minutes',
    participants: 4,
    totalTasks: 3,
    completedTasks: 1,
    remainingTasks: 2,
  },
];

export const MOCK_ACTION_ITEMS: ActionItem[] = [
  {
    id: '1',
    title: 'Update product roadmap slides',
    meetingTitle: 'Product Strategy Meeting',
    dueDate: 'Today',
    priority: 'high',
    completed: false,
  },
  {
    id: '2',
    title: 'Schedule follow-up with marketing team',
    meetingTitle: 'Weekly Team Standup',
    dueDate: 'Yesterday',
    priority: 'urgent',
    completed: false,
  },
  {
    id: '3',
    title: 'Send onboarding documents to Acme',
    meetingTitle: 'Client Onboarding - Acme Inc.',
    dueDate: 'Tomorrow',
    priority: 'medium',
    completed: false,
  },
  {
    id: '4',
    title: 'Review competitor analysis report',
    meetingTitle: 'Product Strategy Meeting',
    dueDate: 'No due date',
    priority: 'low',
    completed: false,
  },
];

export const getPriorityColor = (priority: ActionItem['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
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
