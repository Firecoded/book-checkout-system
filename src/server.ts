import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext, Context } from './context';

export async function startServer() {
  const server = new ApolloServer<Context>({ typeDefs, resolvers });

  const { url } = await startStandaloneServer(server, {
    context: async () => createContext(),
    listen: { port: 4000 },
  });

  console.log(`🚀 Server ready at: ${url}`);
  return server;
}
