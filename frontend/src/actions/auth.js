import axios from 'axios';
import setToken from '../utils/setToken';
import setAlert from './alert';
import { getAcceptedGroups } from './group';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_GROUPS,
  CLEAR_GROUP_ACTIVITY,
  CLEAR_GROUP_BALANCE,
  CLEAR_RECENT_ACTIVITY,
  CLEAR_COMMENTS,
} from './types';

// Load User
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setToken(localStorage.token);
  }
  const body = {
    query: `query {
      getUser {
      userName
      userEmail
      id
      userPicture
      userPhone
      userCurrency
      userTimezone
      userLanguage
    }}`,
  };

  const res = await axios.post('/graphql', body);

  if (res.data.errors) {
    dispatch({
      type: AUTH_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: USER_LOADED,
      payload: res.data.data.getUser,
    });
  }
};

// Register User
export const signup = ({ userName, userEmail, userPassword }) => async (
  dispatch
) => {
  const config = {
    headers: { 'Content-type': 'application/json' },
  };
  const body = {
    query: `mutation register(
    $userName: String!
    $userEmail: String!
    $userPassword: String!
  ) {
    register(
      registerInput: {
        userName: $userName
        userEmail: $userEmail
        userPassword: $userPassword
      }
    ) {
      token
    }
  }`,
    variables: { userName, userEmail, userPassword },
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
      type: REGISTER_FAIL,
    });
  } else if (res.data.data) {
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data.data.register,
    });
    dispatch(loadUser());
    // dispatch(getAcceptedGroups());
  }
};

// Login User
export const login = ({ userEmail, userPassword }) => async (dispatch) => {
  const config = {
    headers: { 'content-type': 'application/json' },
  };
  const body = {
    query: `mutation login(
    $userEmail: String!
    $userPassword: String!
  ) {
    login(
        userEmail: $userEmail
        userPassword: $userPassword
    ) {
      token
    }
  }`,
    variables: { userEmail, userPassword },
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
      type: LOGIN_FAIL,
    });
  } else if (res.data.data) {
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data.data.login,
    });
    dispatch(loadUser());
    // dispatch(getAcceptedGroups());
  }
};

// Logout
export const logout = () => (dispatch) => {
  dispatch({ type: CLEAR_GROUP_ACTIVITY });
  dispatch({ type: CLEAR_COMMENTS });
  dispatch({ type: CLEAR_RECENT_ACTIVITY });
  dispatch({ type: CLEAR_GROUP_BALANCE });
  dispatch({ type: CLEAR_GROUPS });
  dispatch({ type: LOGOUT });
};
