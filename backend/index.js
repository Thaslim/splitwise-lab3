import connectDB from './config/db.js';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers/index.js';
import express from 'express';
import dotenv from 'dotenv';

import cors from 'cors';

// Define routes

dotenv.config({ path: './config/.env' });

const app = express();

// // Init middleware
app.use(express.json({ extended: false }));
app.use(cors({}));

connectDB();
app.get('/', (req, res) => {
  res.send('API running');
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req }),
});

server.applyMiddleware({ app });
const port = process.env.PORT || 8000;

app.listen(port, () => {
  // eslint-dis able-next-line no-console
  console.log(`running on port ${port}`);
});

export default app;
