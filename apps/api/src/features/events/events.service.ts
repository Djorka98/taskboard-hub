import { ApiError } from '../../core/api-error.js';
import { auditService } from '../shared/audit.service.js';
import { eventsRepository } from './events.repository.js';

type CreateEventInput = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  category: string;
  reminderMinutes?: number;
};

type UpdateEventInput = Partial<CreateEventInput>;

export const eventsService = {
  getAll: async (userId: string) => {
    return eventsRepository.findManyByUser(userId);
  },
  create: async (userId: string, input: CreateEventInput) => {
    const created = await eventsRepository.create({
      userId,
      title: input.title,
      description: input.description,
      category: input.category,
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      reminderMinutes: input.reminderMinutes,
    });

    await auditService.logActivity({
      actorId: userId,
      action: 'event_created',
      entityType: 'event',
      eventId: created.id,
      metadata: { title: created.title },
    });
    await auditService.createNotification({
      userId,
      type: 'event_created',
      title: 'Event created',
      message: `Event \"${created.title}\" created`,
      metadata: { eventId: created.id },
    });

    return created;
  },
  getById: async (userId: string, id: string) => {
    const item = await eventsRepository.findByIdForUser(id, userId);
    if (!item) {
      throw new ApiError(404, 'Event not found');
    }

    return item;
  },
  update: async (userId: string, id: string, input: UpdateEventInput) => {
    const existing = await eventsRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new ApiError(404, 'Event not found');
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.category !== undefined) data.category = input.category;
    if (input.startsAt !== undefined) data.startsAt = new Date(input.startsAt);
    if (input.endsAt !== undefined) data.endsAt = input.endsAt ? new Date(input.endsAt) : null;
    if (input.reminderMinutes !== undefined) data.reminderMinutes = input.reminderMinutes;

    const updated = await eventsRepository.update(id, data);

    await auditService.logActivity({
      actorId: userId,
      action: 'event_updated',
      entityType: 'event',
      eventId: id,
      metadata: { title: updated.title },
    });

    return updated;
  },
  remove: async (userId: string, id: string) => {
    const existing = await eventsRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new ApiError(404, 'Event not found');
    }

    await eventsRepository.remove(id);
    await auditService.logActivity({
      actorId: userId,
      action: 'event_deleted',
      entityType: 'event',
      metadata: { eventId: id, title: existing.title },
    });

    return { message: 'Event deleted' };
  },
};
