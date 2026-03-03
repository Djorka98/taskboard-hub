export type UserRole = 'admin' | 'member';

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType =
  | 'task_updated'
  | 'event_created'
  | 'system_message'
  | 'layout_saved';

export type WidgetType =
  | 'kpi_summary'
  | 'tasks_overview'
  | 'upcoming_events'
  | 'activity_feed'
  | 'notes'
  | 'notifications_summary'
  | 'performance_chart';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}
