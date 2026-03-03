import { Request } from 'express';

import { ApiError } from '../../core/api-error.js';
import { notificationsRepository } from './notifications.repository.js';

export type AuthenticatedRequest = Request;

export const notificationsService = {
  getAll: async (userId: string) => {
    return notificationsRepository.findManyByUser(userId);
  },
  markAsRead: async (userId: string, id: string) => {
    const notification = await notificationsRepository.findByIdForUser(id, userId);
    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    return notificationsRepository.markAsRead(id);
  },
  markAllAsRead: async (userId: string) => {
    const result = await notificationsRepository.markAllAsRead(userId);
    return { updatedCount: result.count };
  },
};
