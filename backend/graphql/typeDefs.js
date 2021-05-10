import gql from 'graphql-tag';

export const typeDefs = gql`
  type Auth {
    token: String!
  }
  type Update {
    updateStatus: String!
  }
  type Bal {
    id: ID
    userName: String
    userEmail: String
    groupName: String
  }
  type GroupName {
    groupName: String
    id: ID
  }
  type GroupsList {
    groups: [GroupName]
    invites: [GroupName]
    iOwe: [Bal]
    owedToMe: [Bal]
  }
  type User {
    userName: String!
    userEmail: String!
    userPicture: String
    userPhone: String
    userCurrency: String
    userTimezone: String
    userLanguage: String
  }
  input Member {
    memberName: String!
    memberEmail: String!
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
    createGroup(groupName: String, groupMembers: [Member]): Update
  }
  type Query {
    getUser: User
    getAllUsers: [User]
    myGroups: GroupsList
  }
`;
