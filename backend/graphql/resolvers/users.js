import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { auth } from '../../config/auth.js';
import { UserInputError } from 'apollo-server';

import {
  validateRegisterInput,
  validateLoginInput,
  validateProfileInput,
} from '../../utils/validator.js';

dotenv.config({ path: './config/.env' });

export default {
  Mutation: {
    async login(_, { userEmail, userPassword }) {
      const { valid, errors } = validateLoginInput(userEmail, userPassword);
      if (!valid) {
        throw new UserInputError('Errors', {
          errors,
        });
      }

      try {
        const user = await User.findOne({ userEmail }, { userPassword: 1 });
        if (!user) {
          throw new UserInputError(
            'Whoops! We couldn’t find an account for that email address and password'
          );
        }

        // Compare password
        const matchPwd = await bcrypt.compare(userPassword, user.userPassword);

        if (!matchPwd) {
          throw new UserInputError(
            'Whoops! We couldn’t find an account for that email address and password'
          );
        }

        const payload = {
          user: {
            email: userEmail,
            id: user.id,
            name: user.userName,
          },
        };

        // Return jsonwebtoken
        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: 360000,
        });
        return { token: `Bearer ${token}` };
      } catch (error) {
        throw new Error(error);
      }
    },

    async register(
      _,
      { registerInput: { userName, userEmail, userPassword } }
    ) {
      const { valid, errors } = validateRegisterInput(
        userName,
        userEmail,
        userPassword
      );
      if (!valid) {
        throw new UserInputError(`Error Occured`, {
          errors,
        });
      }
      try {
        // See if user exists
        let newUser = await User.findOne({ userEmail });

        if (newUser) {
          throw new UserInputError(
            `${userEmail} already belongs to another account.`
          );
        }

        newUser = new User({ userName, userEmail, userPassword });
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        newUser.userPassword = await bcrypt.hash(userPassword, salt);
        await newUser.save();

        const payload = {
          user: {
            id: newUser.id,
          },
        };

        // Return jsonwebtoken
        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: 360000,
        });
        return { token: `Bearer ${token}` };
      } catch (error) {
        throw new Error(error);
      }
    },

    async updateProfile(
      _,
      {
        profileInput: {
          userName,
          userEmail,
          userPhone,
          userCurrency,
          userTimezone,
          userLanguage,
        },
      },
      context
    ) {
      const user = await auth(context);
      const { valid, errors, userValidPhone } = validateProfileInput(
        userName,
        userEmail,
        userPhone
      );
      if (!valid) {
        throw new UserInputError(`Error Occured`, {
          errors,
        });
      }

      try {
        const profile = await User.findById(user.id);

        const userFields = {};

        if (userName && profile.userName !== userName) {
          userFields.userName = userName;
        }
        if (userEmail && profile.userEmail !== userEmail) {
          const emailExists = await User.findOne({ userEmail: userEmail });

          if (emailExists) {
            throw new UserInputError(
              `${userEmail} already belongs to another account.`
            );
          }

          userFields.userEmail = userEmail;
        }

        if (userCurrency && profile.userCurrency !== userCurrency) {
          userFields.userCurrency = userCurrency;
        }

        if (userTimezone && profile.userTimezone !== userTimezone) {
          userFields.userTimezone = userTimezone;
        }

        if (userLanguage && profile.userLanguage !== userLanguage) {
          userFields.userLanguage = userLanguage;
        }

        if (userValidPhone && profile.userPhone !== userValidPhone) {
          userFields.userPhone = userValidPhone;
        }

        if (profile) {
          await User.findByIdAndUpdate(user.id, {
            $set: userFields,
          });
          return { updateStatus: 'Profile Updated' };
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Query: {
    async getUser(args, _, context) {
      try {
        const user = await auth(context);
        return user;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
