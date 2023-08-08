import * as express from 'express';

import { login, forgotPassword, resetPassword } from './../controllers/authController';

const router = express.Router();

router.route('/login').post(login);

router.route('/forgot-password').post(forgotPassword);

router.route('/reset-password').post(resetPassword);

export default router;
