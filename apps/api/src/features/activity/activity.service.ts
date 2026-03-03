import { activityRepository } from './activity.repository.js';

export const activityService = {
  getAll: async (userId: string) => {
    return activityRepository.findManyByActor(userId);
  },
};
