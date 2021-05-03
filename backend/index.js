import connectDB from './config/db.js';
import { ApolloServer } from 'apollo-server';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers/index.js';

connectDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 8000 }).then((res) => {
  console.log(`server running at ${res.url}`);
});
