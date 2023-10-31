import { Types, Document } from 'mongoose';
import { Models } from '@fabiant1498/llovizna-blog';

// user.interface.ts
export default interface PostSchema extends Document, Omit<Models.Post, '_id' | 'authorId'> {
  _id?: Types.ObjectId;
  authorId: Types.ObjectId;
}
