import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar Date
  type Auth {
    token: String!
  }
  type Update {
    updateStatus: String!
  }
  type MemberID {
    id: ID
    userName: String!
    userEmail: String!
  }
  type Group {
    id: ID
    groupName: String!
  }
  type Bal {
    id: ID
    amount: Float
    memberID: MemberID
    groupID: Group
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
  type Expense {
    _id: ID!
    paidByName: String!
    paidByEmail: String!
    description: String!
    amount: Float!
    date: Date!
  }
  type groupExpense {
    _id: ID!
    expenses: [Expense]
  }

  type groupMemBalance {
    getBack: Float
    give: Float
    groupID: ID!
    memberID: MemberID
  }

  type groupBalance {
    members: [groupMemBalance]
  }
  type Mutation {
    register(registerInput: RegisterInput): Auth!
    login(userEmail: String!, userPassword: String!): Auth!
    updateProfile(profileInput: ProfileInput): Update!
    createGroup(groupName: String, groupMembers: [Member]): Update!
    acceptInvitation(groupID: ID!): Update!
    leaveGroup(groupID: ID!): Update!
    addExpense(
      groupID: ID!
      description: String!
      amount: String!
      date: Date
    ): Update!
  }
  type Query {
    getUser: User
    getAllUsers: [User]
    myGroups: GroupsList
    getExpense(groupID: String!): groupExpense
    getGroupBalance(groupID: String!): groupBalance
  }
`;
