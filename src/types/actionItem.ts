export interface ActionItem {
  id: string;
  meetingId: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'in_progress' | 'cancelled';
  assignee: string | null;
  dueDate: string | null;
  speakerNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItemsResponse {
  actionItems: ActionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateActionItemData {
  meetingId: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
  speakerNumber: number;
}

export interface UpdateActionItemData {
  description?: string;
  status?: 'pending' | 'completed' | 'in_progress' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
}
