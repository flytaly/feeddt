import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';
import { buildSchema } from 'type-graphql';
import { createRedis, redisOptions } from './redis.js';
import { FeedResolver } from './resolvers/feed.js';
import { MailResolver } from './resolvers/mail.js';
import { UserResolver } from './resolvers/user.js';
import { UserFeedResolver } from './resolvers/userFeed.js';
import { MyContext, ReqWithSession } from './types/index.js';
import { createItemCountLoader } from './utils/createItemCountLoader.js';

export const initApolloServer = async (app: Express, redis: Redis) => {
  const pubsub = new RedisPubSub({
    publisher: createRedis(),
    subscriber: createRedis(),
    connection: redisOptions,
  });

  const schema = await buildSchema({
    resolvers: [UserResolver, UserFeedResolver, FeedResolver, MailResolver],
    validate: false,
    pubSub: pubsub,
  });

  const apolloServer = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    context: ({ req, res }): MyContext => {
      return {
        req: req as ReqWithSession,
        res,
        redis,
        itemCountLoader: createItemCountLoader(),
        pubsub,
      };
    },
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: { origin: process.env.FRONTEND_URL, credentials: true },
  });

  return { apolloServer, pubsub, schema };
};
