import mongoose from 'mongoose';

// user.interface.ts
export default interface Token {
  _id?: string;
  userId: string;
  token: string;
  createdAt: Date;
}
