import { Request, Response, NextFunction } from 'express';
import { FilterQuery } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as fs from 'fs';

import { UserRole, User, UserStatus } from '@fabiant1498/llovizna-blog';
import { paginate } from '@utils/paginate';
import { createResponse } from '@utils/createResponse';
import catchAsync from './../utils/catchAsync';
import { uploadDirUrl } from '../config/multerConfig';

import UserModel from '@models/user';

import {
  validateGetUser,
  validateCreateUser,
  validateUpdateUser,
  validateUpdateUserRole,
  validateUpdateUserStatus,
} from '@validations/userValidations';

// const formatFriends = (arr: Models.User[]) =>
//   arr.map(({ _id, firstName, lastName, occupation, location, picturePath }: Models.User) => {
//     return {
//       _id,
//       firstName,
//       lastName,
//       occupation,
//       location,
//       picturePath,
//     };
//   });

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user input
    const data: User = req.body ?? {};

    if (req.user) {
      if (
        req.user.role === 'admin' &&
        (['superadmin', 'admin'] as UserRole[]).includes(data.role)
      ) {
        return res.status(403).json(
          createResponse(false, null, {
            code: 403,
            message: 'You are not allowed to create another admin users',
          })
        );
      }

      const { error, value } = validateCreateUser(data);

      if (error) {
        return next(error);
      }

      const file = req.file;
      let fileUrl: string = '';

      if (file) {
        fileUrl = `${uploadDirUrl.profile}/${file.filename}`;
      }

      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(data.password, 10);

      const user: User = {
        ...data,
        picturePath: fileUrl,
        password: encryptedPassword,
        status: 'active'
      };

      const newUser = new UserModel(user);

      await newUser.save();

      res.status(201).json(createResponse<User>(true, user, null));
    }
  } catch (err: any) {
    if (err.name === 'MongoServerError' && err.code === 11000) {
      const file = req.file;
      if (file) {
        const imagePath = path.join(__dirname, `../../${uploadDirUrl.profile}`, file.filename);
        fs.unlinkSync(imagePath);
        console.log('Imagen eliminada debido a un error de duplicación de índice.');
      }
    }

    next(err);
  }
});

const updateUserRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.params ?? {};
    const data = req.body ?? {};

    if (req.user) {
      const { error } = validateUpdateUserRole({ ...data, ...params });

      if (error) {
        return next(error);
      }

      const user = await UserModel.findById(params.id);

      if (!user) {
        return res.status(404).json(
          createResponse(false, null, {
            code: 404,
            message: "User doesn't exist",
          })
        );
      }

      if (user.id === req.user._id) {
        return res.status(403).json(
          createResponse(false, null, {
            code: 403,
            message: 'You cannot update your own user role',
          })
        );
      }

      if (
        req.user.role === 'admin' &&
        (['superadmin', 'admin'] as UserRole[]).includes(data.role)
      ) {
        return res.status(403).json(
          createResponse(false, null, {
            code: 403,
            message: 'You are not allowed to create another admin users',
          })
        );
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        params.id,
        { role: data.role },
        { new: true }
      );

      console.log(updatedUser);

      res.status(201).json(createResponse(true, updatedUser, null));
    }
  } catch (err: any) {
    next(err);
  }
});

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.params ?? {};
    const data = req.body ?? {};

    if (req.user) {
      const { error } = validateUpdateUserStatus({ ...params, ...data });

      if (error) {
        return next(error);
      }

      const user = await UserModel.findById(params.id);

      if (!user) {
        return res.status(404).json(
          createResponse(false, null, {
            code: 404,
            message: "User doesn't exist",
          })
        );
      }

      if (user.id === req.user._id) {
        return res.status(403).json(
          createResponse(false, null, {
            code: 403,
            message: 'You cannot update your own status',
          })
        );
      }

      if (
        req.user.role === 'admin' &&
        (['superadmin', 'admin'] as UserRole[]).includes(user.role)
      ) {
        return res.status(403).json(
          createResponse(false, null, {
            code: 403,
            message: 'You are not allowed to update the status of another admin.',
          })
        );
      }

      const newStatus: UserStatus = data.status as UserStatus;

      const updatedUser = await UserModel.findByIdAndUpdate(
        params.id,
        { status: newStatus },
        { new: true }
      );

      console.log(updatedUser);

      res.status(201).json(createResponse(true, updatedUser, null));
    }
  } catch (err: any) {
    next(err);
  }
});

const updateUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user input
    const data: User = req.body ?? {};

    if (req.user) {
      const { error, value } = validateUpdateUser(data);

      if (error) {
        return next(error);
      }

      const file = req.file;
      let fileUrl: string = '';

      if (file) {
        // The URL of the new profile picture
        fileUrl = `${uploadDirUrl.profile}/${file.filename}`;

        if (req.user.picturePath && req.user.picturePath !== '') {
          // Delete picture profile if there's already exists one
          const currentFilename = __filename;
          const currentDirPath = path.dirname(currentFilename);
          const imagePath = path.join(currentDirPath, '../../', req.user.picturePath);

          if (fs.existsSync(imagePath)) {
            // Eliminar la imagen
            fs.unlinkSync(imagePath);
            console.log('Imagen eliminada correctamente');
          } else {
            console.log('La imagen no existe');
          }
        }
      }

      //Encrypt user password
      const encryptedPassword = await bcrypt.hash(data.password, 10);

      const user: User = {
        ...data,
        password: encryptedPassword,
      };

      if (fileUrl !== '') {
        user.picturePath = fileUrl;
      }

      await UserModel.findByIdAndUpdate(req.user._id, user, { new: true });

      res.status(201).json(createResponse<User>(true, user, null));
    }
  } catch (err: any) {
    next(err);
  }
});

