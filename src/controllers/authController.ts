import { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import catchAsync from './../utils/catchAsync';
import UserModel from './../models/user';
import { User } from '@fabiant1498/llovizna-blog';

import { validateForgotPassword, validateLogin } from '@validations/authValidations';

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
      next(error);
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

    // Create token
    const token = jwt.sign({ userId: user._id, email: data.email.toLowerCase() }, key, {
      expiresIn: '15m',
    });

    const link = `http://localhost:3000/reset-password/${user.id}/${token}`;

    const from: string | undefined = process.env.NODEMAILER_AUTH_USER;

    const mailData = {
      from,
      to: user.email,
      subject: 'Password reset',
      text: `The password reset link for La llovizna runners blog is the following, ${link} 
        This will be valid only for 15 minutes`,
    };
    const responseMailer = await send(mailData);
    console.log(responseMailer);

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
    return res.status(500).json(
      createResponse(false, null, {
        code: 500,
        message: err.message,
      })
    );
  }
  // Our register logic ends here
});

export { login, forgotPassword };
