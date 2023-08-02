import * as express from 'express';

import { upload } from '../config/multerConfig';

import { createUser, updateUserProfile } from './../controllers/userController';

import { verifyToken, verifyRole } from './../middleware/authMiddleware';
import { removeBodyProps } from './../middleware/removePropertyMiddleware';

import { UserRole } from '@fabiant1498/llovizna-blog';

const writeGroup: UserRole[] = ['superadmin', 'admin'];

const router = express.Router();

router
  .route('/')
  .post(
    verifyToken,
    verifyRole(writeGroup),
    upload.single('picture'),
    removeBodyProps(['pictureCategory']),
    createUser
  );

router
  .route('/profile')
  .put(
    verifyToken,
    upload.single('picture'),
    removeBodyProps(['pictureCategory']),
    updateUserProfile
  );

export default router;
