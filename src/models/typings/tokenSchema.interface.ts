import { Types, Document } from 'mongoose';
import Token from './token.interface';

// user.interface.ts
export default interface PostSchema extends Document, Omit<Token, '_id' | 'userId'> {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
}
