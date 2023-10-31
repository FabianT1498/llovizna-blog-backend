import { Types, Document } from 'mongoose';
import { Models } from '@fabiant1498/social-media-types';

// user.interface.ts
export default interface CommentSchema extends Document, Pick<Models.Comment, 'content'> {
  _id?: Types.ObjectId;
  authorId: Types.ObjectId;
  postId: Types.ObjectId;
  likes: Types.Map<Boolean>;
  parentComment: Types.ObjectId | null;
}
