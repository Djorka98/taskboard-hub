import { auditService } from '../shared/audit.service.js';
import { dashboardRepository } from './dashboard.repository.js';

const defaultItems = [
  { widgetId: 'kpi_summary', order: 0, visible: true, width: 6, height: 3 },
  { widgetId: 'tasks_overview', order: 1, visible: true, width: 6, height: 4 },
  { widgetId: 'upcoming_events', order: 2, visible: true, width: 6, height: 3 },
  { widgetId: 'activity_feed', order: 3, visible: true, width: 6, height: 4 },
  { widgetId: 'notes', order: 4, visible: true, width: 6, height: 3 },
  { widgetId: 'notifications_summary', order: 5, visible: true, width: 6, height: 3 },
  { widgetId: 'performance_chart', order: 6, visible: true, width: 12, height: 4 },
] as const;

type LayoutInput = {
  items: Array<{
    widgetId:
      | 'kpi_summary'
      | 'tasks_overview'
      | 'upcoming_events'
      | 'activity_feed'
      | 'notes'
      | 'notifications_summary'
      | 'performance_chart';
    order: number;
    visible: boolean;
    width: number;
    height: number;
  }>;
};

export const dashboardService = {
  getLayout: async (userId: string) => {
    const layout = await dashboardRepository.getLayoutByUser(userId);
    const widgetPreferences = await dashboardRepository.getWidgetPreferences(userId);

    return {
      layout: layout?.layout ?? { items: defaultItems },
      widgetPreferences: widgetPreferences.length ? widgetPreferences : defaultItems,
    };
  },
  saveLayout: async (userId: string, input: LayoutInput) => {
    await dashboardRepository.saveLayout(userId, { items: input.items });
    await dashboardRepository.replaceWidgetPreferences(userId, input.items);

    await auditService.logActivity({
      actorId: userId,
      action: 'widget_layout_changed',
      entityType: 'dashboard_layout',
      metadata: { itemCount: input.items.length },
    });

    await auditService.createNotification({
      userId,
      type: 'layout_saved',
      title: 'Layout saved',
      message: 'Your dashboard layout has been updated',
      metadata: { itemCount: input.items.length },
    });

    return { message: 'Layout saved' };
  },
  resetLayout: async (userId: string) => {
    await dashboardRepository.saveLayout(userId, { items: defaultItems });
    await dashboardRepository.replaceWidgetPreferences(userId, [...defaultItems]);

    await auditService.logActivity({
      actorId: userId,
      action: 'widget_layout_reset',
      entityType: 'dashboard_layout',
    });

    return { message: 'Layout reset', items: defaultItems };
  },
};
