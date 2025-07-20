import { apiRequest } from './api';
import type { ActionItemsResponse, CreateActionItemData, UpdateActionItemData, ActionItem } from '../types/actionItem';

export interface GetActionItemsParams {
  meetingId?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  page?: number;
  limit?: number;
}

const BASE_PATH = '/action-items';
class ActionItemService {
  /**
   * Get action items with optional filters
   */
  async getActionItems(params: GetActionItemsParams = {}): Promise<ActionItemsResponse> {
    const response = await apiRequest<ActionItemsResponse>('GET', BASE_PATH, { params });

    if (!response.data) {
      throw new Error('No action items data received from API');
    }
    return response.data;
  }

  /**
   * Create a new action item
   */
  async createActionItem(data: CreateActionItemData): Promise<ActionItem> {
    const response = await apiRequest<ActionItem>('POST', BASE_PATH, data);
    if (!response.data) {
      throw new Error('No action item data received from API');
    }
    return response.data;
  }

  /**
   * Update an action item
   */
  async updateActionItem(actionItemId: string, data: UpdateActionItemData): Promise<ActionItem> {
    const response = await apiRequest<ActionItem>('PUT', `${BASE_PATH}/${actionItemId}`, data);
    if (!response.data) {
      throw new Error('No action item data received from API');
    }
    return response.data;
  }

  /**
   * Delete an action item
   */
  async deleteActionItem(actionItemId: string): Promise<void> {
    await apiRequest<void>('DELETE', `${BASE_PATH}/${actionItemId}`);
  }

  /**
   * Bulk update action items
   */
  async bulkUpdateActionItems(actionItemIds: string[], data: UpdateActionItemData): Promise<ActionItem[]> {
    const response = await apiRequest<ActionItem[]>('PUT', `${BASE_PATH}/bulk`, {
      actionItemIds,
      ...data,
    });
    if (!response.data) {
      return [];
    }
    return response.data;
  }
}

export const actionItemService = new ActionItemService();
export default actionItemService;
