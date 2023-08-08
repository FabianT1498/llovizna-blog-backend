import * as express from 'express';

import { login, forgotPassword } from './../controllers/authController';

const router = express.Router();

router.route('/login').post(login);

router.route('/forgot-password').post(forgotPassword);

export default router;
