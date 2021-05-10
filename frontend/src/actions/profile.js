import axios from 'axios';
import setAlert from './alert';
import { loadUser } from './auth';
import { UPDATE_PROFILE, UPDATE_PROFILE_ERROR } from './types';

// Update Profile
export const updateUserProfile = ({
  userName,
  userEmail,
  userPhone,
  userCurrency,
  userTimezone,
  userLanguage,
  history,
}) => async (dispatch) => {
  const config = {
    headers: { 'content-type': 'application/json' },
  };
  const body = {
    query: `mutation updateProfile(
      $userName: String
      $userEmail: String
      $userPhone: String
      $userCurrency: String
      $userTimezone: String
      $userLanguage: String
    ) {
      updateProfile(
        profileInput:{
        userName:$userName
        userEmail:$userEmail
        userPhone: $userPhone
        userCurrency:$userCurrency
        userLanguage: $userLanguage
        userTimezone:$userTimezone
      }
      ) {
        updateStatus
      }
    }`,
    variables: {
      userName,
      userEmail,
      userPhone,
      userCurrency,
      userTimezone,
      userLanguage,
    },
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
      type: UPDATE_PROFILE_ERROR,
    });
  } else if (res.data.data) {
    dispatch({
      type: UPDATE_PROFILE,
      payload: res.data.data.updateStatus,
    });
    dispatch(setAlert('Profile updated', 'success'));
    dispatch(loadUser());
    history.push('/dashboard');
  }
};
