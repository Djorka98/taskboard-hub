const columnTagPrefix = 'column:';
const boardTagPrefix = 'board:';
const columnFromStatus = {
    todo: 'To Do',
    in_progress: 'In Progress',
    blocked: 'Review',
    completed: 'Done',
};
const statusFromColumn = {
    Backlog: 'todo',
    'To Do': 'todo',
    'In Progress': 'in_progress',
    Review: 'blocked',
    Done: 'completed',
};
const findColumnTag = (tags) => tags.find((tag) => tag.startsWith(columnTagPrefix));
const findBoardTag = (tags) => tags.find((tag) => tag.startsWith(boardTagPrefix));
export const columnToTag = (column) => `${columnTagPrefix}${column.toLowerCase().replace(/\s+/g, '-')}`;
export const boardToTag = (boardId) => `${boardTagPrefix}${boardId}`;
export const parseColumnTag = (tags) => {
    const columnTag = findColumnTag(tags);
    if (!columnTag)
        return null;
    const value = columnTag.replace(columnTagPrefix, '');
    if (value === 'backlog')
        return 'Backlog';
    if (value === 'to-do')
        return 'To Do';
    if (value === 'in-progress')
        return 'In Progress';
    if (value === 'review')
        return 'Review';
    if (value === 'done')
        return 'Done';
    return null;
};
export const parseBoardTag = (tags) => {
    const boardTag = findBoardTag(tags);
    if (!boardTag)
        return null;
    return boardTag.replace(boardTagPrefix, '') || null;
};
const normalizePriority = (priority) => {
    return priority;
};
const initialsFromName = (fullName) => {
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
    }
    const compact = (parts[0] ?? '').replace(/\s+/g, '');
    if (compact.length >= 2) {
        return compact.slice(0, 2).toUpperCase();
    }
    return 'NA';
};
export const toTaskCard = (task, user) => {
    const parsedColumn = parseColumnTag(task.tags) ?? columnFromStatus[task.status];
    const column = parsedColumn === 'Backlog' ? 'To Do' : parsedColumn;
    const boardId = parseBoardTag(task.tags) ?? '';
    const resolvedAssigneeName = task.assigneeId || task.creatorId === user.id ? user.fullName : '';
    const startDate = task.startDate ? new Date(task.startDate).toISOString() : new Date(task.createdAt).toISOString();
    const dueDate = task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString();
    return {
        id: task.id,
        boardId,
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        column,
        priority: normalizePriority(task.priority),
        labels: task.tags.filter((tag) => !tag.startsWith(columnTagPrefix) && !tag.startsWith(boardTagPrefix)),
        startDate,
        dueDate,
        assignee: {
            id: task.assigneeId ?? (task.creatorId === user.id ? user.id : 'unassigned'),
            name: resolvedAssigneeName,
            initials: resolvedAssigneeName ? initialsFromName(resolvedAssigneeName) : 'NA',
        },
        checklist: {
            completed: task.status === 'completed' ? 4 : task.status === 'in_progress' ? 2 : 1,
            total: 4,
        },
        comments: 0,
        attachments: 0,
        activity: ['task_sync'],
        raw: task,
    };
};
export const toTaskUpdatePayload = (task, column) => {
    const persistedTags = [
        ...task.labels,
        boardToTag(task.boardId),
        columnToTag(column),
    ];
    const payload = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: statusFromColumn[column],
        tags: persistedTags,
    };
    if (task.dueDate) {
        payload.dueDate = new Date(task.dueDate).toISOString();
    }
    if (task.startDate) {
        payload.startDate = new Date(task.startDate).toISOString();
    }
    if (task.raw.assigneeId) {
        payload.assigneeId = task.raw.assigneeId;
    }
    return payload;
};
export const boardColumns = ['To Do', 'In Progress', 'Review', 'Done'];
const boardColumnLabelKeys = {
    Backlog: 'board.column.backlog',
    'To Do': 'board.column.todo',
    'In Progress': 'board.column.inProgress',
    Review: 'board.column.review',
    Done: 'board.column.done',
};
export const getBoardColumnLabel = (column, t) => t(boardColumnLabelKeys[column]);
