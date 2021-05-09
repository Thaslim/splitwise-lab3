import gql from 'graphql-tag';

export const typeDefs = gql`
  type Auth {
    token: String!
  }
  type User {
    userName: String
    userEmail: String
    id: ID
    userPicture: String
    userPhone: String
    userCurrency: String
    userTimezone: String
    userLanguage: String
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
    getUser: User
  }
`;
