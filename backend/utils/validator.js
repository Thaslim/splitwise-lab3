import phone from 'phone';

export const validateRegisterInput = (userName, userEmail, userPassword) => {
  const errors = [];
  if (userName.trim() === '') {
    errors.push({ message: 'Username must not be empty' });
  }
  if (userEmail.trim() === '') {
    errors.push({ message: 'Email must not be empty' });
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!userEmail.match(regEx)) {
      errors.push({ message: 'Email must be a valid Email address' });
    }
  }
  if (userPassword === '') {
    errors.push({ message: 'Password must not empty' });
  } else if (userPassword.length < 6) {
    errors.push({ message: 'Password must be minimum 6 characters long' });
  }
  return {
    errors,
    valid: errors.length < 1,
  };
};

export const validateLoginInput = (userEmail, userPassword) => {
  const errors = [];
  if (userEmail.trim() === '') {
    errors.push({ message: 'Email must not be empty' });
  }
  if (userPassword === '') {
    errors.push({ message: 'Password must not empty' });
  }
  return {
    errors,
    valid: errors.length < 1,
  };
};

export const validateProfileInput = (userName, userEmail, userPhone) => {
  console.log(userName, userEmail);
  const errors = [];
  let validPhone;
  let userValidPhone;
  if (userEmail.trim() === '') {
    errors.push({ message: 'Email must not be empty' });
  }
  if (userName.trim() === '') {
    errors.push({ message: 'Username must not be empty' });
  }
  if (userPhone) {
    validPhone = phone(userPhone);
    [userValidPhone] = validPhone;
    if (!validPhone.length) {
      errors.push({ message: `${userPhone} not a valid phone number` });
    }
  }
  if (!validPhone) {
    userValidPhone = '';
  }
  return {
    errors,
    valid: errors.length < 1,
    userValidPhone,
  };
};

export const validateGroupInput = (groupName) => {
  const errors = [];
  if (groupName.trim() === '') {
    errors.push({ message: 'GroupName must not be empty' });
  }
  return {
    errors,
    valid: errors.length < 1,
  };
};
