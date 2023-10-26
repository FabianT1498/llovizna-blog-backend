import * as express from 'express';

import {
  login,
  forgotPassword,
  resetPassword,
  validateResetToken,
} from './../controllers/authController';

const router = express.Router();

router.route('/login').post(login);

router.route('/forgot-password').post(forgotPassword);

router.route('/reset-password').post(resetPassword);

router.route('/reset-password/:token').get(validateResetToken);

export default router;
