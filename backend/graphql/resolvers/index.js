import userResolvers from './users.js';
import groupResolvers from './groups.js';
import expenseResolver from './expense.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...groupResolvers.Query,
    ...expenseResolver.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...groupResolvers.Mutation,
    ...expenseResolver.Mutation,
  },
};
