import { createServer } from 'node:http';

import { app } from './app.js';
import { env } from './config/env.js';
import { initializeSocket } from './lib/socket.js';

const httpServer = createServer(app);
initializeSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`TaskBoard Hub API listening on http://localhost:${env.PORT}`);
});
