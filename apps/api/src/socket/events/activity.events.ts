import { getSocket } from '../../lib/socket.js';

export const emitActivityCreated = (userId: string, payload: unknown) => {
  const io = getSocket();
  io.to(`user:${userId}`).emit('activity:created', payload);
};
