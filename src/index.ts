import { ApolloServer } from "@apollo/server";

import { startStandaloneServer } from "@apollo/server/standalone";

import { makeExecutableSchema } from "@graphql-tools/schema";
import {typeDefs} from '../data/typeDefs';
import {resolvers} from '../data/resolvers';

const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
});

const server = new ApolloServer({
  schema,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {


    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

startServer();
