import { Server as HttpServer } from 'node:http';

import { Server } from 'socket.io';

import { env } from '../config/env.js';

let io: Server | null = null;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('notifications:subscribe', (userId: string) => {
      socket.join(`user:${userId}`);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized');
  }

  return io;
};
