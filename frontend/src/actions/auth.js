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
  try {
    const res = await axios.post('/graphql', body);
    console.log(res.data);
    dispatch({
      type: USER_LOADED,
      payload: res.data.getUser,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
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
      if (error.extensions) {
        error.extensions.errors.forEach((error) =>
          dispatch(setAlert(error.message, 'danger'))
        );
      }
    });

    dispatch({
      type: REGISTER_FAIL,
    });
  } else if (res.data) {
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
  const body = JSON.stringify({ userEmail, userPassword });
  try {
    const res = await axios.post('api/login', body, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser());
    dispatch(getAcceptedGroups());
  } catch (err) {
    const { errors } = err.response.data;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
    }

    dispatch({
      type: LOGIN_FAIL,
    });
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
