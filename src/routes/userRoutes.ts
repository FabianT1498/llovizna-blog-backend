import * as express from 'express';

import { upload } from '../config/multerConfig';

import {
  createUser,
  updateUserProfile,
  updateUserRole,
  getUsers,
  updateUserStatus,
} from './../controllers/userController';

import { verifyToken, verifyRole } from '../middleware/auth';
import { removeBodyProps } from '../middleware/removeProperty';

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
  )
  .get(verifyToken, verifyRole(writeGroup), getUsers);

router
  .route('/profile')
  .put(
    verifyToken,
    upload.single('picture'),
    removeBodyProps(['pictureCategory']),
    updateUserProfile
  );

router.route('/:id/status').patch(verifyToken, verifyRole(writeGroup), updateUserStatus);

router.route('/:id/role').patch(verifyToken, verifyRole(writeGroup), updateUserRole);

export default router;
