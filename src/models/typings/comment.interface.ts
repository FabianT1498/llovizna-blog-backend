import mongoose from "mongoose";

// user.interface.ts
export default interface Comment {
  _id?: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  likes: mongoose.Types.Map<Boolean>;
  parentComment: mongoose.Types.ObjectId | null;
  content: string;
}
