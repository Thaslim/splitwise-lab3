import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { UserInputError } from 'apollo-server';
import {
  validateRegisterInput,
  validateLoginInput,
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
            'Whoops! We couldn’t find an account for that email address and password',
            {
              errors: [
                {
                  msg:
                    'Whoops! We couldn’t find an account for that email address and password',
                },
              ],
            }
          );
        }

        // Compare password
        const matchPwd = await bcrypt.compare(userPassword, user.userPassword);

        if (!matchPwd) {
          throw new UserInputError(
            'Whoops! We couldn’t find an account for that email address and password',
            {
              errors: [
                {
                  msg:
                    'Whoops! We couldn’t find an account for that email address and password',
                },
              ],
            }
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
        throw new UserInputError('Errors', {
          errors,
        });
      }
      try {
        // See if user exists
        let newUser = await User.findOne({ userEmail });

        if (newUser) {
          throw new UserInputError(
            `${userEmail} already belongs to another account.`,
            {
              errors: [
                { msg: `${userEmail} already belongs to another account.` },
              ],
            }
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
  },

  Query: {},
};
