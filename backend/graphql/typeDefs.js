import gql from 'graphql-tag';

export const typeDefs = gql`
  type Auth {
    token: String!
  }
  type Update {
    updateStatus: String!
  }
  type User {
    userName: String!
    userEmail: String!
    id: ID!
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
  input ProfileInput {
    userName: String
    userEmail: String
    userPhone: String
    userCurrency: String
    userTimezone: String
    userLanguage: String
  }

  type Mutation {
    register(registerInput: RegisterInput): Auth!
    login(userEmail: String!, userPassword: String!): Auth!
    updateProfile(profileInput: ProfileInput): Update
  }
  type Query {
    getUser: User
  }
`;
