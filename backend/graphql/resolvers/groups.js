import User from '../../models/User.js';
import Group from '../../models/Group.js';
import GroupMembers from '../../models/GroupMembers.js';
import { auth } from '../../config/auth.js';
import { validateGroupInput } from '../../utils/validator.js';
import { UserInputError } from 'apollo-server';

export default {
  Query: {
    async getAllUsers(args, _, context) {
      try {
        const user = await auth(context);
        if (user) {
          const userList = await User.find(
            { _id: { $ne: user.id } },
            { userName: 1, userEmail: 1, userPicture: 1 }
          );
          return userList;
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    async getGroupBalance(args, { groupID }, context) {
      try {
        const user = await auth(context);

        if (user) {
          const members = await GroupMembers.find(
            { groupID },
            { _id: 0 }
          ).populate({
            path: 'memberID',
            select: ['userName', 'userEmail'],
          });
          return { members };
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    async myGroups(args, _, context) {
      try {
        const user = await auth(context);
        if (user) {
          const mygroupList = await User.findById(user.id, {
            groups: 1,
            invites: 1,
            iOwe: 1,
            owedToMe: 1,
            _id: 0,
          })
            .populate({
              path: 'groups',
              select: ['groupName'],
            })
            .populate({
              path: 'invites',
              select: ['groupName'],
            })
            .populate({
              path: 'iOwe.memberID',
              select: ['userName', 'userEmail'],
            })
            .populate({
              path: 'owedToMe.memberID',
              select: ['userName', 'userEmail'],
            })
            .populate({
              path: 'owedToMe.groupID',
              select: ['groupName'],
            })
            .populate({
              path: 'iOwe.groupID',
              select: ['groupName'],
            });

          if (!mygroupList) {
            throw new UserInputError(
              'Whoops! You dont belong to any groups yet!'
            );
          }

          return {
            groups: mygroupList.groups,
            invites: mygroupList.invites,
            iOwe: mygroupList.iOwe,

            owedToMe: mygroupList.owedToMe,
          };
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    async createGroup(_, { groupName, groupMembers }, context) {
      const { valid, errors } = validateGroupInput(groupName);
      if (!valid) {
        throw new UserInputError(`Error Occured`, {
          errors,
        });
      }
      try {
        const user = await auth(context);
        if (user) {
          let group = await Group.findOne({
            groupName,
            createdBy: user.id,
          });
          if (group) {
            throw new UserInputError(
              `Whoops! ${groupName} group already exists`
            );
          }
          group = new Group({ groupName, createdBy: user.id });
          const groupID = group.id;
          group.save();
          const member = new GroupMembers({ groupID, memberID: user.id });
          member.save();
          let ids = [];
          if (groupMembers) {
            const memEmails = groupMembers.map((mem) => mem.memberEmail);

            const memIds = await User.find(
              { userEmail: { $in: memEmails } },
              { projection: { _id: 1 } }
            );
            // eslint-disable-next-line no-underscore-dangle
            ids = memIds.map((mem) => mem._id);
          }

          await User.findByIdAndUpdate(user.id, {
            $push: { groups: groupID },
          });
          await User.updateMany(
            { _id: { $in: ids } },
            {
              $push: { invites: groupID },
            }
          );
          return { updateStatus: 'Group Created' };
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    async acceptInvitation(_, { groupID }, context) {
      try {
        const user = await auth(context);
        if (user) {
          const member = new GroupMembers({ groupID, memberID: user.id });
          member.save();
          await User.findByIdAndUpdate(user.id, {
            $addToSet: { groups: groupID },
            $pull: {
              invites: groupID,
            },
          });
          return { updateStatus: 'Invitation Accepted' };
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    async leaveGroup(_, { groupID }, context) {
      try {
        const user = await auth(context);
        if (user) {
          const currentUserBalances = await User.findById(user.id, {
            iOwe: 1,
            owedToMe: 1,
            _id: 0,
          });
          const groups1 = currentUserBalances.iOwe.filter((ele) => {
            return String(ele.groupID) === String(groupID);
          });
          const groups2 = currentUserBalances.owedToMe.filter((ele) => {
            return String(ele.groupID) === String(groupID);
          });

          if (groups1.length || groups2.length) {
            throw new UserInputError(
              `Settle up all the balances before leaving the group`
            );
          }
          await GroupMembers.deleteOne({ groupID, memberID: user.id });
          await User.findByIdAndUpdate(user.id, {
            $pull: { groups: groupID },
          });
          return { updateStatus: 'left from group' };
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
