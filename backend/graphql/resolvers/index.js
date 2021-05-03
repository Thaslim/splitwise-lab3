import userResolvers from './users.js';

export const resolvers = {
  Query: {},
  Mutation: {
    ...userResolvers.Mutation,
  },
};
