import { getSocket } from '../../lib/socket.js';

export const emitNotificationCreated = (userId: string, payload: unknown) => {
  const io = getSocket();
  io.to(`user:${userId}`).emit('notifications:new', payload);
};
