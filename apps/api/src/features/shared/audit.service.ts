import { emitActivityCreated } from '../../socket/events/activity.events.js';
import { emitNotificationCreated } from '../../socket/events/notifications.events.js';
import { db } from './base.repository.js';

type ActivityEntityType =
  | 'task'
  | 'event'
  | 'note'
  | 'notification'
  | 'dashboard_layout'
  | 'widget_preference'
  | 'auth';

type NotificationType = 'task_updated' | 'event_created' | 'system_message' | 'layout_saved';

type JsonValue =
  | string
  | number
  | boolean
  | { [key: string]: JsonValue }
  | JsonValue[];

type LogActivityInput = {
  actorId: string;
  action: string;
  entityType: ActivityEntityType;
  taskId?: string;
  eventId?: string;
  noteId?: string;
  notificationId?: string;
  metadata?: JsonValue;
};

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: JsonValue;
};

export const auditService = {
  logActivity: async (input: LogActivityInput) => {
    const data: {
      actorId: string;
      action: string;
      entityType: ActivityEntityType;
      taskId?: string | null;
      eventId?: string | null;
      noteId?: string | null;
      notificationId?: string | null;
      metadata?: JsonValue;
    } = {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
    };
    if (input.taskId !== undefined) data.taskId = input.taskId;
    if (input.eventId !== undefined) data.eventId = input.eventId;
    if (input.noteId !== undefined) data.noteId = input.noteId;
    if (input.notificationId !== undefined) data.notificationId = input.notificationId;
    if (input.metadata !== undefined) {
      data.metadata = JSON.parse(JSON.stringify(input.metadata)) as JsonValue;
    }

    const activity = await db.activityLog.create({
      data,
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    emitActivityCreated(input.actorId, activity);
    return activity;
  },
  createNotification: async (input: CreateNotificationInput) => {
    const data: {
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
      metadata?: JsonValue;
    } = {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
    };
    if (input.metadata !== undefined) {
      data.metadata = JSON.parse(JSON.stringify(input.metadata)) as JsonValue;
    }

    const notification = await db.notification.create({
      data,
    });

    emitNotificationCreated(input.userId, notification);
    return notification;
  },
};
