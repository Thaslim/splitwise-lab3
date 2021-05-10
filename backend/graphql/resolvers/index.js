import userResolvers from './users.js';
import groupResolvers from './groups.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...groupResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...groupResolvers.Mutation,
  },
};
