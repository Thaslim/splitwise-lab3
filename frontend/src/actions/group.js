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
        userName,
        userEmail
      }
      owedToMe{
        id,
        userName,
        userEmail
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
  try {
    const config = {
      headers: { 'Content-type': 'application/json' },
    };
    const body = JSON.stringify({ groupID, description, amount, date });
    const res = await axios.post(
      'http://localhost:8000/api/groups/',
      body,
      config
    );
    dispatch({
      type: ADD_EXPENSE,
      payload: res.data,
    });
    dispatch(setAlert('Expense Added', 'success'));
    dispatch(getAcceptedGroups());
  } catch (error) {
    const { errors } = error.response.data;
    if (errors) {
      errors.forEach((err) => dispatch(setAlert(err.msg, 'danger')));
    }
    dispatch({
      type: ADD_EXPENSE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
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

// Get Group Activity
export const getGroupActivity = (groupID) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/groups/${groupID}`);
    dispatch({
      type: GET_GROUP_ACTIVITY,
      payload: res.data,
    });
  } catch (error) {
    const { errors } = error.response.data;
    if (errors) {
      errors.forEach((err) => dispatch(setAlert(err.msg, 'danger')));
    }
    dispatch({
      type: GET_GROUP_ACTIVITY_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

// Get Group Balances
export const getGroupBalances = (groupID) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/groups/group-balance/${groupID}`);
    dispatch({
      type: GET_GROUP_BALANCE,
      payload: res.data,
    });
  } catch (error) {
    const { errors } = error.response.data;
    if (errors) {
      errors.forEach((err) => dispatch(setAlert(err.msg, 'danger')));
    }
    dispatch({
      type: GET_GROUP_BALANCE_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

// Accept group Invitation
export const acceptGroupInvitation = (groupID, groupName) => async (
  dispatch
) => {
  try {
    const config = {
      headers: { 'content-type': 'application/json' },
    };

    const body = { groupID, groupName };
    const res = await axios.post(
      'api/my-groups/accept-invitation',
      body,
      config
    );
    dispatch({
      type: ACCEPT_INVITATION,
      payload: res.data,
    });
    dispatch(setAlert('Invitation Accepted', 'success'));
    dispatch(getAcceptedGroups());
  } catch (error) {
    const { errors } = error.response.data;
    if (errors) {
      errors.forEach((err) => dispatch(setAlert(err.msg, 'danger')));
    }
    dispatch({
      type: ACCEPT_INVITATION_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};

export const leaveGroup = (groupID, groupName) => async (dispatch) => {
  try {
    const config = {
      headers: { 'content-type': 'application/json' },
    };
    const body = { groupID, groupName };
    const res = await axios.post('api/my-groups/leave-group', body, config);
    dispatch({
      type: LEAVE_GROUP,
      payload: res.data,
    });
    dispatch(getAcceptedGroups());
  } catch (error) {
    const { errors } = error.response.data;
    if (errors) {
      errors.forEach((err) => dispatch(setAlert(err.msg, 'danger')));
    }
    dispatch({
      type: LEAVE_GROUP_ERROR,
      payload: {
        msg: error.response.statusText,
        status: error.response.status,
      },
    });
  }
};
