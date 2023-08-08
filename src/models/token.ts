import { Schema, model } from 'mongoose';
import TokenSchema from './typings/tokenSchema.interface';

const tokenSchema = new Schema<TokenSchema>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // this is the expiry time in seconds
  },
});

export default model('token', tokenSchema);
