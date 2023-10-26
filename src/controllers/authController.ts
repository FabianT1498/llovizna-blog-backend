import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import catchAsync from './../utils/catchAsync';
import UserModel from './../models/user';
import TokenModel from './../models/token';
import { User } from '@fabiant1498/llovizna-blog';

import {
  validateForgotPassword,
  validateLogin,
  validateResetPassword,
} from '@validations/authValidations';

import { createResponse } from '@utils/createResponse';
import { send } from './../config/nodemailer';

const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Our login logic starts here
  try {
    const data: User = req.body ?? {};

    const { value, error } = validateLogin(data);

    // Get user input
    if (error) {
      return next(error);
    }

    // Validate if user exist in our database
    const user = await UserModel.findOne({ email: data.email.toLowerCase() });
    const tokenKey: string | undefined = process.env.TOKEN_KEY;
    const key: string = tokenKey || 'default';

    if (!user) {
      return res.status(400).json(
        createResponse(false, null, {
          code: 400,
          message: 'Invalid credentials',
          fields: { email: 'This email does not correspond to any user' },
        })
      );
    }

    if (user.status === 'inactive') {
      return res.status(403).json(
        createResponse(false, null, {
          code: 403,
          message: "You can't do any action because your user is inactive",
        })
      );
    }

    if (await bcrypt.compare(data.password, user.password)) {
      // Create token
      const token = jwt.sign({ userId: user._id, email: data.email.toLowerCase() }, key, {
        expiresIn: '2h',
      });

      // save user token
      user.token = token;

      // user
      return res.status(200).json(createResponse(true, user, null));
    } else {
      return res.status(400).json(
        createResponse(false, null, {
          code: 400,
          message: 'Invalid credentials',
          fields: { password: 'The password does not match' },
        })
      );
    }
  } catch (err) {
    next(err);
  }
  // Our register logic ends here
});

const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Our login logic starts here
  try {
    const data = req.body ?? {};

    const { error } = validateForgotPassword(data);

    // Get user input
    if (error) {
      return next(error);
    }

    // Validate if user exist in our database
    const user = await UserModel.findOne({ email: data.email.toLowerCase() });

    if (!user) {
      return res.status(400).json(
        createResponse(false, null, {
          code: 400,
          message: 'Invalid credentials',
          fields: { email: 'This email does not correspond to any user' },
        })
      );
    }

    if (user.status === 'inactive') {
      return res.status(403).json(
        createResponse(false, null, {
          code: 403,
          message: "You can't do any action because your user is inactive",
        })
      );
    }

    const tokenKey: string | undefined = process.env.TOKEN_KEY;
    const key: string = tokenKey + user.password;

    const clientUrl: string | undefined = process.env.CLIENT_URL;

    // Create token
    const token = jwt.sign({ userId: user._id, email: data.email.toLowerCase() }, key, {
      expiresIn: '15m',
    });

    let tokenDoc = await TokenModel.findOne({ userId: user._id });
    if (tokenDoc) await TokenModel.deleteOne();

    await new TokenModel({
      userId: user._id,
      token,
      createdAt: Date.now(),
    }).save();

    const link = `${clientUrl}/reset-password?token=${token}&id=${user.id}`;

    const from: string | undefined = process.env.NODEMAILER_AUTH_USER;

    const htmlContent = `
      <h1>¡Hi ${
        user.firstName + ' ' + user.lastName
      }!</h1><p>You requested to reset your password, Please click the link below to reset </p><a href="${link}">Reset password</a>`;

    const mailData = {
      from,
      to: user.email,
      subject: 'Password reset',
      html: htmlContent,
    };
    const responseMailer = await send(mailData);

    return res
      .status(200)
      .json(
        createResponse(
          true,
          { message: 'Link has been sent to your email, please check your inbox.' },
          null
        )
      );
  } catch (err: any) {
    next(err);
  }
  // Our register logic ends here
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body ?? {};

    const { error } = validateResetPassword(data);

    // Get user input
    if (error) {
      return next(error);
    }

    // Validate if user exist in our database
    const user = await UserModel.findOne({ _id: data.userId });

    if (!user) {
      return res.status(400).json(
        createResponse(false, null, {
          code: 400,
          message: 'Invalid credentials',
          fields: { userId: 'This user Id does not correspond to any user' },
        })
      );
    }

    if (user.status === 'inactive') {
      return res.status(403).json(
        createResponse(false, null, {
          code: 403,
          message: "You can't do any action because your user is inactive",
        })
      );
    }

    let passwordResetToken = await TokenModel.findOne({ userId: user._id });
    if (!passwordResetToken) {
      throw new jwt.TokenExpiredError('Invalid or expired password reset token', new Date());
    }

    const tokenKey: string | undefined = process.env.TOKEN_KEY;
    const key: string = tokenKey + user.password || 'default';

    const decoded = jwt.verify(data.token, key);

    if (decoded && typeof decoded === 'object') {
      const encryptedPassword = await bcrypt.hash(data.password, 10);

      await UserModel.findByIdAndUpdate(data.userId, { password: encryptedPassword });

      const from: string | undefined = process.env.NODEMAILER_AUTH_USER;

      const htmlContent = `
      <h1>¡Hi ${
        user.firstName + ' ' + user.lastName
      }!</h1><p>Your password has been changed successfully</p>`;

      const mailData = {
        from,
        to: user.email,
        subject: 'Password changed successfully',
        html: htmlContent,
      };
      await send(mailData);

      await passwordResetToken.deleteOne();

      return res
        .status(200)
        .json(createResponse(true, { message: 'Password has been changed sucessfully' }, null));
    }
  } catch (err: any) {
    next(err);
  }
  // Our register logic ends here
});

const validateResetToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.params ?? {};

    let passwordResetToken = await TokenModel.findOne({ token: data?.token });
    if (!passwordResetToken) {
      return res.status(403).json(
        createResponse(false, null, {
          code: 403,
          message: 'Token is expired or invalid, please request a password reset again',
        })
      );
    }

    return res.status(200).json(createResponse(true, { message: 'Token is valid' }, null));
  } catch (err: any) {
    next(err);
  }
});

export { login, forgotPassword, resetPassword, validateResetToken };
