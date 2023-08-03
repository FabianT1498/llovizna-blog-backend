import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

import { UserRole } from '@fabiant1498/llovizna-blog';

import { User } from '@fabiant1498/llovizna-blog';
import UserModel from '@models/user';

import { createResponse } from '@app/utils/createResponse';
import catchAsync from '../utils/catchAsync';

export const verifyToken = catchAsync(async (req: Request, res: Response, next: any) => {
  const tokenKey: string | undefined = process.env.TOKEN_KEY;
  const key: string = tokenKey || 'default';

  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  try {
    const decoded = jwt.verify(token, key);

    if (decoded && typeof decoded === 'object') {
      const userDoc = await UserModel.findById(decoded.userId);

      if (!userDoc) {
        return res.status(400).send("Authenticated user doesn't exist");
      }

      const user: User = {
        _id: userDoc.id,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        email: userDoc.email,
        role: userDoc.role,
        picturePath: userDoc.picturePath,
        username: userDoc.username,
        password: userDoc.password,
      };

      req.user = user;
    }
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
});

export const verifyRole =
  (allowedRoles: UserRole[]) => (req: Request, res: Response, next: any) => {
    if (!req.user) {
      return res.status(403).json(
        createResponse(false, null, {
          code: 403,
          message: 'User is not authenticated',
        })
      );
    }

    let userRole: UserRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json(
        createResponse(false, null, {
          code: 403,
          message: 'Access not allowed',
        })
      );
    }

    next();
  };
