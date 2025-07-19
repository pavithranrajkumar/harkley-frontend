export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  participants: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
}

export interface ActionItem {
  id: string;
  title: string;
  meetingTitle: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  completed: boolean;
}
