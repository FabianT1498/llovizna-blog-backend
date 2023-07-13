import * as express from 'express';

import { login } from './../controllers/authController';

const router = express.Router();

// router.route('/register').post(upload.single('picture'), register);

router.route('/login').post(login);

export default router;