const getUser = catchAsync(async (req: Request, res: Response) => {
  // Our register logic starts here
  try {
    // Get user input
    const data = req.params ?? {};

    const { error, value } = validateGetUser(data);

    if (error) {
      return res.status(400).send(error.details);
    }

    const user = await UserModel.findById(data.id);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// const getUserFriends = catchAsync(async (req: Request, res: Response) => {
//   // Our register logic starts here
//   try {
//     // Get user input
//     const data = req.params ?? {};

//     const { error, value } = validateGetUser(data);

//     if (error) {
//       return res.status(400).send(error.details);
//     }

//     const user: User | null = await UserModel.findById(data.id);

//     const friends =
//       user &&
//       (await UserModel.find({
//         _id: { $in: user.friends },
//       }));

//     const formattedFriends = friends && formatFriends(friends);

//     res.status(200).json(formattedFriends);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// UPDATE
// const addRemoveFriend = catchAsync(async (req: Request, res: Response) => {
//   try {
//     let data = req.body ?? {};

//     let friendData = { id: data.friendId };

//     const { error, value } = validateGetUser(friendData);

//     if (error) {
//       return res.status(400).send(error.details);
//     }

//     if (req.user) {
//       const friend = await UserModel.findById(friendData.id);

//       if (!friend) {
//         return res.status(400).json({ status: 400, message: "Friend doesn't exist" });
//       }

//       const user = await UserModel.findById(req.user._id);

//       if (user) {
//         if (friendData.id === user._id.toString()) {
//           return res.status(400).json({
//             status: 400,
//             message: "You can't add or delete to yourself as friend",
//           });
//         }

//         const index = user.friends.findIndex(
//           ({ _id }: Types.ObjectId) => _id.toString() === friendData.id
//         );

//         if (index !== -1) {
//           user.friends.splice(index, 1);
//         } else {
//           user.friends.push(new Types.ObjectId(friendData.id));
//         }

//         await user?.save();

//         const friends = await UserModel.find({
//           _id: { $in: user.friends },
//         });

//         return res.status(200).json(formatFriends(friends));
//       }
//     }
//   } catch (err: any) {
//     res.status(404).json({ message: err.message });
//   }
// });

// const getAuthUser = (req: Request, res: Response) => {
//   const user = req.user;
//   const response = createResponse(true, user, null);

//   res.status(200).json(response);
// };

const getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.query;

    const statuses: UserStatus[] = ['active', 'inactive'] as UserStatus[];
    const adminAllowedRoles: UserRole[] = ['eventManager', 'editor'] as UserRole[];
    const superadminAllowedRoles: UserRole[] = [
      'eventManager',
      'editor',
      'admin',
      'superadmin',
    ] as UserRole[];

    if (req.user) {
      let { page, pageSize } = params;

      const authRole: UserRole = req.user.role;

      const statusIsString = params?.status && typeof params.status === 'string';
      const status: UserStatus | 'ALL' = statusIsString
        ? statuses.includes(params.status as UserStatus)
          ? (params.status as UserStatus)
          : 'ALL'
        : 'ALL';

      const roleIsString = params?.role && typeof params.role === 'string';
      const role: UserRole | 'ALL' = roleIsString
        ? authRole === 'admin' && adminAllowedRoles.includes(params.role as UserRole)
          ? (params.role as UserRole)
          : authRole === 'superadmin' && superadminAllowedRoles.includes(params.role as UserRole)
          ? (params.role as UserRole)
          : 'ALL'
        : 'ALL';

      const username: string =
        params?.username && typeof params.username === 'string' ? params.username : '';
      const fullName: string =
        params?.fullName && typeof params.fullName === 'string' ? params.fullName : '';

      const userQuery: FilterQuery<typeof UserModel> = {};

      if (status !== 'ALL') {
        userQuery.status = status;
      }

      if (role === 'ALL') {
        if (authRole === 'admin') {
          userQuery.role = { $in: ['eventManager', 'editor'] as UserRole[] };
        }
      } else {
        userQuery.role = role;
      }

      if (username !== '') {
        userQuery.username = { $regex: username, $options: 'i' };
      }

      if (fullName !== '') {
        const fullNameArr = fullName.split(' ');
        const firstName = fullNameArr[0];
        const lastName = fullNameArr[1];

        userQuery.firstName = { $regex: firstName, $options: 'i' };

        if (lastName !== undefined && lastName !== '') {
          userQuery.lastName = { $regex: lastName, $options: 'i' };
        }
      }

      userQuery._id = { $ne: req.user._id };

      let query = UserModel.find(userQuery).sort({ createdAt: -1 });

      let pageValidated: string | number = page && typeof page === 'string' ? page : 1;
      let pageSizeValidated: string | number =
        pageSize && typeof pageSize === 'string' ? pageSize : 10;

      let result = await paginate(query, pageValidated, pageSizeValidated);

      res.status(201).json(createResponse(true, result, null));
    }
  } catch (err: any) {
    console.log(err);
    return next(err);
  }
});

const updateUser = catchAsync(async (req: Request, res: Response) => {});

const deleteUser = catchAsync(async (req: Request, res: Response) => {});

export { createUser, updateUserProfile, updateUserRole, getUsers, updateUserStatus };
