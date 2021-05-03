export const validateRegisterInput = (userName, userEmail, userPassword) => {
  const errors = [];
  if (userName.trim() === '') {
    errors.push({ msg: 'Username must not be empty' });
  }
  if (userEmail.trim() === '') {
    errors.push({ msg: 'Email must not be empty' });
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!userEmail.match(regEx)) {
      errors.push({ msg: 'Email must be a valid Email address' });
    }
  }
  if (userPassword === '') {
    errors.push({ msg: 'Password must not empty' });
  } else if (userPassword.length < 6) {
    errors.push({ msg: 'Password must be minimum 6 characters long' });
  }
  return {
    errors,
    valid: errors.length < 1,
  };
};

export const validateLoginInput = (userEmail, userPassword) => {
  const errors = [];
  if (userEmail.trim() === '') {
    errors.push({ msg: 'Email must not be empty' });
  }
  if (userPassword === '') {
    errors.push({ msg: 'Password must not empty' });
  }
  return {
    errors,
    valid: errors.length < 1,
  };
};
