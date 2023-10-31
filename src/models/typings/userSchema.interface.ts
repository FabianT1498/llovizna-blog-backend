import { Types, Document } from 'mongoose';
import { User } from '@fabiant1498/llovizna-blog';

// user.interface.ts
export default interface UserSchema extends Document, Omit<User, '_id'> {
  _id?: Types.ObjectId;
}
