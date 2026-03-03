import { db } from '../shared/base.repository.js';

export const dashboardRepository = {
  getLayoutByUser: (userId: string) => {
    return db.dashboardLayout.findUnique({ where: { userId } });
  },
  saveLayout: (userId: string, layout: Record<string, unknown>) => {
    const normalizedLayout = JSON.parse(JSON.stringify(layout));
    return db.dashboardLayout.upsert({
      where: { userId },
      update: { layout: normalizedLayout },
      create: { userId, layout: normalizedLayout },
    });
  },
  getWidgetPreferences: (userId: string) => {
    return db.widgetPreference.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  },
  replaceWidgetPreferences: async (
    userId: string,
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
    }>,
  ) => {
    await db.widgetPreference.deleteMany({ where: { userId } });
    if (!items.length) {
      return;
    }

    await db.widgetPreference.createMany({
      data: items.map((item) => ({
        userId,
        widgetId: item.widgetId,
        order: item.order,
        visible: item.visible,
        width: item.width,
        height: item.height,
      })),
    });
  },
};
