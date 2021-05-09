import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { AuthenticationError } from 'apollo-server';
dotenv.config({ path: './config/.env' });

export const auth = async (context) => {
  // context = { ... headers }

  const authHeader = context.req.headers.Authorization;
  if (authHeader) {
    // Bearer ....
    const token = authHeader.split('Bearer ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await User.findById(decoded.user.id).select([
          '-userPassword',
          '-date',
          '-groups',
          '-invites',
          '-iOwe',
          '-owedToMe',
        ]);
        return user;
      } catch (err) {
        throw new AuthenticationError('Invalid/Expired token');
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error('Authorization header must be provided');
};
