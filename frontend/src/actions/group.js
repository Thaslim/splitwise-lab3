import axios from 'axios';
import setAlert from './alert';
import {
  CREATE_GROUP,
  CREATE_GROUP_ERROR,
  GET_ALL_USERS,
  GET_ALL_USERS_ERROR,
  GET_GROUP_ACTIVITY,
  GET_GROUP_ACTIVITY_ERROR,
  ACCEPT_INVITATION,
  ACCEPT_INVITATION_ERROR,
  LEAVE_GROUP,
  LEAVE_GROUP_ERROR,
  GET_GROUPS,
  GET_GROUPS_ERROR,
  ADD_EXPENSE,
  ADD_EXPENSE_ERROR,
  GET_GROUP_BALANCE,
  GET_GROUP_BALANCE_ERROR,
} from './types';

export const getAllUsers = () => async (dispatch) => {
  const body = {
    query: `query {
      getAllUsers {
      userName
      userEmail
    }}`,
  };

  const res = await axios.post('/graphql', body);

  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
    });
    dispatch({
      type: GET_ALL_USERS_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: GET_ALL_USERS,
      payload: res.data.data.getAllUsers,
    });
  }
};

// Get users active groups list
export const getAcceptedGroups = () => async (dispatch) => {
  const body = {
    query: `query {
      myGroups {
      groups{
        groupName,
        id
      }
      invites{
        groupName,
        id
      }
      iOwe{
        id,
        amount,
        memberID{
          id
          userName,
          userEmail
        }
        groupID{
          id
          groupName
        }
      }
      owedToMe{
        id,
        amount,
        memberID{
          id
          userName,
          userEmail
        }
        groupID{
          id
          groupName
        }
      }
    }}`,
  };
  const res = await axios.post('/graphql', body);

  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
    });
    dispatch({
      type: GET_GROUPS_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: GET_GROUPS,
      payload: res.data.data.myGroups,
    });
  }
};

// Add expense
export const addExpense = ({ groupID, description, amount, date }) => async (
  dispatch
) => {
  const config = {
    headers: { 'Content-type': 'application/json' },
  };
  const body = {
    query: `mutation addExpense(
          $groupID: ID!
          $description: String!
          $amount: String!
          $date: Date!
        ) {
          addExpense(
            groupID:$groupID
            description:$description
            amount:$amount
            date:$date
          
          ) {
            updateStatus
          }
        }`,
    variables: { groupID, description, amount, date },
  };
  const res = await axios.post('/graphql', body, config);
  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
    });
    dispatch({
      type: ADD_EXPENSE_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: ADD_EXPENSE,
      payload: res.data.data.addExpense,
    });
    dispatch(setAlert('Expense Added', 'success'));
    dispatch(getAcceptedGroups());
  }
};

// Create New Group
// eslint-disable-next-line import/prefer-default-export
export const createNewGroup = ({ groupName, groupMembers, history }) => async (
  dispatch
) => {
  const config = {
    headers: { 'Content-type': 'application/json' },
  };
  const body = {
    query: `mutation createGroup(
      $groupName: String!,
      $groupMembers: [Member]
    ) {
      createGroup(
        groupName:$groupName,
        groupMembers:$groupMembers
      
      ) {
        updateStatus
      }
    }`,
    variables: { groupName, groupMembers },
  };

  const res = await axios.post('/graphql', body, config);

  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
      if (error.extensions.errors) {
        error.extensions.errors.forEach((error) =>
          dispatch(setAlert(error.message, 'danger'))
        );
      }
    });

    dispatch({
      type: CREATE_GROUP_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: CREATE_GROUP,
      payload: res.data,
    });
    dispatch(setAlert('Group created', 'success'));
    // dispatch(getAcceptedGroups());
    history.push('/dashboard');
  }
};

export const getGroupActivity = ({ groupID }) => async (dispatch) => {
  const body = {
    query: `query {
      getExpense(groupID:${JSON.stringify(groupID)}) {
      _id
      expenses{
        _id
        paidByName
        paidByEmail
        description
        amount
        date
      }
    }}`,
  };

  const res = await axios.post('/graphql', body);

  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
    });
    dispatch({
      type: GET_GROUP_ACTIVITY_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: GET_GROUP_ACTIVITY,
      payload: res.data.data.getExpense,
    });
  }
};

export const getGroupBalances = ({ groupID }) => async (dispatch) => {
  console.log(typeof groupID);
  const body = {
    query: `query {
      getGroupBalance(groupID:${JSON.stringify(groupID)}) {
      members{
        getBack
        give
        groupID
        memberID{
          id
          userName
          userEmail
        }
      }

    }}`,
  };

  const res = await axios.post('/graphql', body);

  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
    });
    dispatch({
      type: GET_GROUP_BALANCE_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: GET_GROUP_BALANCE,
      payload: res.data.data.getGroupBalance,
    });
  }
};

// Accept group Invitation
export const acceptGroupInvitation = (groupID) => async (dispatch) => {
  const config = {
    headers: { 'content-type': 'application/json' },
  };

  const body = {
    query: `mutation acceptInvitation(
        $groupID: ID!
      ) {
        acceptInvitation(
          groupID:$groupID
        
        ) {
          updateStatus
        }
      }`,
    variables: { groupID },
  };
  const res = await axios.post('/graphql', body, config);

  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
      if (error.extensions.errors) {
        error.extensions.errors.forEach((error) =>
          dispatch(setAlert(error.message, 'danger'))
        );
      }
    });
    dispatch({
      type: ACCEPT_INVITATION_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: ACCEPT_INVITATION,
      payload: res.data.data.acceptInvitation,
    });
    dispatch(setAlert('Invitation Accepted', 'success'));
    dispatch(getAcceptedGroups());
  }
};

export const leaveGroup = (groupID) => async (dispatch) => {
  const config = {
    headers: { 'content-type': 'application/json' },
  };

  const body = {
    query: `mutation leaveGroup(
        $groupID: ID!
      ) {
        leaveGroup(
          groupID:$groupID
        
        ) {
          updateStatus
        }
      }`,
    variables: { groupID },
  };
  const res = await axios.post('/graphql', body, config);

  if (res.data.errors) {
    res.data.errors.forEach((error) => {
      dispatch(setAlert(error.message, 'danger'));
      if (error.extensions.errors) {
        error.extensions.errors.forEach((error) =>
          dispatch(setAlert(error.message, 'danger'))
        );
      }
    });
    dispatch({
      type: LEAVE_GROUP_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: LEAVE_GROUP,
      payload: res.data.data.acceptInvitation,
    });

    dispatch(getAcceptedGroups());
  }
};
