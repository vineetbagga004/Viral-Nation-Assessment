import { ApolloServer } from "@apollo/server";
import "reflect-metadata";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { typeDefs } from "../graphql/typeDefs.js";
import { resolvers } from "../graphql/resolvers.js";
import { getUserIdByToken } from "../utils/utils.js";

dotenv.config();

const prisma = new PrismaClient();

const PORT = parseInt(process.env.PORT) || 5000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  includeStacktraceInErrorResponses: false,
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    let userId = null;
    userId = await getUserIdByToken(req, userId);
    return { prisma, userId };
  },
  listen: {
    port: PORT,
  },
});
console.log(`🚀  Server ready at: ${url}`);
