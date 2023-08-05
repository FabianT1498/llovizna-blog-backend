import { Schema, model } from 'mongoose';
import UserSchema from './typings/userSchema.interface';

import { UserRole, UserStatus } from '@fabiant1498/llovizna-blog';

const userSchema = new Schema<UserSchema>(
  {
    firstName: { type: String, required: true, default: null },
    lastName: { type: String, required: true, default: null },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    picturePath: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'superadmin', 'editor', 'eventManager'] as UserRole[],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'] as UserStatus[],
    },
    createdAt: {
      type: Schema.Types.Date,
      required: false,
    },
    updatedAt: {
      type: Schema.Types.Date,
      required: false,
    },
    token: { type: String, required: false },
  },

  { timestamps: true }
);

export default model<UserSchema>('user', userSchema);
