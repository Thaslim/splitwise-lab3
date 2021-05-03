import gql from 'graphql-tag';

export const typeDefs = gql`
  type Auth {
    token: String!
  }
  input RegisterInput {
    userName: String!
    userPassword: String!
    userEmail: String!
  }

  type Mutation {
    register(registerInput: RegisterInput): Auth!
    login(userEmail: String!, userPassword: String!): Auth!
  }
  type Query {
    getUser: Auth
  }
`;
