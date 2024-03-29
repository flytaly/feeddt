// ! __reflect-metadata__ and __dotenv__ imports have to stay at the top
import 'reflect-metadata';
import './dotenv.js';

import cors from 'cors';
import express from 'express';
import http from 'http';
import { initApolloServer } from './apollo.js';
import { initLogFiles, logger } from './logger.js';
import { redis } from './redis.js';
import { initSession } from './session.js';
import { importNormalizer } from './utils/normalizer.js';
import { initWSServer } from './ws-server.js';

const entry = async () => {
  /* await migrateDB(); */
  const app = express();
  app.set('trust proxy', 1);
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

  await importNormalizer();
  initLogFiles({ prefix: 'api_', name: 'api' });

  const sessionMiddleware = initSession(app, redis);
  const { apolloServer, pubsub, schema } = await initApolloServer(app, redis);

  const server = http.createServer(app);

  server.listen(process.env.PORT, () => {
    logger.info(`server started on localhost:${process.env.PORT}`);
  });

  const wsCleanup = initWSServer({ schema, sessionMiddleware, server });

  const exit = async () => {
    await pubsub.close();
    await wsCleanup.dispose();
    await apolloServer.stop();
    process.exit();
  };

  // catches ctrl+c event
  process.on('SIGINT', exit);
  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exit);
  process.on('SIGUSR2', exit);
};

entry().catch((err) => console.error(err));
