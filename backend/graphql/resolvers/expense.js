import Expense from '../../models/Expense.js';
import User from '../../models/User.js';
import Group from '../../models/Group.js';
import GroupMembers from '../../models/GroupMembers.js';
import { auth } from '../../config/auth.js';
import { validateExpenseInput } from '../../utils/validator.js';

const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export default {
  Mutation: {
    async addExpense(args, { groupID, description, amount, date }, context) {
      try {
        const user = await auth(context);
        if (user) {
          const { valid, errors } = validateExpenseInput(description, amount);
          if (!valid) {
            throw new UserInputError(`Error Occured`, {
              errors,
            });
          }
          const expense = new Expense({
            description,
            amount,
            paidByEmail: user.userEmail,
            paidByName: user.userName,
            date,
          });
          expense.save();

          const getGroupMembers = await GroupMembers.find({ groupID });

          const membersExceptMe = getGroupMembers.filter(
            (mem) => String(mem.memberID) !== String(user.id)
          );

          const mybal = roundToTwo(
            amount - roundToTwo(amount / getGroupMembers.length)
          );
          const othersBal = roundToTwo(amount / getGroupMembers.length);

          const groupMemberIdsExceptMe = membersExceptMe.map((mem) => mem._id);

          // Update give balance
          await GroupMembers.updateMany(
            { _id: { $in: groupMemberIdsExceptMe } },
            {
              $inc: { give: othersBal },
            }
          );

          //Update Getback
          await GroupMembers.findOneAndUpdate(
            { groupID, memberID: user.id },
            {
              $inc: { getBack: mybal },
            }
          );

          const membersExceptMeIds = membersExceptMe.map((mem) => mem.memberID);

          // Update owed to me for current user
          membersExceptMe.map(async (mem) => {
            await User.findByIdAndUpdate(user.id, {
              $addToSet: {
                owedToMe: {
                  memberID: mem.memberID,
                  amount: roundToTwo(amount / getGroupMembers.length),
                  groupID,
                },
              },
            });
          });

          // Update IOwe for other members
          await User.updateMany(
            { _id: { $in: membersExceptMeIds } },
            {
              $addToSet: {
                iOwe: {
                  memberID: user.id,
                  amount: roundToTwo(amount / getGroupMembers.length),
                  groupID,
                },
              },
            }
          );

          await Group.findByIdAndUpdate(groupID, {
            $push: {
              expenses: expense._id,
            },
          });

          return { updateStatus: 'Expense Added' };
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Query: {
    async getExpense(args, { groupID }, context) {
      try {
        const user = await auth(context);
        if (user) {
          const groupExpense = await Group.findById(groupID, {
            expenses: 1,
          }).populate({
            path: 'expenses',
            select: [
              'paidByName',
              'paidByEmail',
              'description',
              'amount',
              'date',
            ],
          });

          return { _id: groupExpense._id, expenses: groupExpense.expenses };
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
